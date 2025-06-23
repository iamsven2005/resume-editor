"use client"

import { useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import type { ResumeData } from "../types/resume"

interface PDFPreviewPanelProps {
  parsedData: ResumeData | null
  isExporting: boolean
  onExportPDF: () => void
}

export const PDFPreviewPanel = ({ parsedData, isExporting, onExportPDF }: PDFPreviewPanelProps) => {
  const previewRef = useRef<HTMLDivElement>(null)

  const getFieldByPattern = (item: any, patterns: string[]) => {
    return Object.keys(item).find((key) => patterns.some((pattern) => key.toLowerCase().includes(pattern)))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Preview
          </CardTitle>
          <Button
            onClick={onExportPDF}
            disabled={!parsedData || isExporting}
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {parsedData ? (
          <div
            ref={previewRef}
            className="bg-white text-black p-8 shadow-lg min-h-[500px] max-h-[600px] overflow-y-auto border"
            style={{
              fontFamily: "Times, serif",
              fontSize: "14px",
              lineHeight: "1.4",
            }}
          >
            {/* Resume Header */}
            <div className="text-center mb-6 border-b-2 border-black pb-4">
              <h1 className="text-2xl font-bold mb-2">{parsedData.title}</h1>
            </div>

            {/* Resume Sections */}
            {parsedData.sections.map((section, sectionIndex) => (
              <div key={section.id} className="mb-6">
                <h2 className="text-lg font-bold mb-3 text-black border-b border-gray-400 pb-1">
                  {section["section name"].toUpperCase()}
                </h2>

                <div className="space-y-4">
                  {section.content.map((item, itemIndex) => {
                    // Find key fields by name pattern
                    const jobTitleKey = getFieldByPattern(item, ["title", "position"])
                    const organizationKey = getFieldByPattern(item, ["organization", "company"])
                    const durationKey = getFieldByPattern(item, ["duration", "period", "date"])
                    const descriptionKey = getFieldByPattern(item, ["description", "summary"])
                    const degreeKey = getFieldByPattern(item, ["degree", "education"])
                    const gpaKey = getFieldByPattern(item, ["gpa", "grade"])
                    const categoryKey = getFieldByPattern(item, ["category", "type"])
                    const skillsKey = getFieldByPattern(item, ["skills", "abilities"])

                    return (
                      <div key={itemIndex} className="mb-4">
                        {jobTitleKey && (
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-semibold text-black">{item[jobTitleKey]}</h3>
                              {durationKey && <span className="text-sm text-gray-600">{item[durationKey]}</span>}
                            </div>
                            {organizationKey && (
                              <p className="font-medium text-gray-700 mb-2">{item[organizationKey]}</p>
                            )}
                            {descriptionKey && (
                              <p className="text-sm text-gray-800 leading-relaxed">{item[descriptionKey]}</p>
                            )}
                          </div>
                        )}

                        {degreeKey && !jobTitleKey && (
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-semibold text-black">{item[degreeKey]}</h3>
                              {durationKey && <span className="text-sm text-gray-600">{item[durationKey]}</span>}
                            </div>
                            {organizationKey && (
                              <p className="font-medium text-gray-700 mb-1">{item[organizationKey]}</p>
                            )}
                            {gpaKey && <p className="text-sm text-gray-600">GPA: {item[gpaKey]}</p>}
                          </div>
                        )}

                        {categoryKey && skillsKey && !jobTitleKey && !degreeKey && (
                          <div>
                            <h3 className="font-semibold text-black mb-1">{item[categoryKey]}:</h3>
                            <p className="text-sm text-gray-800">{item[skillsKey]}</p>
                          </div>
                        )}

                        {/* Generic fallback for other field types */}
                        {!jobTitleKey && !degreeKey && !categoryKey && (
                          <div className="space-y-1">
                            {Object.entries(item).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium text-black">{key}:</span>{" "}
                                <span className="text-gray-800">{value as string}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8 min-h-[500px] flex items-center justify-center">
            <div>
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter valid data to see the PDF preview</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
