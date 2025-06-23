"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Code, FileCode } from "lucide-react"

interface DataInputPanelProps {
  jsonString: string
  markdownString: string
  activeTab: "json" | "markdown"
  parseError: string
  onJsonChange: (value: string) => void
  onMarkdownChange: (value: string) => void
  onTabChange: (tab: "json" | "markdown") => void
  onConvertToMarkdown: () => void
  onConvertToJson: () => void
}

export const DataInputPanel = ({
  jsonString,
  markdownString,
  activeTab,
  parseError,
  onJsonChange,
  onMarkdownChange,
  onTabChange,
  onConvertToMarkdown,
  onConvertToJson,
}: DataInputPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Data Input</CardTitle>
          <div className="flex space-x-2">
            {activeTab === "json" ? (
              <Button variant="outline" size="sm" onClick={onConvertToMarkdown} className="flex items-center gap-1">
                <FileCode className="h-4 w-4" />
                To Markdown
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onConvertToJson} className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                To JSON
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="markdown" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Markdown
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="mt-4">
            <Textarea
              value={jsonString}
              onChange={(e) => onJsonChange(e.target.value)}
              className="font-mono text-sm min-h-[500px]"
              placeholder="Enter your JSON here..."
            />
          </TabsContent>

          <TabsContent value="markdown" className="mt-4">
            <Textarea
              value={markdownString}
              onChange={(e) => onMarkdownChange(e.target.value)}
              className="font-mono text-sm min-h-[500px]"
              placeholder="Enter your Markdown here..."
            />
          </TabsContent>
        </Tabs>

        {parseError && (
          <Alert className="mt-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
