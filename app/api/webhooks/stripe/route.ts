import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import Stripe from "stripe"

const sql = neon(process.env.NEON_NEON_NEON_DATABASE_URL!)
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    "sk_test_51PP2n4GZumt4oiwzavau2e6hAfiEu4fHk9Sy80AQ3QBgwXwOW5meV280Vn4NvVRsL5Ad4L0zXFDhUalyQn8hbUHv00VxACFgs7",
  {
    apiVersion: "2024-12-18.acacia",
  },
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_dkCAkMPSvsyZMkM3e0vzKF8KipvDuv2i"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      const userId = Number.parseInt(session.metadata?.user_id || "0")
      const credits = Number.parseInt(session.metadata?.credits || "0")

      if (userId && credits) {
        // Add credits to user account
        await sql`
          UPDATE user_credits
          SET remaining_credits = remaining_credits + ${credits},
              purchased_credits = purchased_credits + ${credits},
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${userId}
        `

        console.log(`Added ${credits} credits to user ${userId}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 400 })
  }
}
