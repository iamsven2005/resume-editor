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

// Convert JSON to HTML
export const jsonToHtml = (data: ResumeData): string => {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: bold;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 1.4em;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid #666;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .item {
            margin-bottom: 20px;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 5px;
        }
        .item-title {
            font-weight: bold;
            font-size: 1.1em;
        }
        .item-duration {
            font-size: 0.9em;
            color: #666;
        }
        .item-organization {
            font-weight: bold;
            color: #555;
            margin-bottom: 8px;
        }
        .item-description {
            text-align: justify;
            line-height: 1.5;
        }
        .skills-item {
            margin-bottom: 10px;
        }
        .skills-category {
            font-weight: bold;
            display: inline;
        }
        .skills-list {
            display: inline;
        }
        .generic-field {
            margin-bottom: 5px;
        }
        .field-label {
            font-weight: bold;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${data.title}</h1>
    </div>
`

  data.sections.forEach((section) => {
    html += `    <div class="section">
        <h2 class="section-title">${section["section name"]}</h2>
`

    section.content.forEach((item) => {
      // Find key fields by name pattern
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

      html += `        <div class="item">
`

      if (jobTitleKey) {
        html += `            <div class="item-header">
                <div class="item-title">${item[jobTitleKey]}</div>
`
        if (durationKey && item[durationKey]) {
          html += `                <div class="item-duration">${item[durationKey]}</div>
`
        }
        html += `            </div>
`
        if (organizationKey && item[organizationKey]) {
          html += `            <div class="item-organization">${item[organizationKey]}</div>
`
        }
        if (descriptionKey && item[descriptionKey]) {
          html += `            <div class="item-description">${item[descriptionKey]}</div>
`
        }
      } else if (degreeKey) {
        html += `            <div class="item-header">
                <div class="item-title">${item[degreeKey]}</div>
`
        if (durationKey && item[durationKey]) {
          html += `                <div class="item-duration">${item[durationKey]}</div>
`
        }
        html += `            </div>
`
        if (organizationKey && item[organizationKey]) {
          html += `            <div class="item-organization">${item[organizationKey]}</div>
`
        }
        if (gpaKey && item[gpaKey]) {
          html += `            <div class="item-description">GPA: ${item[gpaKey]}</div>
`
        }
      } else if (categoryKey && skillsKey) {
        html += `            <div class="skills-item">
                <span class="skills-category">${item[categoryKey]}:</span>
                <span class="skills-list"> ${item[skillsKey]}</span>
            </div>
`
      } else {
        // Generic handling
        Object.entries(item).forEach(([key, value]) => {
          html += `            <div class="generic-field"><span class="field-label">${key}:</span> ${value}</div>
`
        })
      }

      html += `        </div>
`
    })

    html += `    </div>
`
  })

  html += `</body>
</html>`

  return html
}

// Convert HTML to JSON - FIXED IMPLEMENTATION
export const htmlToJson = (html: string): ResumeData => {
  try {
    // Create a temporary DOM parser
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")

    // Extract title
    const titleElement = doc.querySelector("h1")
    const title = titleElement ? titleElement.textContent?.trim() || "Untitled Resume" : "Untitled Resume"

    const sections: Section[] = []

    // Extract sections
    const sectionElements = doc.querySelectorAll(".section")

    sectionElements.forEach((sectionEl) => {
      const sectionTitleEl = sectionEl.querySelector(".section-title")
      const sectionName = sectionTitleEl ? sectionTitleEl.textContent?.trim() || "Untitled Section" : "Untitled Section"

      const content: ContentItem[] = []
      const itemElements = sectionEl.querySelectorAll(".item")

      itemElements.forEach((itemEl) => {
        const item: ContentItem = {}

        // Try to extract structured data
        const titleEl = itemEl.querySelector(".item-title")
        const durationEl = itemEl.querySelector(".item-duration")
        const organizationEl = itemEl.querySelector(".item-organization")
        const descriptionEl = itemEl.querySelector(".item-description")

        if (titleEl && titleEl.textContent?.trim()) {
          item["job title"] = titleEl.textContent.trim()
        }
        if (durationEl && durationEl.textContent?.trim()) {
          item["Duration"] = durationEl.textContent.trim()
        }
        if (organizationEl && organizationEl.textContent?.trim()) {
          item["Organization"] = organizationEl.textContent.trim()
        }
        if (descriptionEl && descriptionEl.textContent?.trim()) {
          item["Description"] = descriptionEl.textContent.trim()
        }

        // Handle skills format
        const skillsEl = itemEl.querySelector(".skills-category")
        if (skillsEl && skillsEl.parentElement) {
          const fullText = skillsEl.parentElement.textContent || ""
          const categoryText = skillsEl.textContent || ""
          const skillsText = fullText.replace(categoryText + ":", "").trim()
          if (categoryText && skillsText) {
            item["Category"] = categoryText
            item["Skills"] = skillsText
          }
        }

        // Handle generic fields
        const genericFields = itemEl.querySelectorAll(".generic-field")
        genericFields.forEach((fieldEl) => {
          const labelEl = fieldEl.querySelector(".field-label")
          if (labelEl && labelEl.textContent) {
            const label = labelEl.textContent.replace(":", "").trim()
            const fullText = fieldEl.textContent || ""
            const value = fullText.replace(labelEl.textContent, "").trim()
            if (label && value) {
              item[label] = value
            }
          }
        })

        // If no structured data found, try to extract from text content
        if (Object.keys(item).length === 0) {
          const textContent = itemEl.textContent?.trim()
          if (textContent) {
            // Try to parse as key-value pairs
            const lines = textContent.split("\n").filter((line) => line.trim())
            lines.forEach((line) => {
              const colonIndex = line.indexOf(":")
              if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim()
                const value = line.substring(colonIndex + 1).trim()
                if (key && value) {
                  item[key] = value
                }
              }
            })

            // If still no structured data, add as generic content
            if (Object.keys(item).length === 0) {
              item["Content"] = textContent
            }
          }
        }

        // Only add item if it has content
        if (Object.keys(item).length > 0) {
          content.push(item)
        }
      })

      // Add section if it has content
      if (content.length > 0) {
        sections.push({
          "section name": sectionName,
          content,
          id: generateId(),
        })
      }
    })

    // If no sections found, try to parse as simple HTML
    if (sections.length === 0) {
      // Look for any h2 elements as section headers
      const h2Elements = doc.querySelectorAll("h2")
      h2Elements.forEach((h2) => {
        const sectionName = h2.textContent?.trim() || "Section"
        const content: ContentItem[] = []

        // Get content after this h2 until the next h2
        let nextElement = h2.nextElementSibling
        let textContent = ""

        while (nextElement && nextElement.tagName !== "H2") {
          if (nextElement.textContent?.trim()) {
            textContent += nextElement.textContent.trim() + "\n"
          }
          nextElement = nextElement.nextElementSibling
        }

        if (textContent.trim()) {
          content.push({
            Content: textContent.trim(),
          })
        }

        if (content.length > 0) {
          sections.push({
            "section name": sectionName,
            content,
            id: generateId(),
          })
        }
      })
    }

    // If still no sections, create a generic one with all content
    if (sections.length === 0) {
      const bodyText = doc.body?.textContent?.trim()
      if (bodyText) {
        sections.push({
          "section name": "Content",
          content: [
            {
              Content: bodyText,
            },
          ],
          id: generateId(),
        })
      }
    }

    return { title, sections }
  } catch (error) {
    console.error("Error parsing HTML:", error)
    // Return a fallback structure
    return {
      title: "HTML Parse Error",
      sections: [
        {
          "section name": "Error",
          content: [
            {
              Note: "Failed to parse HTML. Please check the HTML format and try again.",
            },
          ],
          id: generateId(),
        },
      ],
    }
  }
}
