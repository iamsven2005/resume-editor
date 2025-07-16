import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Terms and Conditions</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using this resume builder application ("Service"), you accept and agree to be bound by
              the terms and provision of this agreement.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Our Service provides tools for creating, editing, and managing professional resumes and portfolios. We
              offer AI-powered suggestions, PDF generation, and portfolio hosting capabilities.
            </p>

            <h2>3. User Accounts</h2>
            <p>To use certain features of our Service, you must register for an account. You are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Updating your information to keep it current</li>
            </ul>

            <h2>4. User Content</h2>
            <p>You retain ownership of all content you submit to our Service, including:</p>
            <ul>
              <li>Resume data and personal information</li>
              <li>Uploaded files and documents</li>
              <li>Portfolio content and customizations</li>
            </ul>
            <p>
              By using our Service, you grant us a limited license to use your content solely for providing and
              improving our services.
            </p>

            <h2>5. Prohibited Uses</h2>
            <p>You may not use our Service to:</p>
            <ul>
              <li>Upload malicious software or harmful content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>

            <h2>6. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no method of
              transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2>7. Service Availability</h2>
            <p>
              We strive to maintain high availability of our Service but do not guarantee uninterrupted access. We may
              temporarily suspend the Service for maintenance or updates.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use of the Service.
            </p>

            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your account at any time for violations of these terms. Upon termination, your
              right to use the Service will cease immediately.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of significant changes via
              email or through the Service.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which
              our company is incorporated.
            </p>

            <h2>12. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us through our support
              channels.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
