import { NextApiRequest, NextApiResponse } from 'next';

// Check if API key exists
const apiKey = process.env.OPENROUTER_API_KEY;
console.log('OpenRouter API Key exists:', !!apiKey);
console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 15)}...` : 'MISSING');

// Types
type UserProfile = {
  name: string;
  age: string;
  interests: string[];
  readingLevel: string;
  preferredGenre: string;
  personalityTraits: string[];
  currentMood: string;
  location: string;
  personalChallenges: string[];
};

type GeneratedBook = {
  title: string;
  author: string;
  genre: string;
  premise: string;
  themes: string[];
  personalizedElements: string[];
  chapters: string[];
  estimatedLength: string;
  readingTime: string;
  generationId: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check API key
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY environment variable is missing');
    return res.status(500).json({ 
      error: 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY to environment variables.' 
    });
  }

  try {
    const profile: UserProfile = req.body;
    console.log('Received profile:', { name: profile.name, genre: profile.preferredGenre });
    
    // Validate input
    if (!profile.name || !profile.preferredGenre || !profile.interests?.length) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, preferredGenre, and interests are required' 
      });
    }

    console.log('Starting book generation with OpenRouter (direct fetch)...');
    
    const book = await generateBookDirectFetch(profile);
    
    console.log('Book generated successfully:', book.title);
    
    return res.status(200).json(book);
    
  } catch (error: any) {
    console.error('Full error details:', error);
    
    if (error.message?.includes('401') || error.message?.includes('auth')) {
      return res.status(401).json({ 
        error: 'OpenRouter authentication failed. Please check your API key.',
        debug: {
          hasApiKey: !!apiKey,
          keyFormat: apiKey ? (apiKey.startsWith('sk-or-v1-') ? 'correct' : 'incorrect') : 'missing'
        }
      });
    }
    
    return res.status(500).json({ 
      error: 'Book generation failed: ' + error.message
    });
  }
}

async function generateBookDirectFetch(profile: UserProfile): Promise<GeneratedBook> {
  console.log('Making direct fetch call to OpenRouter...');

  const prompt = `Create a personalized ${profile.preferredGenre} book for ${profile.name}.

Respond with ONLY valid JSON:
{
  "title": "Book title",
  "author": "AI Author (Personalized for ${profile.name})",
  "genre": "${profile.preferredGenre}",
  "premise": "2-3 sentence premise",
  "themes": ["theme1", "theme2", "theme3"],
  "personalizedElements": ["element1", "element2", "element3"],
  "chapters": ["Chapter 1: Title", "Chapter 2: Title", "Chapter 3: Title"],
  "estimatedLength": "15,000 words",
  "readingTime": "45-60 minutes"
}

Reader: ${profile.name}
Interests: ${profile.interests.join(', ')}
Personality: ${profile.personalityTraits.join(', ')}

Make it personal and relevant. JSON only, no markdown.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
        'X-Title': 'Infinite Library'
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        messages: [
          {
            role: 'system',
            content: 'You are an expert novelist. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 3000
      })
    });

    console.log('OpenRouter response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error response:', errorText);
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenRouter response received successfully');

    const rawContent = data.choices?.[0]?.message?.content ?? '{}';
    console.log('Raw content preview:', rawContent.substring(0, 100));

    // Clean up response
    let cleanContent = rawContent.trim();
    if (cleanContent.includes('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    }
    if (cleanContent.includes('```')) {
      cleanContent = cleanContent.replace(/```/g, '');
    }
    
    // Extract JSON if wrapped in other text
    const jsonStart = cleanContent.indexOf('{');
    const jsonEnd = cleanContent.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }

    // Parse JSON
    let book: any;
    try {
      book = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Clean content:', cleanContent);
      
      // Create fallback book if JSON parsing fails
      book = {
        title: `A Personal Story for ${profile.name}`,
        author: `AI Author (Personalized for ${profile.name})`,
        genre: profile.preferredGenre,
        premise: `A personalized ${profile.preferredGenre.toLowerCase()} story crafted especially for ${profile.name}, incorporating their interests in ${profile.interests.slice(0, 2).join(' and ')}.`,
        themes: ['personal growth', 'adventure', 'discovery'],
        personalizedElements: [
          `Written specifically for ${profile.name}`,
          `Incorporates your interests in ${profile.interests.slice(0, 2).join(' and ')}`,
          `Reflects your ${profile.personalityTraits[0] || 'unique'} personality`
        ],
        chapters: [
          'Chapter 1: The Beginning',
          'Chapter 2: Discovery', 
          'Chapter 3: Challenge',
          'Chapter 4: Growth',
          'Chapter 5: Resolution'
        ],
        estimatedLength: '15,000 words',
        readingTime: '45-60 minutes'
      };
    }
    
    // Add generation metadata
    book.generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure all required fields exist
    if (!book.title) book.title = `A Personal Story for ${profile.name}`;
    if (!book.author) book.author = `AI Author (Personalized for ${profile.name})`;
    if (!book.genre) book.genre = profile.preferredGenre;
    if (!book.premise) book.premise = `A personalized story for ${profile.name}.`;
    if (!book.themes) book.themes = ['growth', 'discovery', 'journey'];
    if (!book.personalizedElements) book.personalizedElements = [`Created for ${profile.name}`];
    if (!book.chapters) book.chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3'];
    if (!book.estimatedLength) book.estimatedLength = '15,000 words';
    if (!book.readingTime) book.readingTime = '45-60 minutes';
    
    console.log('Book processed successfully:', book.title);
    
    return book as GeneratedBook;
    
  } catch (error: any) {
    console.error('Direct fetch error:', error);
    throw error;
  }
}
