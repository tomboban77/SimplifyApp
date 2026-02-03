import { Document } from '@/types';

// This is a placeholder AI service
// In production, you would integrate with OpenAI, Anthropic, or your preferred AI provider
class AIService {
  private apiKey: string | null = null;

  constructor() {
    // In production, load API key from secure storage
    this.apiKey = process.env.EXPO_PUBLIC_AI_API_KEY || null;
  }

  async generateDocument(prompt: string): Promise<string> {
    // Try OpenAI API if key is available
    if (this.apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { 
                role: 'system', 
                content: 'You are a helpful document writing assistant. Generate well-structured documents in Markdown format with proper headings, lists, and formatting.' 
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content;
        }
      } catch (error) {
        console.error('AI API error:', error);
        // Fall back to template response
      }
    }
    
    // Return enhanced template response
    return this.getTemplateResponse(prompt);
  }

  async summarizePDF(uri: string): Promise<string> {
    // Placeholder implementation
    // In production, extract text from PDF and send to AI
    return 'This is a placeholder summary. In production, this would analyze the PDF content and provide a comprehensive summary using AI.';
  }

  async explainPDF(uri: string): Promise<string> {
    // Placeholder implementation
    return 'This is a placeholder explanation. In production, this would analyze the PDF content and provide detailed explanations using AI.';
  }

  private getTemplateResponse(prompt: string): string {
    // Enhanced template responses
    const lowerPrompt = prompt.toLowerCase();
    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    if (lowerPrompt.includes('meeting') || lowerPrompt.includes('meeting notes')) {
      return `# Meeting Notes

## Date: ${date}

### Attendees
- [Name 1]
- [Name 2]
- [Name 3]

### Agenda
1. [Topic 1]
2. [Topic 2]
3. [Topic 3]

### Discussion Points

#### [Topic 1]
- Key point 1
- Key point 2
- Decisions made

#### [Topic 2]
- Key point 1
- Key point 2
- Decisions made

### Action Items
- [ ] [Action item 1] - Assigned to: [Name] - Due: [Date]
- [ ] [Action item 2] - Assigned to: [Name] - Due: [Date]

### Next Steps
- [Next step 1]
- [Next step 2]

### Notes
[Additional notes or observations]`;
    }
    
    if (lowerPrompt.includes('letter') || lowerPrompt.includes('business letter')) {
      return `[Your Name]
[Your Address]
[City, State ZIP Code]
${date}

[Recipient Name]
[Recipient Address]
[City, State ZIP Code]

Dear [Recipient Name],

I am writing to [purpose of the letter].

[Body paragraph 1 - Main message]

[Body paragraph 2 - Supporting details]

[Body paragraph 3 - Closing remarks]

Thank you for your time and consideration.

Sincerely,
[Your Name]`;
    }
    
    if (lowerPrompt.includes('resume') || lowerPrompt.includes('cv')) {
      return `# [Your Full Name]
[Email Address] | [Phone Number] | [Location/LinkedIn]

## Professional Summary
Experienced professional with expertise in [your field]. Skilled in [key skills]. Proven track record of [achievements].

## Professional Experience

### [Job Title]
**[Company Name]** | [City, State] | [Start Date] - [End Date]
- [Key achievement or responsibility]
- [Key achievement or responsibility]
- [Key achievement or responsibility]

### [Previous Job Title]
**[Company Name]** | [City, State] | [Start Date] - [End Date]
- [Key achievement or responsibility]
- [Key achievement or responsibility]

## Education

### [Degree]
**[University Name]** | [City, State] | [Graduation Year]
- [Relevant coursework or honors]

## Skills
- [Skill 1]
- [Skill 2]
- [Skill 3]
- [Skill 4]
- [Skill 5]

## Certifications
- [Certification 1]
- [Certification 2]`;
    }
    
    if (lowerPrompt.includes('blog') || lowerPrompt.includes('blog post')) {
      return `# [Compelling Blog Post Title]

## Introduction
[Engaging opening paragraph that hooks the reader and introduces the topic]

## Main Content

### [Section 1 Heading]
[Content paragraph explaining the first main point]

[Supporting details and examples]

### [Section 2 Heading]
[Content paragraph explaining the second main point]

[Supporting details and examples]

### [Section 3 Heading]
[Content paragraph explaining the third main point]

[Supporting details and examples]

## Conclusion
[Summary of key points and a call to action or thought-provoking closing statement]

---
*Published on ${date}*`;
    }
    
    // Generic document template based on prompt
    const lines = prompt.split('\n').filter(l => l.trim());
    const title = lines[0] || 'New Document';
    
    return `# ${title}

${prompt}

## Details

[Add your content here]

## Notes

[Additional information or notes]`;
  }
}

export const useAIService = () => {
  const service = new AIService();
  return {
    generateDocument: (prompt: string) => service.generateDocument(prompt),
    summarizePDF: (uri: string) => service.summarizePDF(uri),
    explainPDF: (uri: string) => service.explainPDF(uri),
  };
};

