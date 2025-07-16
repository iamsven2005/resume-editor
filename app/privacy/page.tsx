import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <h2>1. Information We Collect</h2>

            <h3>Personal Information</h3>
            <p>When you create an account, we collect:</p>
            <ul>
              <li>Name and email address</li>
              <li>Resume and portfolio content</li>
              <li>Professional information (work experience, education, skills)</li>
              <li>Contact information you choose to include</li>
            </ul>

            <h3>Technical Information</h3>
            <p>We automatically collect:</p>
            <ul>
              <li>IP address and browser information</li>
              <li>Device and operating system details</li>
              <li>Usage patterns and feature interactions</li>
              <li>Error logs and performance data</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and maintain our resume building services</li>
              <li>Generate PDFs and host your portfolio</li>
              <li>Provide AI-powered suggestions and improvements</li>
              <li>Send important service updates and notifications</li>
              <li>Improve our services and develop new features</li>
              <li>Provide customer support</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share information in the
              following circumstances:
            </p>
            <ul>
              <li>
                <strong>Service Providers:</strong> With trusted third-party services that help us operate our platform
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to protect our rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
              </li>
            </ul>

            <h2>4. Data Storage and Security</h2>
            <p>Your data is stored securely using industry-standard practices:</p>
            <ul>
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Secure database storage with access controls</li>
              <li>Regular security audits and updates</li>
              <li>Limited employee access on a need-to-know basis</li>
            </ul>

            <h2>5. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul>
              <li>
                <strong>Access:</strong> Request a copy of your personal data
              </li>
              <li>
                <strong>Correction:</strong> Update or correct inaccurate information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your account and data
              </li>
              <li>
                <strong>Portability:</strong> Export your data in a standard format
              </li>
              <li>
                <strong>Opt-out:</strong> Unsubscribe from marketing communications
              </li>
            </ul>

            <h2>6. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Maintain your login session</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns</li>
              <li>Improve user experience</li>
            </ul>
            <p>You can control cookie settings through your browser preferences.</p>

            <h2>7. Third-Party Services</h2>
            <p>Our service integrates with third-party providers for:</p>
            <ul>
              <li>
                <strong>AI Services:</strong> OpenAI for resume analysis and suggestions
              </li>
              <li>
                <strong>File Storage:</strong> Vercel Blob for document storage
              </li>
              <li>
                <strong>Database:</strong> Neon for data storage
              </li>
              <li>
                <strong>Analytics:</strong> Usage analytics and error tracking
              </li>
            </ul>

            <h2>8. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide services. You can
              request account deletion at any time, after which we will delete your data within 30 days, except where
              retention is required by law.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13. We do not knowingly collect personal information from
              children under 13. If we become aware of such collection, we will delete the information immediately.
            </p>

            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure
              appropriate safeguards are in place to protect your data during such transfers.
            </p>

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by email
              or through our service. Your continued use of the service after such modifications constitutes acceptance
              of the updated policy.
            </p>

            <h2>12. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
            <ul>
              <li>Through our in-app support system</li>
              <li>By using the bug report or feature request forms</li>
              <li>Via email at the address provided in your account settings</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
