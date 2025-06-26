// File export utilities for downloading different formats

export const downloadJson = (jsonString: string, title: string) => {
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${sanitizeFilename(title)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const downloadMarkdown = (markdownString: string, title: string) => {
  const blob = new Blob([markdownString], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${sanitizeFilename(title)}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const downloadHtml = (htmlString: string, title: string) => {
  const blob = new Blob([htmlString], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${sanitizeFilename(title)}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Helper function to sanitize filename
const sanitizeFilename = (filename: string): string => {
  return (
    filename
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "") || "resume"
  )
}
