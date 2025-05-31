import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Check if API key exists
const apiKey = process.env.OPENROUTER_API_KEY;
console.log('OpenRouter API Key exists:', !!apiKey);
console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 7)}...` : 'MISSING');

// Configure OpenAI client to use OpenRouter
const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.VERCEL_URL || "http://localhost:3000",
    "X-Title": "Infinite Library",
  },
  timeout: 60000 // 60 second timeout for OpenRouter
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
  chapters: string[]; // Changed to string[] instead of object[]
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
    
    // Generate book with retries
    const book = await generateBookWithRetries(profile, 3);
    
    console.log('Book generated successfully:', book.title);
    
    return res.status(200).json(book);
    
  } catch (error: any) {
    console.error('Full error details:', error);
    
    if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
      return res.status(429).json({ error: 'API rate limit exceeded. Please try again in a few moments.' });
    }
    
    if (error.message?.includes('insufficient_quota') || error.message?.includes('balance')) {
      return res.status(402).json({ error: 'Insufficient OpenRouter credits. Please add credits to your account.' });
    }
    
    if (error.message?.includes('content policy') || error.message?.includes('safety')) {
      return res.status(400).json({ error: 'Content failed safety checks. Please try different preferences.' });
    }

    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      return res.status(500).json({ error: 'OpenRouter API key issue: ' + error.message });
    }
    
    return res.status(500).json({ 
      error: 'Book generation failed: ' + error.message
    });
  }
}

async function generateBookWithRetries(profile: UserProfile, maxRetries: number): Promise<GeneratedBook> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Generation attempt ${attempt} for ${profile.name}`);
      
      const book = await generateBook(profile);
      
      // Quality check
      const qualityScore = await assessBookQuality(book);
      
      if (qualityScore < 0.6 && attempt < maxRetries) {
        console.log(`Quality score ${qualityScore} too low, retrying...`);
        continue;
      }
      
      return book;
      
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw lastError;
}

