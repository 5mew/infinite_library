import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const apiKey = process.env.OPENROUTER_API_KEY;

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "Authorization": `Bearer ${apiKey}`,
    "HTTP-Referer": process.env.VERCEL_URL || "http://localhost:3000",
    "X-Title": "Infinite Library",
    "Content-Type": "application/json"
  },
  timeout: 60000
}) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!apiKey || !openai) {
    return res.status(500).json({ error: 'OpenRouter API not configured' });
  }

  try {
    const { bookSummary, userProfile } = req.body;
    
    console.log('Generating full book content for:', bookSummary.title);
    
    // Generate content for each chapter
    const chapters = await Promise.all(
      bookSummary.chapters.map(async (chapterTitle, index) => {
        const content = await generateChapterContent(
          chapterTitle, 
          index, 
          bookSummary, 
          userProfile
        );
        return { title: chapterTitle, content };
      })
    );
    
    return res.status(200).json({ chapters });
    
  } catch (error: any) {
    console.error('Full book generation error:', error);
    return res.status(500).json({ error: 'Failed to generate full book content' });
  }
}

async function generateChapterContent(
  chapterTitle: string, 
  chapterIndex: number, 
  bookSummary: any, 
  userProfile: any
): Promise<string> {
  if (!openai) throw new Error('OpenAI client not available');

  const prompt = `Write a full chapter for the personalized book "${bookSummary.title}".

Chapter: ${chapterTitle} (Chapter ${chapterIndex + 1})
Book Genre: ${bookSummary.genre}
Book Premise: ${bookSummary.premise}
Main Themes: ${bookSummary.themes.join(', ')}

Reader Profile:
- Name: ${userProfile.name}
- Interests: ${userProfile.interests.join(', ')}
- Personality: ${userProfile.personalityTraits.join(', ')}
- Reading Level: ${userProfile.readingLevel}

Write a complete chapter (800-1200 words) that:
1. Fits the overall story arc and this specific chapter's role
2. Incorporates the reader's interests and personality naturally
3. Maintains the themes and tone of the book
4. Uses ${userProfile.readingLevel} reading level language
5. Creates an engaging, immersive narrative

The chapter should feel personal to ${userProfile.name} and advance the story meaningfully.

Write only the chapter content - no titles, no formatting instructions.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'google/gemini-flash-1.5',
      temperature: 0.8,
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: 'You are an expert novelist writing personalized fiction. Create engaging, immersive chapter content.'
        },
        { role: 'user', content: prompt }
      ]
    });

    return completion.choices[0].message?.content || `Chapter content for ${chapterTitle} would appear here...`;
    
  } catch (error) {
    console.error(`Error generating chapter ${chapterIndex + 1}:`, error);
    return `This is the beginning of ${chapterTitle}. The story continues to unfold with personalized content that speaks to ${userProfile.name}'s unique interests and experiences...`;
  }
}
