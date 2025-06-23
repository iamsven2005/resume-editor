"use client"

import { useState, useEffect } from "react"
import type { ResumeData, EditingField, ClipboardData } from "../types/resume"
import { jsonToMarkdown, markdownToJson, generateId } from "../utils/conversion"
import { toast } from "@/components/ui/use-toast"

const defaultResumeData = `{
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
}`

export const useResumeEditor = () => {
  const [jsonString, setJsonString] = useState(defaultResumeData)
  const [markdownString, setMarkdownString] = useState("")
  const [parsedData, setParsedData] = useState<ResumeData | null>(null)
  const [parseError, setParseError] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"json" | "markdown">("json")
  const [clipboard, setClipboard] = useState<ClipboardData>({
    type: "section",
    data: null,
  })
  const [editingField, setEditingField] = useState<EditingField | null>(null)

  // Parse JSON when jsonString changes
  useEffect(() => {
    if (activeTab === "json") {
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

        // Update markdown when JSON changes
        setMarkdownString(jsonToMarkdown(parsed))
      } catch (error) {
        setParseError("Invalid JSON format")
        setParsedData(null)
      }
    }
  }, [jsonString, activeTab])

  // Parse Markdown when markdownString changes
  useEffect(() => {
    if (activeTab === "markdown") {
      try {
        const parsed = markdownToJson(markdownString)
        setParsedData(parsed)
        setParseError("")

        // Update JSON when markdown changes
        setJsonString(JSON.stringify(parsed, null, 2))
      } catch (error) {
        setParseError("Error parsing markdown")
        setParsedData(null)
      }
    }
  }, [markdownString, activeTab])

  // Update JSON when parsed data changes
  const updateJsonFromData = (newData: ResumeData) => {
    setParsedData(newData)
    setJsonString(JSON.stringify(newData, null, 2))
    setMarkdownString(jsonToMarkdown(newData))
  }

  // Convert JSON to Markdown
  const convertToMarkdown = () => {
    if (parsedData) {
      const markdown = jsonToMarkdown(parsedData)
      setMarkdownString(markdown)
      setActiveTab("markdown")
      toast({
        description: "Converted to Markdown successfully",
      })
    }
  }

  // Convert Markdown to JSON
  const convertToJson = () => {
    try {
      const data = markdownToJson(markdownString)
      setParsedData(data)
      setJsonString(JSON.stringify(data, null, 2))
      setActiveTab("json")
      toast({
        description: "Converted to JSON successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Error converting markdown to JSON",
      })
    }
  }

  return {
    // State
    jsonString,
    setJsonString,
    markdownString,
    setMarkdownString,
    parsedData,
    parseError,
    activeTab,
    setActiveTab,
    clipboard,
    setClipboard,
    editingField,
    setEditingField,

    // Actions
    updateJsonFromData,
    convertToMarkdown,
    convertToJson,
  }
}
