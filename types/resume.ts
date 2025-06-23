export interface ContentItem {
  [key: string]: any
}

export interface Section {
  "section name": string
  content: ContentItem[]
  id: string
}

export interface ResumeData {
  title: string
  sections: Section[]
}

export interface EditingField {
  sectionIndex: number
  contentIndex: number
  originalKey: string
  newKey: string
}

export interface ClipboardData {
  type: "section" | "content"
  data: Section | ContentItem | null
}

// Update the tab type to include HTML
export type TabType = "json" | "markdown" | "html"
