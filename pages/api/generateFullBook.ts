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

// Types
interface UserProfile {
  name: string;
  age: string;
  interests: string[];
  readingLevel: string;
  preferredGenre: string;
  personalityTraits: string[];
  currentMood: string;
  location: string;
  personalChallenges: string[];
}

interface BookSummary {
  title: string;
  author: string;
  genre: string;
  premise: string;
  themes: string[];
  personalizedElements: string[];
  chapters: string[];
  estimatedLength: string;
  readingTime: string;
}

interface ChapterData {
  title: string;
  content: string;
}

interface GeneratedFullBook {
  chapters: ChapterData[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!apiKey || !openai) {
    return res.status(500).json({ error: 'OpenRouter API not configured' });
  }

  try {
    const { bookSummary, userProfile }: { bookSummary: BookSummary; userProfile: UserProfile } = req.body;
    
    console.log('Generating full book content for:', bookSummary.title);
    
    // Generate content for each chapter
    const chapters = await Promise.all(
      bookSummary.chapters.map(async (chapterTitle: string, index: number): Promise<ChapterData> => {
        const content = await generateChapterContent(
          chapterTitle, 
          index, 
          bookSummary, 
          userProfile
        );
        return { title: chapterTitle, content };
      })
    );
    
    const result: GeneratedFullBook = { chapters };
    
    return res.status(200).json(result);
    
  } catch (error: any) {
    console.error('Full book generation error:', error);
    return res.status(500).json({ error: 'Failed to generate full book content' });
  }
}

async function generateChapterContent(
  chapterTitle: string, 
  chapterIndex: number, 
  bookSummary: BookSummary, 
  userProfile: UserProfile
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
    
  } catch (error: any) {
    console.error(`Error generating chapter ${chapterIndex + 1}:`, error);
    return createFallbackChapterContent(chapterTitle, userProfile, bookSummary);
  }
}

function createFallbackChapterContent(
  chapterTitle: string, 
  userProfile: UserProfile, 
  bookSummary: BookSummary
): string {
  return `This is the beginning of ${chapterTitle}. In this chapter, our story unfolds as ${userProfile.name} embarks on a journey that reflects their love of ${userProfile.interests.slice(0, 2).join(' and ')}.

The narrative weaves together elements that speak to their ${userProfile.personalityTraits.slice(0, 2).join(' and ')} nature, creating a story that feels both familiar and wonderfully new. The ${bookSummary.genre.toLowerCase()} elements come alive as the protagonist navigates challenges that mirror the themes of ${bookSummary.themes.slice(0, 2).join(' and ')}.

As the chapter progresses, the story delves deeper into the world established in "${bookSummary.title}". The setting reflects ${userProfile.location ? `elements familiar to ${userProfile.location}` : 'a world that feels like home'}, while the characters embody the ${userProfile.personalityTraits.join(', ')} qualities that ${userProfile.name} would recognize and appreciate.

The plot thickens as our protagonist faces decisions that would resonate with someone who values ${userProfile.interests.slice(0, 3).join(', ')}. Each scene is crafted to speak to the ${userProfile.readingLevel} reader, ensuring that the language and complexity feel perfectly matched to ${userProfile.name}'s preferences.

Through dialogue and action, the chapter explores the deeper meaning behind ${bookSummary.premise}. The characters grow and change, reflecting the personal journey that ${userProfile.name} might recognize from their own experiences with ${userProfile.personalChallenges.slice(0, 2).join(' and ')}.

As ${chapterTitle} draws to a close, the stage is set for the next part of this personalized adventure. The story continues to unfold in ways that honor both the universal themes of ${bookSummary.genre.toLowerCase()} literature and the specific interests and personality that make ${userProfile.name} unique.

This personalized narrative continues to weave together the threads of character development, plot progression, and thematic depth that will carry through the entire book, creating a reading experience that feels truly crafted for one special reader.`;
}
