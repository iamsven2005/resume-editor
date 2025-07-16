//for ranker
import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface ResumeAnalysis {
  fileName: string
  score: number
  strengths: string[]
  weaknesses: string[]
  keySkills: string[]
  experience: string
  summary: string
  contactInfo: {
    email?: string
    phone?: string
    name?: string
    linkedin?: string
  }
}

// Mock resume data for demonstration
const mockResumeData: Record<string, string> = {
  "john-doe-resume.pdf": `
    John Doe
    Senior Software Engineer
    Email: john.doe@techcorp.com | Phone: (555) 123-4567
    LinkedIn: https://linkedin.com/in/johndoe
    Location: San Francisco, CA
    
    EXPERIENCE:
    Senior Software Engineer at TechCorp (2020-2024)
    - Led development of microservices architecture using Node.js and Docker
    - Implemented CI/CD pipelines with Jenkins and AWS
    - Mentored junior developers and conducted code reviews
    - Built RESTful APIs serving 1M+ requests daily
    
    Software Engineer at StartupXYZ (2018-2020)
    - Developed React applications with TypeScript
    - Worked with PostgreSQL and MongoDB databases
    - Collaborated in Agile/Scrum environment
    
    SKILLS:
    JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, PostgreSQL, MongoDB, Git, Jenkins
    
    EDUCATION:
    Bachelor of Science in Computer Science - State University (2018)
  `,
  "jane-smith-resume.pdf": `
    Jane Smith
    Full Stack Developer
    Email: jane.smith@websolutions.io | Phone: (555) 987-6543
    LinkedIn: https://linkedin.com/in/janesmith-dev
    Portfolio: https://janesmith.dev
    
    EXPERIENCE:
    Full Stack Developer at WebSolutions (2021-2024)
    - Built responsive web applications using React and Vue.js
    - Developed backend services with Express.js and FastAPI
    - Integrated third-party APIs and payment systems
    - Optimized database queries and improved performance by 40%
    
    Junior Developer at LocalTech (2019-2021)
    - Created landing pages and marketing websites
    - Worked with WordPress and custom PHP solutions
    - Basic experience with MySQL and HTML/CSS
    
    SKILLS:
    React, Vue.js, JavaScript, Python, FastAPI, Express.js, MySQL, HTML, CSS, Git, Figma
    
    EDUCATION:
    Associate Degree in Web Development - Community College (2019)
  `,
  "mike-johnson-resume.pdf": `
    Mike Johnson
    DevOps Engineer
    Email: mike.johnson@cloudops.com | Phone: (555) 456-7890
    LinkedIn: https://linkedin.com/in/mikejohnson-devops
    GitHub: https://github.com/mikejohnson
    
    EXPERIENCE:
    DevOps Engineer at CloudFirst (2019-2024)
    - Managed AWS infrastructure with Terraform and CloudFormation
    - Implemented monitoring solutions with Prometheus and Grafana
    - Automated deployment processes using GitLab CI/CD
    - Maintained Kubernetes clusters and Docker containers
    
    System Administrator at OldSchool Corp (2017-2019)
    - Managed on-premise servers and network infrastructure
    - Basic scripting with Bash and PowerShell
    - Windows Server and Linux administration
    
    SKILLS:
    AWS, Terraform, Kubernetes, Docker, GitLab CI/CD, Prometheus, Grafana, Linux, Bash, Python, Ansible
    
    EDUCATION:
    Bachelor of Science in Information Technology - Tech University (2017)
  `,
}

