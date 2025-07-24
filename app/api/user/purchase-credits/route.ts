import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import Stripe from "stripe"

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    "sk_test_51PP2n4GZumt4oiwzavau2e6hAfiEu4fHk9Sy80AQ3QBgwXwOW5meV280Vn4NvVRsL5Ad4L0zXFDhUalyQn8hbUHv00VxACFgs7",
  {
    apiVersion: "2024-12-18.acacia",
  },
)

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { credits } = await request.json()

    if (!credits || credits !== 20) {
      return NextResponse.json({ error: "Invalid credits amount" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Resume Credits",
              description: "20 additional resume credits",
            },
            unit_amount: 500, // $5.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}?payment=cancelled`,
      metadata: {
        user_id: user.id.toString(),
        credits: credits.toString(),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
