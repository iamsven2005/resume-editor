import Link from "next/link"
import { BugReportDialog } from "./bug-report-dialog"
import { FeatureRequestDialog } from "./feature-request-dialog"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Resume Builder</h3>
            <p className="text-sm text-muted-foreground">
              Create professional resumes and portfolios with AI-powered assistance.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3">Support</h4>
            <div className="space-y-2">
              <div>
                <BugReportDialog />
              </div>
              <div>
                <FeatureRequestDialog />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Connect</h4>
            <p className="text-sm text-muted-foreground">Follow us for updates and tips on creating better resumes.</p>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Resume Builder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