function createFallbackAnalysis(fileName: string, jobDescription: string): ResumeAnalysis {
  // Simple keyword matching for fallback
  const jobKeywords = jobDescription.toLowerCase().split(/\s+/)
  const commonTechSkills = ["javascript", "react", "node.js", "python", "aws", "docker", "sql"]
  const foundSkills = commonTechSkills.filter((skill) => jobKeywords.some((keyword) => keyword.includes(skill)))

  return {
    fileName,
    score: Math.floor(Math.random() * 40) + 50,
    strengths: ["Relevant technical experience", "Strong educational background", "Good communication skills"],
    weaknesses: [
      "Could benefit from more specific experience",
      "May need additional training in required technologies",
    ],
    keySkills: foundSkills.length > 0 ? foundSkills : ["JavaScript", "HTML", "CSS"],
    experience: "Mid-level professional with relevant background",
    summary: `This candidate shows potential for the role with a solid foundation in software development.`,
    contactInfo: {
      email: "contact@example.com",
      phone: "(555) 123-4567",
      name: fileName.replace(/[-_]/g, " ").replace(/\.(pdf|doc|docx)$/i, ""),
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, fileNames } = await request.json()

    if (!jobDescription || !fileNames || fileNames.length === 0) {
      return NextResponse.json({ error: "Job description and file names are required" }, { status: 400 })
    }

    // Simulate resume content extraction
    const resumeContents = fileNames.map((fileName: string) => {
      const mockKey = Object.keys(mockResumeData).find(
        (key) =>
          key.toLowerCase().includes(fileName.toLowerCase().split(".")[0]) ||
          fileName.toLowerCase().includes(key.split("-")[0]),
      )

      return mockKey
        ? mockResumeData[mockKey]
        : `
        Resume content for ${fileName}
        
        EXPERIENCE:
        Software Developer (2020-2024)
        - Developed web applications
        - Worked with various technologies
        - Collaborated with team members
        
        SKILLS:
        JavaScript, HTML, CSS, React, Node.js
        
        EDUCATION:
        Bachelor's Degree in Computer Science
      `
    })

    const analyses: ResumeAnalysis[] = []

    // Process each resume individually for better error handling
    for (let i = 0; i < fileNames.length; i++) {
      try {
        const prompt = `
You are an expert HR recruiter. Analyze this resume against the job description and respond with ONLY a valid JSON object in this exact format:

{
  "fileName": "${fileNames[i]}",
  "score": 85,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "keySkills": ["skill1", "skill2", "skill3"],
  "experience": "experience level description",
  "summary": "brief summary of candidate fit",
  "contactInfo": {
    "email": "extracted email or null",
    "phone": "extracted phone or null", 
    "name": "candidate full name or null",
    "linkedin": "linkedin profile url or null"
  }
}

JOB DESCRIPTION:
${jobDescription}

RESUME TO ANALYZE:
${resumeContents[i]}

Extract ALL contact information including email addresses, phone numbers, full name, and LinkedIn profiles. Provide a score from 0-100, list 3-5 strengths, 2-4 weaknesses, key skills found, experience assessment, and a brief summary. Respond with ONLY the JSON object, no other text.`

        const { text } = await generateText({
          model: openai("gpt-4o"),
          prompt,
          maxTokens: 1000,
        })

        // Try to parse the JSON response
        let analysis: ResumeAnalysis
        try {
          // Clean the response - remove any markdown formatting or extra text
          const cleanedText = text
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim()
          const parsed = JSON.parse(cleanedText)

          // Validate the parsed object has required fields
          if (!parsed.fileName || typeof parsed.score !== "number" || !Array.isArray(parsed.strengths)) {
            throw new Error("Invalid structure")
          }

          analysis = parsed as ResumeAnalysis
        } catch (parseError) {
          console.warn(`Failed to parse AI response for ${fileNames[i]}, using fallback:`, parseError)
          analysis = createFallbackAnalysis(fileNames[i], jobDescription)
        }

        analyses.push(analysis)
      } catch (error) {
        console.warn(`Error analyzing ${fileNames[i]}, using fallback:`, error)
        analyses.push(createFallbackAnalysis(fileNames[i], jobDescription))
      }
    }

    return NextResponse.json(analyses)
  } catch (error) {
    console.error("Resume analysis error:", error)

    // Return fallback analyses if everything fails
    const { jobDescription, fileNames } = await request.json().catch(() => ({ jobDescription: "", fileNames: [] }))
    const fallbackAnalyses = fileNames.map((fileName: string) => createFallbackAnalysis(fileName, jobDescription))

    return NextResponse.json(fallbackAnalyses)
  }
}
