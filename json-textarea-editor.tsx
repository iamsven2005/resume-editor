"use client"

import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { useResumeEditor } from "./hooks/use-resume-editor"
import { generatePDFFromMarkdown } from "./utils/pdf-generator"
import { generateId } from "./utils/conversion"
import { downloadHtml, downloadJson, downloadMarkdown } from "./utils/file-export"
import { DataInputPanel } from "./components/data-input-panel"
import { FormEditorPanel } from "./components/form-editor-panel"
import { PDFPreviewPanel } from "./components/pdf-preview-panel"
import type { Section, ContentItem, TabType, ResumeData } from "./types/resume"

export default function JsonTextareaEditor() {
  const {
    jsonString,
    setJsonString,
    markdownString,
    setMarkdownString,
    htmlString,
    setHtmlString,
    parsedData,
    parseError,
    activeTab,
    setActiveTab,
    clipboard,
    setClipboard,
    editingField,
    setEditingField,
    updateJsonFromData,
    convertToMarkdown,
    convertToJson,
    convertToHtml,
    convertFromHtml,
  } = useResumeEditor()

  const [isExporting, setIsExporting] = useState(false)

  // Handle resume upload from PDF
  const handleResumeUploaded = (data: ResumeData) => {
    updateJsonFromData(data)
    setActiveTab("json")
    toast({
      description: "Resume uploaded and processed successfully!",
    })
  }

  // Handle file downloads
  const handleDownloadFile = (format: TabType) => {
    if (!parsedData) {
      toast({
        variant: "destructive",
        description: "No data to download",
      })
      return
    }

    try {
      switch (format) {
        case "json":
          downloadJson(jsonString, parsedData.title)
          toast({
            description: "JSON file downloaded successfully",
          })
          break
        case "markdown":
          downloadMarkdown(markdownString, parsedData.title)
          toast({
            description: "Markdown file downloaded successfully",
          })
          break
        case "html":
          downloadHtml(htmlString, parsedData.title)
          toast({
            description: "HTML file downloaded successfully",
          })
          break
        default:
          toast({
            variant: "destructive",
            description: "Unknown file format",
          })
      }
    } catch (error) {
      console.error("Error downloading file:", error)
      toast({
        variant: "destructive",
        description: "Error downloading file. Please try again.",
      })
    }
  }

  // Handle HTML download from preview panel
  const handleDownloadHtmlFromPreview = () => {
    handleDownloadFile("html")
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

  // Start editing field label
  const startEditingFieldLabel = (sectionIndex: number, contentIndex: number, key: string) => {
    setEditingField({
      sectionIndex,
      contentIndex,
      originalKey: key,
      newKey: key,
    })
  }

  // Handle field label change
  const handleFieldLabelChange = (newKey: string) => {
    if (editingField) {
      setEditingField({
        ...editingField,
        newKey,
      })
    }
  }

  // Save field label change
  const saveFieldLabelChange = () => {
    if (editingField && parsedData) {
      const { sectionIndex, contentIndex, originalKey, newKey } = editingField

      // Don't save if the key is empty or unchanged
      if (!newKey.trim() || newKey === originalKey) {
        setEditingField(null)
        return
      }

      const newSections = [...parsedData.sections]
      const contentItem = { ...newSections[sectionIndex].content[contentIndex] }

      // Create a new object with the updated key
      const updatedItem: ContentItem = {}
      Object.entries(contentItem).forEach(([key, value]) => {
        if (key === originalKey) {
          updatedItem[newKey] = value
        } else {
          updatedItem[key] = value
        }
      })

      newSections[sectionIndex].content[contentIndex] = updatedItem

      updateJsonFromData({
        ...parsedData,
        sections: newSections,
      })

      setEditingField(null)
      toast({
        description: `Field renamed from "${originalKey}" to "${newKey}"`,
      })
    }
  }

  // Cancel field label editing
  const cancelFieldLabelEditing = () => {
    setEditingField(null)
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

  // Add field to content item
  const addFieldToContentItem = (sectionIndex: number, contentIndex: number) => {
    if (parsedData) {
      const newSections = [...parsedData.sections]
      const newContent = [...newSections[sectionIndex].content]
      newContent[contentIndex] = {
        ...newContent[contentIndex],
        "New Field": "",
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

  // Delete field from content item
  const deleteFieldFromContentItem = (sectionIndex: number, contentIndex: number, field: string) => {
    if (parsedData) {
      const newSections = [...parsedData.sections]
      const newContent = { ...newSections[sectionIndex].content[contentIndex] }

      // Don't delete if it's the only field
      if (Object.keys(newContent).length <= 1) {
        toast({
          variant: "destructive",
          description: "Cannot delete the only field in an item",
        })
        return
      }

      delete newContent[field]
      newSections[sectionIndex].content[contentIndex] = newContent

      updateJsonFromData({
        ...parsedData,
        sections: newSections,
      })

      toast({
        description: `Field "${field}" deleted`,
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

  // Export to PDF using markdown-based generation
  const exportToPDF = async () => {
    if (!parsedData) return

    setIsExporting(true)
    try {
      const pdf = await generatePDFFromMarkdown(parsedData)
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
        {/* Input Panel with Tabs */}
        <DataInputPanel
          jsonString={jsonString}
          markdownString={markdownString}
          htmlString={htmlString}
          activeTab={activeTab}
          parseError={parseError}
          resumeTitle={parsedData?.title || "resume"}
          onJsonChange={setJsonString}
          onMarkdownChange={setMarkdownString}
          onHtmlChange={setHtmlString}
          onTabChange={setActiveTab}
          onConvertToMarkdown={convertToMarkdown}
          onConvertToJson={convertToJson}
          onConvertToHtml={convertToHtml}
          onConvertFromHtml={convertFromHtml}
          onDownloadFile={handleDownloadFile}
          onResumeUploaded={handleResumeUploaded}
        />

        {/* Form View */}
        <FormEditorPanel
          parsedData={parsedData}
          editingField={editingField}
          clipboard={clipboard}
          onTitleChange={handleTitleChange}
          onSectionNameChange={handleSectionNameChange}
          onFieldChange={handleContentFieldChange}
          onStartEditingLabel={startEditingFieldLabel}
          onSaveLabel={saveFieldLabelChange}
          onCancelLabel={cancelFieldLabelEditing}
          onLabelChange={handleFieldLabelChange}
          onDeleteField={deleteFieldFromContentItem}
          onAddField={addFieldToContentItem}
          onAddSection={addSection}
          onAddContentItem={addContentItem}
          onCopySection={copySection}
          onDeleteSection={deleteSection}
          onPasteSection={pasteSection}
          onCopyItem={copyContentItem}
          onDeleteItem={deleteContentItem}
          onPasteItem={pasteContentItem}
          onDragEnd={handleDragEnd}
        />

        {/* PDF Preview */}
        <PDFPreviewPanel
          parsedData={parsedData}
          isExporting={isExporting}
          onExportPDF={exportToPDF}
          onDownloadHtml={handleDownloadHtmlFromPreview}
        />
      </div>
    </div>
  )
}
