import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Check if API key exists
const apiKey = process.env.OPENROUTER_API_KEY;
console.log('OpenRouter API Key exists:', !!apiKey);
console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 15)}...` : 'MISSING');

// Configure OpenAI client to use OpenRouter with explicit auth
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

  // Debug: Check API key
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY environment variable is missing');
    return res.status(500).json({ 
      error: 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY to environment variables.' 
    });
  }

  if (!openai) {
    console.error('OpenRouter client not initialized');
    return res.status(500).json({ 
      error: 'OpenRouter client initialization failed' 
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

    console.log('Starting book generation with OpenRouter...');
    
    // Generate book directly (no retries for now to simplify debugging)
    const book = await generateBook(profile);
    
    console.log('Book generated successfully:', book.title);
    
    return res.status(200).json(book);
    
  } catch (error: any) {
    console.error('Full error details:', error);
    
    if (error.status === 401 || error.message?.includes('401') || error.message?.includes('auth')) {
      return res.status(401).json({ 
        error: 'OpenRouter authentication failed. Please check your API key.',
        debug: {
          hasApiKey: !!apiKey,
          keyFormat: apiKey ? (apiKey.startsWith('sk-or-v1-') ? 'correct' : 'incorrect') : 'missing',
          errorMessage: error.message
        }
      });
    }
    
    if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
      return res.status(429).json({ error: 'API rate limit exceeded. Please try again in a few moments.' });
    }
    
    return res.status(500).json({ 
      error: 'Book generation failed: ' + error.message
    });
  }
}

async function generateBook(profile: UserProfile): Promise<GeneratedBook> {
  if (!openai) {
    throw new Error('OpenRouter client not available');
  }

  console.log('Calling OpenRouter API...');
  console.log('Using model: google/gemini-flash-1.5');

  const prompt = `Create a personalized ${profile.preferredGenre} book for ${profile.name}.

Respond with ONLY valid JSON in this format:
{
  "title": "An engaging book title",
  "author": "AI Author (Personalized for ${profile.name})",
  "genre": "${profile.preferredGenre}",
  "premise": "A compelling 2-3 sentence premise that incorporates the reader's interests",
  "themes": ["theme1", "theme2", "theme3"],
  "personalizedElements": [
    "Element showing how this book is customized for the reader",
    "Another personalization detail",
    "A third customization aspect"
  ],
  "chapters": [
    "Chapter 1: Engaging Title",
    "Chapter 2: Another Title",
    "Chapter 3: Third Title",
    "Chapter 4: Fourth Title",
    "Chapter 5: Final Title"
  ],
  "estimatedLength": "15,000 words",
  "readingTime": "45-60 minutes"
}

Reader Profile:
- Name: ${profile.name}
- Interests: ${profile.interests.join(', ')}
- Personality: ${profile.personalityTraits.join(', ')}
- Reading Level: ${profile.readingLevel}
- Current Mood: ${profile.currentMood}

Make the story genuinely personal and relevant to ${profile.name}. Include references to their interests and personality traits.

Respond with ONLY the JSON - no markdown, no explanations.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'google/gemini-flash-1.5',
      temperature: 0.8,
      max_tokens: 3000,
      messages: [
        {
          role: 'system',
          content: 'You are an expert novelist. Respond only with valid JSON matching the requested format exactly.'
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ]
    });

    const rawContent = completion.choices[0].message?.content ?? '{}';
    console.log('OpenRouter response received');
    console.log('Raw content preview:', rawContent.substring(0, 100));

    // Clean up response (remove any markdown formatting)
    let cleanContent = rawContent.trim();
    if (cleanContent.includes('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    }
    if (cleanContent.includes('```')) {
      cleanContent = cleanContent.replace(/```/g, '');
    }
    // Remove any leading/trailing non-JSON text
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
      throw new Error('Invalid JSON response from AI model');
    }
    
    // Add generation metadata
    book.generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate and provide defaults for required fields
    if (!book.title) book.title = `A Personal Story for ${profile.name}`;
    if (!book.author) book.author = `AI Author (Personalized for ${profile.name})`;
    if (!book.genre) book.genre = profile.preferredGenre;
    if (!book.premise) book.premise = `A personalized ${profile.preferredGenre.toLowerCase()} story crafted especially for ${profile.name}, incorporating their unique interests and personality.`;
    if (!book.themes || !Array.isArray(book.themes)) {
      book.themes = ['personal growth', 'adventure', 'discovery'];
    }
    if (!book.personalizedElements || !Array.isArray(book.personalizedElements)) {
      book.personalizedElements = [
        `Written specifically for ${profile.name}`,
        `Incorporates your interests in ${profile.interests.slice(0, 2).join(' and ')}`,
        `Reflects your ${profile.personalityTraits.slice(0, 1)[0] || 'unique'} personality`
      ];
    }
    if (!book.chapters || !Array.isArray(book.chapters)) {
      book.chapters = [
        'Chapter 1: The Beginning',
        'Chapter 2: Discovery',
        'Chapter 3: Challenge',
        'Chapter 4: Growth',
        'Chapter 5: Resolution'
      ];
    }
    if (!book.estimatedLength) book.estimatedLength = '15,000 words';
    if (!book.readingTime) book.readingTime = '45-60 minutes';
    
    console.log('Book parsed and validated successfully:', book.title);
    
    return book as GeneratedBook;
    
  } catch (error: any) {
    console.error('OpenRouter API error:', error);
    console.error('Error details:', {
      status: error.status,
      code: error.code,
      message: error.message,
      type: error.type
    });
    
    if (error.status === 401) {
      throw new Error('OpenRouter authentication failed - invalid API key');
    }
    
    if (error.status === 429) {
      throw new Error('OpenRouter rate limit exceeded');
    }
    
    if (error.status === 402) {
      throw new Error('OpenRouter insufficient credits');
    }
    
    throw new Error('OpenRouter API call failed: ' + error.message);
  }
}
