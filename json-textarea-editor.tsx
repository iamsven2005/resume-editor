"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Download, FileText, Trash2, Copy, Clipboard, GripVertical, Plus } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { toast } from "@/components/ui/use-toast"

interface ContentItem {
  "job title"?: string
  Organization?: string
  [key: string]: any
}

interface Section {
  "section name": string
  content: ContentItem[]
  id: string // Unique ID for drag and drop
}

interface ResumeData {
  title: string
  sections: Section[]
}

// Generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 9)

export default function JsonTextareaEditor() {
  const [jsonString, setJsonString] = useState(`{
  "title": "John Doe - Software Engineer",
  "sections": [
    {
      "section name": "Experience",
      "content": [
        {
          "job title": "Software Engineering Intern",
          "Organization": "Google",
          "Duration": "June 2023 - August 2023",
          "Description": "Developed scalable web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions."
        },
        {
          "job title": "Frontend Developer",
          "Organization": "Microsoft",
          "Duration": "September 2023 - Present",
          "Description": "Built responsive user interfaces and improved application performance by 40%. Led code reviews and mentored junior developers."
        }
      ],
      "id": "exp-123"
    },
    {
      "section name": "Education", 
      "content": [
        {
          "Degree": "Bachelor of Science in Computer Science",
          "Organization": "Stanford University",
          "Duration": "2020 - 2024",
          "GPA": "3.8/4.0"
        }
      ],
      "id": "edu-456"
    },
    {
      "section name": "Skills",
      "content": [
        {
          "Category": "Programming Languages",
          "Skills": "JavaScript, TypeScript, Python, Java, C++"
        },
        {
          "Category": "Frameworks & Libraries", 
          "Skills": "React, Next.js, Node.js, Express, Django"
        }
      ],
      "id": "skills-789"
    }
  ]
}`)

  const [parsedData, setParsedData] = useState<ResumeData | null>(null)
  const [parseError, setParseError] = useState<string>("")
  const [isExporting, setIsExporting] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const [clipboard, setClipboard] = useState<{
    type: "section" | "content"
    data: Section | ContentItem | null
  }>({
    type: "section",
    data: null,
  })

  // Parse JSON when jsonString changes
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonString)

      // Ensure all sections have IDs
      if (parsed.sections) {
        parsed.sections = parsed.sections.map((section: any) => ({
          ...section,
          id: section.id || generateId(),
        }))
      }

      setParsedData(parsed)
      setParseError("")
    } catch (error) {
      setParseError("Invalid JSON format")
      setParsedData(null)
    }
  }, [jsonString])

  // Update JSON when parsed data changes
  const updateJsonFromData = (newData: ResumeData) => {
    setParsedData(newData)
    setJsonString(JSON.stringify(newData, null, 2))
  }

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    if (parsedData) {
      updateJsonFromData({
        ...parsedData,
        title: newTitle,
      })
    }
  }

  // Handle section name change
  const handleSectionNameChange = (sectionIndex: number, newName: string) => {
    if (parsedData) {
      const newSections = [...parsedData.sections]
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        "section name": newName,
      }
      updateJsonFromData({
        ...parsedData,
        sections: newSections,
      })
    }
  }

  // Handle content field change
  const handleContentFieldChange = (sectionIndex: number, contentIndex: number, field: string, value: string) => {
    if (parsedData) {
      const newSections = [...parsedData.sections]
      const newContent = [...newSections[sectionIndex].content]
      newContent[contentIndex] = {
        ...newContent[contentIndex],
        [field]: value,
      }
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        content: newContent,
      }
      updateJsonFromData({
        ...parsedData,
        sections: newSections,
      })
    }
  }

  // Add new section
  const addSection = () => {
    if (parsedData) {
      const newSection: Section = {
        "section name": "New Section",
        content: [
          {
            "job title": "",
            Organization: "",
          },
        ],
        id: generateId(),
      }
      updateJsonFromData({
        ...parsedData,
        sections: [...parsedData.sections, newSection],
      })
    }
  }

  // Add content item to section
  const addContentItem = (sectionIndex: number) => {
    if (parsedData) {
      const newSections = [...parsedData.sections]
      newSections[sectionIndex].content.push({
        "job title": "",
        Organization: "",
      })
      updateJsonFromData({
        ...parsedData,
        sections: newSections,
      })
    }
  }

  // Delete section
  const deleteSection = (sectionIndex: number) => {
    if (parsedData) {
      const newSections = [...parsedData.sections]
      newSections.splice(sectionIndex, 1)
      updateJsonFromData({
        ...parsedData,
        sections: newSections,
      })
      toast({
        description: "Section deleted successfully",
      })
    }
  }

  // Delete content item
  const deleteContentItem = (sectionIndex: number, contentIndex: number) => {
    if (parsedData) {
      const newSections = [...parsedData.sections]
      const newContent = [...newSections[sectionIndex].content]
      newContent.splice(contentIndex, 1)

      // If no content items left, add an empty one
      if (newContent.length === 0) {
        newContent.push({
          "job title": "",
          Organization: "",
        })
      }

      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        content: newContent,
      }
      updateJsonFromData({
        ...parsedData,
        sections: newSections,
      })
      toast({
        description: "Content item deleted successfully",
      })
    }
  }

  // Copy section
  const copySection = (sectionIndex: number) => {
    if (parsedData) {
      const sectionToCopy = {
        ...parsedData.sections[sectionIndex],
        id: generateId(), // Generate new ID for the copy
      }
      setClipboard({
        type: "section",
        data: sectionToCopy,
      })
      toast({
        description: `Section "${sectionToCopy["section name"]}" copied to clipboard`,
      })
    }
  }

  // Copy content item
  const copyContentItem = (sectionIndex: number, contentIndex: number) => {
    if (parsedData) {
      const contentToCopy = { ...parsedData.sections[sectionIndex].content[contentIndex] }
      setClipboard({
        type: "content",
        data: contentToCopy,
      })
      toast({
        description: "Content item copied to clipboard",
      })
    }
  }

  // Paste section
  const pasteSection = (afterIndex: number) => {
    if (parsedData && clipboard.type === "section" && clipboard.data) {
      const newSections = [...parsedData.sections]
      newSections.splice(afterIndex + 1, 0, clipboard.data as Section)
      updateJsonFromData({
        ...parsedData,
        sections: newSections,
      })
      toast({
        description: "Section pasted successfully",
      })
    }
  }

  // Paste content item
  const pasteContentItem = (sectionIndex: number, afterIndex: number) => {
    if (parsedData && clipboard.type === "content" && clipboard.data) {
      const newSections = [...parsedData.sections]
      const newContent = [...newSections[sectionIndex].content]
      newContent.splice(afterIndex + 1, 0, clipboard.data as ContentItem)
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        content: newContent,
      }
      updateJsonFromData({
        ...parsedData,
        sections: newSections,
      })
      toast({
        description: "Content item pasted successfully",
      })
    }
  }

  // Handle drag end for sections
  const handleDragEnd = (result: any) => {
    if (!result.destination || !parsedData) return

    if (result.type === "section") {
      const sections = Array.from(parsedData.sections)
      const [reorderedSection] = sections.splice(result.source.index, 1)
      sections.splice(result.destination.index, 0, reorderedSection)

      updateJsonFromData({
        ...parsedData,
        sections,
      })
    } else if (result.type === "content") {
      // Extract section index from droppableId (format: "content-{sectionIndex}")
      const sectionIndex = Number.parseInt(result.source.droppableId.split("-")[1])
      const destSectionIndex = Number.parseInt(result.destination.droppableId.split("-")[1])

      // If moving within the same section
      if (sectionIndex === destSectionIndex) {
        const newSections = [...parsedData.sections]
        const content = Array.from(newSections[sectionIndex].content)
        const [reorderedItem] = content.splice(result.source.index, 1)
        content.splice(result.destination.index, 0, reorderedItem)

        newSections[sectionIndex] = {
          ...newSections[sectionIndex],
          content,
        }

        updateJsonFromData({
          ...parsedData,
          sections: newSections,
        })
      } else {
        // Moving between different sections
        const newSections = [...parsedData.sections]
        const sourceContent = Array.from(newSections[sectionIndex].content)
        const destContent = Array.from(newSections[destSectionIndex].content)

        const [movedItem] = sourceContent.splice(result.source.index, 1)
        destContent.splice(result.destination.index, 0, movedItem)

        newSections[sectionIndex] = {
          ...newSections[sectionIndex],
          content: sourceContent,
        }

        newSections[destSectionIndex] = {
          ...newSections[destSectionIndex],
          content: destContent,
        }

        updateJsonFromData({
          ...parsedData,
          sections: newSections,
        })
      }
    }
  }

  // Export to PDF
  const exportToPDF = async () => {
    if (!previewRef.current || !parsedData) return

    setIsExporting(true)
    try {
      // Dynamic import of jsPDF and html2canvas
      const jsPDF = (await import("jspdf")).default
      const html2canvas = (await import("html2canvas")).default

      const element = previewRef.current

      // Create canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")

      // Calculate dimensions
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4")
      let position = 0

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Save the PDF
      const filename = `${parsedData.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
      pdf.save(filename)

      toast({
        description: "PDF exported successfully",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        variant: "destructive",
        description: "Error exporting PDF. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">JSON Resume Editor with PDF Preview</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* JSON Input */}
        <Card>
          <CardHeader>
            <CardTitle>JSON Input</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jsonString}
              onChange={(e) => setJsonString(e.target.value)}
              className="font-mono text-sm min-h-[500px]"
              placeholder="Enter your JSON here..."
            />
            {parseError && (
              <Alert className="mt-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{parseError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Form View */}
        <Card>
          <CardHeader>
            <CardTitle>Form Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
            {parsedData ? (
              <>
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Textarea
                    id="title"
                    value={parsedData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="mt-1"
                    rows={1}
                  />
                </div>

                {/* Sections */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Sections</Label>
                    <Button onClick={addSection} size="sm" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Add Section
                    </Button>
                  </div>

                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="sections" type="section">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                          {parsedData.sections.map((section, sectionIndex) => (
                            <Draggable key={section.id} draggableId={section.id} index={sectionIndex}>
                              {(provided) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="border-2 relative group"
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="absolute left-2 top-3 cursor-grab opacity-50 group-hover:opacity-100"
                                  >
                                    <GripVertical className="h-5 w-5" />
                                  </div>

                                  <CardHeader className="pb-3 pr-20">
                                    <div className="absolute right-3 top-3 flex space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => copySection(sectionIndex)}
                                        title="Copy section"
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteSection(sectionIndex)}
                                        title="Delete section"
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>

                                    <div>
                                      <Label htmlFor={`section-${sectionIndex}`}>Section Name</Label>
                                      <Textarea
                                        id={`section-${sectionIndex}`}
                                        value={section["section name"]}
                                        onChange={(e) => handleSectionNameChange(sectionIndex, e.target.value)}
                                        className="mt-1"
                                        rows={1}
                                      />
                                    </div>
                                  </CardHeader>

                                  <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <Label className="font-medium">Content Items</Label>
                                      <div className="flex space-x-2">
                                        {clipboard.type === "section" && clipboard.data && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => pasteSection(sectionIndex)}
                                            className="flex items-center gap-1 text-xs"
                                            title="Paste section after this one"
                                          >
                                            <Clipboard className="h-3 w-3" />
                                            Paste Section
                                          </Button>
                                        )}
                                        <Button
                                          onClick={() => addContentItem(sectionIndex)}
                                          size="sm"
                                          variant="secondary"
                                          className="flex items-center gap-1 text-xs"
                                        >
                                          <Plus className="h-3 w-3" />
                                          Add Item
                                        </Button>
                                      </div>
                                    </div>

                                    <Droppable droppableId={`content-${sectionIndex}`} type="content">
                                      {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                          {section.content.map((contentItem, contentIndex) => (
                                            <Draggable
                                              key={`${section.id}-content-${contentIndex}`}
                                              draggableId={`${section.id}-content-${contentIndex}`}
                                              index={contentIndex}
                                            >
                                              {(provided) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  className="grid grid-cols-1 gap-2 p-3 border rounded-md bg-muted/50 relative group"
                                                >
                                                  <div
                                                    {...provided.dragHandleProps}
                                                    className="absolute left-2 top-2 cursor-grab opacity-50 group-hover:opacity-100"
                                                  >
                                                    <GripVertical className="h-4 w-4" />
                                                  </div>

                                                  <div className="absolute right-2 top-2 flex space-x-1">
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={() => copyContentItem(sectionIndex, contentIndex)}
                                                      title="Copy content item"
                                                      className="h-6 w-6"
                                                    >
                                                      <Copy className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={() => deleteContentItem(sectionIndex, contentIndex)}
                                                      title="Delete content item"
                                                      className="text-destructive hover:text-destructive h-6 w-6"
                                                    >
                                                      <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                  </div>

                                                  <div className="pl-6 pr-16 pt-2">
                                                    {Object.entries(contentItem).map(([field, value]) => (
                                                      <div key={field} className="mb-3">
                                                        <Label
                                                          htmlFor={`${sectionIndex}-${contentIndex}-${field}`}
                                                          className="text-sm"
                                                        >
                                                          {field}
                                                        </Label>
                                                        <Textarea
                                                          id={`${sectionIndex}-${contentIndex}-${field}`}
                                                          value={value as string}
                                                          onChange={(e) =>
                                                            handleContentFieldChange(
                                                              sectionIndex,
                                                              contentIndex,
                                                              field,
                                                              e.target.value,
                                                            )
                                                          }
                                                          className="mt-1"
                                                          rows={field === "Description" ? 3 : 1}
                                                        />
                                                      </div>
                                                    ))}
                                                  </div>

                                                  {clipboard.type === "content" && clipboard.data && (
                                                    <div className="flex justify-end mt-2">
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => pasteContentItem(sectionIndex, contentIndex)}
                                                        className="flex items-center gap-1 text-xs"
                                                        title="Paste content item after this one"
                                                      >
                                                        <Clipboard className="h-3 w-3" />
                                                        Paste Item
                                                      </Button>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </Draggable>
                                          ))}
                                          {provided.placeholder}
                                        </div>
                                      )}
                                    </Droppable>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter valid JSON to see the form view</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PDF Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                PDF Preview
              </CardTitle>
              <Button
                onClick={exportToPDF}
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
                      {section.content.map((item, itemIndex) => (
                        <div key={itemIndex} className="mb-4">
                          {/* Handle different content types */}
                          {item["job title"] && (
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold text-black">{item["job title"]}</h3>
                                {item.Duration && <span className="text-sm text-gray-600">{item.Duration}</span>}
                              </div>
                              {item.Organization && (
                                <p className="font-medium text-gray-700 mb-2">{item.Organization}</p>
                              )}
                              {item.Description && (
                                <p className="text-sm text-gray-800 leading-relaxed">{item.Description}</p>
                              )}
                            </div>
                          )}

                          {item.Degree && (
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold text-black">{item.Degree}</h3>
                                {item.Duration && <span className="text-sm text-gray-600">{item.Duration}</span>}
                              </div>
                              {item.Organization && (
                                <p className="font-medium text-gray-700 mb-1">{item.Organization}</p>
                              )}
                              {item.GPA && <p className="text-sm text-gray-600">GPA: {item.GPA}</p>}
                            </div>
                          )}

                          {item.Category && (
                            <div>
                              <h3 className="font-semibold text-black mb-1">{item.Category}:</h3>
                              <p className="text-sm text-gray-800">{item.Skills}</p>
                            </div>
                          )}

                          {/* Generic fallback for other field types */}
                          {!item["job title"] && !item.Degree && !item.Category && (
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
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8 min-h-[500px] flex items-center justify-center">
                <div>
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter valid JSON to see the PDF preview</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
