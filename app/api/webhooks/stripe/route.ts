import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import Stripe from "stripe"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key", {
  apiVersion: "2024-06-20",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder_secret"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const credits = Number.parseInt(session.metadata?.credits || "20")

      if (userId) {
        // Add credits to user account
        await sql`
          UPDATE user_credits
          SET remaining_credits = remaining_credits + ${credits},
              purchased_credits = purchased_credits + ${credits},
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${Number.parseInt(userId)}
        `

        console.log(`Added ${credits} credits to user ${userId}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}
