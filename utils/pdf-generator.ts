import type { ResumeData } from "../types/resume"

// Generate PDF from markdown using jsPDF
export const generatePDFFromMarkdown = async (data: ResumeData): Promise<any> => {
  const jsPDF = (await import("jspdf")).default

  const pdf = new jsPDF("p", "mm", "a4")
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const lineHeight = 6
  const maxWidth = pageWidth - 2 * margin

  let yPosition = margin

  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize: number, fontStyle = "normal", indent = 0) => {
    pdf.setFontSize(fontSize)
    pdf.setFont("helvetica", fontStyle)

    const lines = pdf.splitTextToSize(text, maxWidth - indent)

    for (const line of lines) {
      // Check if we need a new page
      if (yPosition + lineHeight > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }

      pdf.text(line, margin + indent, yPosition)
      yPosition += lineHeight
    }
  }

  // Add spacing
  const addSpacing = (space: number = lineHeight) => {
    yPosition += space
    if (yPosition > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }
  }

  // Title
  addText(data.title, 20, "bold")
  addSpacing(lineHeight * 2)

  // Add a line under title
  pdf.setLineWidth(0.5)
  pdf.line(margin, yPosition - lineHeight, pageWidth - margin, yPosition - lineHeight)
  addSpacing(lineHeight)

  // Sections
  data.sections.forEach((section, sectionIndex) => {
    // Section header
    addText(section["section name"].toUpperCase(), 14, "bold")
    addSpacing(lineHeight * 0.5)

    // Add underline for section
    pdf.setLineWidth(0.3)
    pdf.line(margin, yPosition - lineHeight * 0.5, pageWidth - margin, yPosition - lineHeight * 0.5)
    addSpacing(lineHeight)

    // Section content
    section.content.forEach((item, itemIndex) => {
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

      if (jobTitleKey) {
        // Job title with duration
        const jobTitle = item[jobTitleKey]
        if (durationKey && item[durationKey]) {
          // Split title and duration for better formatting
          addText(jobTitle, 12, "bold")
          pdf.setFontSize(10)
          pdf.setFont("helvetica", "normal")
          const durationWidth = pdf.getTextWidth(`(${item[durationKey]})`)
          pdf.text(`(${item[durationKey]})`, pageWidth - margin - durationWidth, yPosition - lineHeight)
        } else {
          addText(jobTitle, 12, "bold")
        }
        addSpacing(lineHeight * 0.3)

        if (organizationKey && item[organizationKey]) {
          addText(item[organizationKey], 11, "bold")
          addSpacing(lineHeight * 0.3)
        }

        if (descriptionKey && item[descriptionKey]) {
          addText(item[descriptionKey], 10, "normal", 5)
          addSpacing(lineHeight * 0.5)
        }
      } else if (degreeKey) {
        // Education entry
        const degree = item[degreeKey]
        if (durationKey && item[durationKey]) {
          addText(degree, 12, "bold")
          pdf.setFontSize(10)
          pdf.setFont("helvetica", "normal")
          const durationWidth = pdf.getTextWidth(`(${item[durationKey]})`)
          pdf.text(`(${item[durationKey]})`, pageWidth - margin - durationWidth, yPosition - lineHeight)
        } else {
          addText(degree, 12, "bold")
        }
        addSpacing(lineHeight * 0.3)

        if (organizationKey && item[organizationKey]) {
          addText(item[organizationKey], 11, "bold")
          addSpacing(lineHeight * 0.3)
        }

        if (gpaKey && item[gpaKey]) {
          addText(`GPA: ${item[gpaKey]}`, 10, "normal", 5)
          addSpacing(lineHeight * 0.3)
        }
      } else if (categoryKey && skillsKey) {
        // Skills entry
        addText(`${item[categoryKey]}: ${item[skillsKey]}`, 10, "normal")
        addSpacing(lineHeight * 0.3)
      } else {
        // Generic content
        Object.entries(item).forEach(([key, value]) => {
          addText(`${key}: ${value}`, 10, "normal")
          addSpacing(lineHeight * 0.3)
        })
      }

      // Add spacing between items
      if (itemIndex < section.content.length - 1) {
        addSpacing(lineHeight * 0.5)
      }
    })

    // Add spacing between sections
    if (sectionIndex < data.sections.length - 1) {
      addSpacing(lineHeight * 1.5)
    }
  })

  return pdf
}