async function generateBook(profile: UserProfile): Promise<GeneratedBook> {
  if (!openai) {
    throw new Error('OpenRouter client not available');
  }

  console.log('Calling OpenRouter API...');

  const prompt = buildAdvancedPrompt(profile);

  try {
    const completion = await openai.chat.completions.create({
      // Choose the best model for your needs and budget:
      // Free models:
      model: 'google/gemini-flash-1.5', // Free, good quality
      // model: 'meta-llama/llama-3.1-8b-instruct:free', // Alternative free option
      
      // Paid models (higher quality):
      // model: 'anthropic/claude-3-sonnet', // Excellent for creative writing
      // model: 'openai/gpt-4o-mini', // Good balance of cost/quality
      // model: 'openai/gpt-4o', // Highest quality
      
      temperature: 0.8,
      max_tokens: 4096,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      messages: [
        {
          role: 'system',
          content: `You are an award-winning novelist and personalization expert. Create deeply engaging, personalized stories that resonate with the reader's specific traits, challenges, and interests.

Key requirements:
- Respond ONLY with valid JSON matching the requested schema
- Ensure all content is appropriate and safe
- Make the story genuinely personal and relevant
- Use rich, engaging language appropriate to the reading level
- Include subtle life lessons and growth themes`
        },
        { role: 'user', content: prompt }
      ]
    });

    const rawContent = completion.choices[0].message?.content ?? '{}';
    
    console.log('OpenRouter response received');
    console.log('Raw content preview:', rawContent.substring(0, 200));

    // Clean up response (remove markdown if present)
    let cleanContent = rawContent;
    if (cleanContent.includes('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    }
    if (cleanContent.includes('```')) {
      cleanContent = cleanContent.replace(/```/g, '');
    }

    // Parse and validate JSON
    let book: any; // Use any first to handle flexible parsing
    try {
      book = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content that failed to parse:', cleanContent);
      throw new Error('Invalid JSON response from AI model');
    }
    
    // Add generation metadata
    book.generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate required fields
    if (!book.title || !book.premise) {
      throw new Error('Generated book missing required fields');
    }

    // Ensure chapters is an array of strings (handle different formats)
    if (book.chapters && Array.isArray(book.chapters)) {
      if (book.chapters.length > 0 && typeof book.chapters[0] === 'object') {
        // Convert {title: "...", summary: "..."} to just title strings
        book.chapters = book.chapters.map((ch: any, index: number) => 
          typeof ch === 'object' ? (ch.title || `Chapter ${index + 1}`) : ch
        );
      }
      // Ensure all chapters are strings
      book.chapters = book.chapters.map((ch: any, index: number) => 
        typeof ch === 'string' ? ch : `Chapter ${index + 1}`
      );
    } else {
      // Create default chapters as strings
      book.chapters = [
        'Chapter 1: The Beginning',
        'Chapter 2: Discovery', 
        'Chapter 3: Challenge',
        'Chapter 4: Growth',
        'Chapter 5: Resolution'
      ];
    }

    // Ensure other required fields have defaults
    if (!book.themes || !Array.isArray(book.themes)) {
      book.themes = ['growth', 'discovery', 'journey'];
    }
    
    if (!book.personalizedElements || !Array.isArray(book.personalizedElements)) {
      book.personalizedElements = [
        `Story crafted for ${profile.name}`,
        `Incorporates your love of ${profile.interests[0] || 'adventure'}`,
        `Reflects your ${profile.personalityTraits[0] || 'unique'} personality`
      ];
    }

    if (!book.estimatedLength) {
      book.estimatedLength = '15,000 words';
    }

    if (!book.readingTime) {
      book.readingTime = '45-60 minutes';
    }

    if (!book.author) {
      book.author = `AI Author (Personalized for ${profile.name})`;
    }

    if (!book.genre) {
      book.genre = profile.preferredGenre;
    }
    
    console.log('Book parsed successfully:', book.title);
    
    // Return as properly typed GeneratedBook
    return book as GeneratedBook;
    
  } catch (error: any) {
    console.error('OpenRouter API error:', error);
    
    if (error.code === 'rate_limit_exceeded' || error.message?.includes('rate limit')) {
      throw new Error('OpenRouter API rate limit exceeded');
    }
    
    if (error.code === 'invalid_api_key' || error.message?.includes('authentication')) {
      throw new Error('Invalid OpenRouter API key');
    }

    if (error.message?.includes('insufficient_quota') || error.message?.includes('balance')) {
      throw new Error('Insufficient OpenRouter credits');
    }

    if (error.message?.includes('content_filter') || error.message?.includes('safety')) {
      throw new Error('Content blocked by safety filters');
    }
    
    throw new Error('OpenRouter API call failed: ' + error.message);
  }
}

function buildAdvancedPrompt(profile: UserProfile): string {
  return `Create a personalized ${profile.preferredGenre.toLowerCase()} book as JSON with this exact structure:

{
  "title": "string",
  "author": "string", 
  "genre": "string",
  "premise": "string (2-3 sentences)",
  "themes": ["string array of 3-5 core themes"],
  "personalizedElements": ["string array of 5-7 specific personalizations"],
  "chapters": [
    "Chapter 1: Title",
    "Chapter 2: Title", 
    "Chapter 3: Title"
  ],
  "estimatedLength": "string (e.g., '15,000 words')",
  "readingTime": "string (e.g., '45-60 minutes')"
}

PERSONALIZATION PROFILE:
Name: ${profile.name}
Age: ${profile.age}
Location: ${profile.location}
Interests: ${profile.interests.join(', ')}
Personality: ${profile.personalityTraits.join(', ')}
Current Mood: ${profile.currentMood}
Life Focus: ${profile.personalChallenges.join(', ')}
Reading Level: ${profile.readingLevel}

Create 5-7 chapters with engaging titles. Make the story feel specifically written for ${profile.name}. Include their interests (${profile.interests.slice(0, 4).join(', ')}) and personality traits (${profile.personalityTraits.slice(0, 3).join(', ')}).

OUTPUT VALID JSON ONLY - NO MARKDOWN, NO CODE FENCES.`;
}

async function assessBookQuality(book: GeneratedBook): Promise<number> {
  // Simple quality scoring without additional API calls
  let score = 0.5; // Base score
  
  // Check title quality
  if (book.title && book.title.length > 5 && !book.title.includes('undefined')) score += 0.1;
  
  // Check premise quality
  if (book.premise && book.premise.length > 50) score += 0.1;
  
  // Check themes
  if (book.themes && book.themes.length >= 3) score += 0.1;
  
  // Check personalized elements
  if (book.personalizedElements && book.personalizedElements.length >= 3) score += 0.1;
  
  // Check chapters
  if (book.chapters && book.chapters.length >= 3) score += 0.1;
  
  return Math.min(1.0, score);
}
