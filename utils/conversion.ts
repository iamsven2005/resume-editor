import type { ResumeData, Section, ContentItem } from "../types/resume"

// Generate a unique ID
export const generateId = () => Math.random().toString(36).substring(2, 9)

// Convert JSON to Markdown
export const jsonToMarkdown = (data: ResumeData): string => {
  let markdown = `# ${data.title}\n\n`

  data.sections.forEach((section) => {
    markdown += `## ${section["section name"]}\n\n`

    section.content.forEach((item) => {
      // Get the job title field (could be customized)
      const jobTitleKey = Object.keys(item).find(
        (key) => key.toLowerCase().includes("title") || key.toLowerCase().includes("position"),
      )
      const organizationKey = Object.keys(item).find(
        (key) => key.toLowerCase().includes("organization") || key.toLowerCase().includes("company"),
      )
      const durationKey = Object.keys(item).find(
        (key) =>
          key.toLowerCase().includes("duration") ||
          key.toLowerCase().includes("period") ||
          key.toLowerCase().includes("date"),
      )
      const descriptionKey = Object.keys(item).find(
        (key) => key.toLowerCase().includes("description") || key.toLowerCase().includes("summary"),
      )
      const degreeKey = Object.keys(item).find(
        (key) => key.toLowerCase().includes("degree") || key.toLowerCase().includes("education"),
      )
      const gpaKey = Object.keys(item).find(
        (key) => key.toLowerCase().includes("gpa") || key.toLowerCase().includes("grade"),
      )
      const categoryKey = Object.keys(item).find(
        (key) => key.toLowerCase().includes("category") || key.toLowerCase().includes("type"),
      )
      const skillsKey = Object.keys(item).find(
        (key) => key.toLowerCase().includes("skills") || key.toLowerCase().includes("abilities"),
      )

      if (jobTitleKey) {
        markdown += `### ${item[jobTitleKey]}`
        if (durationKey && item[durationKey]) {
          markdown += ` (${item[durationKey]})`
        }
        markdown += "\n\n"

        if (organizationKey && item[organizationKey]) {
          markdown += `**${item[organizationKey]}**\n\n`
        }

        if (descriptionKey && item[descriptionKey]) {
          markdown += `${item[descriptionKey]}\n\n`
        }
      } else if (degreeKey) {
        markdown += `### ${item[degreeKey]}`
        if (durationKey && item[durationKey]) {
          markdown += ` (${item[durationKey]})`
        }
        markdown += "\n\n"

        if (organizationKey && item[organizationKey]) {
          markdown += `**${item[organizationKey]}**\n\n`
        }

        if (gpaKey && item[gpaKey]) {
          markdown += `GPA: ${item[gpaKey]}\n\n`
        }
      } else if (categoryKey && skillsKey) {
        markdown += `**${item[categoryKey]}:** ${item[skillsKey]}\n\n`
      } else {
        // Generic handling
        Object.entries(item).forEach(([key, value]) => {
          markdown += `**${key}:** ${value}\n\n`
        })
      }
    })

    markdown += "\n"
  })

  return markdown.trim()
}

// Convert Markdown to JSON
export const markdownToJson = (markdown: string): ResumeData => {
  const lines = markdown.split("\n")
  let title = "Untitled Resume"
  const sections: Section[] = []
  let currentSection: Section | null = null
  let currentItem: ContentItem = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith("# ")) {
      title = line.substring(2)
    } else if (line.startsWith("## ")) {
      // Save previous section if exists
      if (currentSection && Object.keys(currentItem).length > 0) {
        currentSection.content.push(currentItem)
        currentItem = {}
      }
      if (currentSection) {
        sections.push(currentSection)
      }

      // Start new section
      currentSection = {
        "section name": line.substring(3),
        content: [],
        id: generateId(),
      }
    } else if (line.startsWith("### ")) {
      // Save previous item if exists
      if (currentSection && Object.keys(currentItem).length > 0) {
        currentSection.content.push(currentItem)
      }

      // Start new item
      const titleMatch = line.substring(4).match(/^(.+?)(?:\s*$$(.+)$$)?$/)
      if (titleMatch) {
        currentItem = {
          "job title": titleMatch[1],
          ...(titleMatch[2] && { Duration: titleMatch[2] }),
        }
      } else {
        currentItem = { "job title": line.substring(4) }
      }
    } else if (line.startsWith("**") && line.endsWith("**") && !line.includes(":")) {
      // Organization or similar
      const text = line.substring(2, line.length - 2)
      currentItem.Organization = text
    } else if (line.startsWith("**") && line.includes(":")) {
      // Key-value pair
      const match = line.match(/\*\*(.+?):\*\*\s*(.+)/)
      if (match) {
        const key = match[1]
        const value = match[2]

        if (key === "GPA") {
          currentItem.GPA = value
        } else if (key.toLowerCase().includes("skill")) {
          currentItem.Category = key
          currentItem.Skills = value
        } else {
          currentItem[key] = value
        }
      }
    } else if (line && !line.startsWith("#") && !line.startsWith("**")) {
      // Description or other content
      if (currentItem.Description) {
        currentItem.Description += " " + line
      } else {
        currentItem.Description = line
      }
    }
  }

  // Save final section and item
  if (currentSection && Object.keys(currentItem).length > 0) {
    currentSection.content.push(currentItem)
  }
  if (currentSection) {
    sections.push(currentSection)
  }

  return { title, sections }
}
