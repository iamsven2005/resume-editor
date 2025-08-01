"use client"
import Link from "next/link"
import { BugReportDialog } from "./bug-report-dialog"
import { FeatureRequestDialog } from "./feature-request-dialog"
import {Button} from "@/components/ui/button"
import { useState } from "react"

export function Footer() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-center py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed((prev) => !prev)}
            className="text-xs"
          >
            {collapsed ? "Show Footer" : "Hide Footer"}
          </Button>
        </div>

        {!collapsed && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-4">
          <div>
            <h3 className="font-semibold mb-4">SparkJob</h3>
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
              <div>
              <Button variant="outline" size="sm">
              <Link href="/jobs">
          Job-board
              </Link>
              </Button>
              <Button variant="outline" size="sm">
              <Link href="/topics">
              Topics
              </Link>
              </Button>
              </div>
              <div>
              <Button variant="outline" size="sm">
              <Link href="/patch">
              Patches
              </Link>
              </Button>
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
          </>
        )}
      </div>
    </footer>
  )
}
