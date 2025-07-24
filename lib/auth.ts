import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export interface User {
  id: number
  email: string
  name?: string
  created_at: string
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    return getUserById(payload.userId)
  } catch (error) {
    return null
  }
}

export async function createUser(email: string, password: string, name?: string): Promise<AuthResult> {
  try {
    const hashedPassword = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email}, ${hashedPassword}, ${name})
      RETURNING id, email, name, created_at
    `

    if (result.length === 0) {
      return { success: false, error: "Failed to create user" }
    }

    return { success: true, user: result[0] as User }
  } catch (error: any) {
    if (error.message?.includes("duplicate key")) {
      return { success: false, error: "Email already exists" }
    }
    return { success: false, error: "Failed to create user" }
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await sql`
      SELECT id, email, name, password_hash, created_at
      FROM users
      WHERE email = ${email}
    `

    if (result.length === 0) {
      return { success: false, error: "Invalid credentials" }
    }

    const user = result[0] as User & { password_hash: string }
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return { success: false, error: "Invalid credentials" }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
    }
  } catch (error) {
    return { success: false, error: "Authentication failed" }
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, created_at
      FROM users
      WHERE id = ${id}
    `

    return result.length > 0 ? (result[0] as User) : null
  } catch (error) {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    return getUserById(payload.userId)
  } catch (error) {
    return null
  }
}

// Export auth function for compatibility
export const auth = getCurrentUser
