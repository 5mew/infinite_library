import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Debug all environment variables
console.log('=== ENVIRONMENT DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
console.log('All env keys:', Object.keys(process.env).filter(key => key.includes('OPENROUTER') || key.includes('API')));

// Check if API key exists
const apiKey = process.env.OPENROUTER_API_KEY;
console.log('OpenRouter API Key exists:', !!apiKey);
console.log('API Key length:', apiKey?.length || 0);
console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING');

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

console.log('OpenAI client created:', !!openai);

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
  console.log('=== API REQUEST DEBUG ===');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Debug: Check API key again in handler
  console.log('API Key in handler:', !!apiKey);
  
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY environment variable is missing');
    return res.status(500).json({ 
      error: 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY to environment variables.',
      debug: {
        hasApiKey: !!apiKey,
        envKeys: Object.keys(process.env).filter(key => key.includes('API')),
        nodeEnv: process.env.NODE_ENV
      }
    });
  }

  if (!openai) {
    console.error('OpenRouter client not initialized');
    return res.status(500).json({ 
      error: 'OpenRouter client initialization failed',
      debug: { hasApiKey: !!apiKey, clientCreated: !!openai }
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
    console.log('Using API key:', apiKey.substring(0, 10) + '...');
    
    // Test API connection first
    const testResult = await testOpenRouterConnection();
    if (!testResult.success) {
      return res.status(500).json({
        error: 'OpenRouter API test failed: ' + testResult.error,
        debug: testResult.debug
      });
    }
    
    // Generate book
    const book = await generateSimpleBook(profile);
    
    console.log('Book generated successfully:', book.title);
    
    return res.status(200).json(book);
    
  } catch (error: any) {
    console.error('Full error details:', error);
    console.error('Error stack:', error.stack);
    
    if (error.message?.includes('401') || error.message?.includes('auth')) {
      return res.status(401).json({ 
        error: 'OpenRouter authentication failed. Check your API key.',
        debug: {
          hasApiKey: !!apiKey,
          keyLength: apiKey?.length,
          keyPreview: apiKey?.substring(0, 10) + '...',
          errorMessage: error.message
        }
      });
    }
    
    if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
      return res.status(429).json({ error: 'API rate limit exceeded. Please try again in a few moments.' });
    }
    
    return res.status(500).json({ 
      error: 'Book generation failed: ' + error.message,
      debug: {
        hasApiKey: !!apiKey,
        hasClient: !!openai,
        errorType: error.constructor.name,
        errorMessage: error.message
      }
    });
  }
}

async function testOpenRouterConnection(): Promise<{ success: boolean; error?: string; debug?: any }> {
  if (!openai) {
    return { success: false, error: 'OpenAI client not available' };
  }

  try {
    console.log('Testing OpenRouter connection...');
    
    // Simple test call to verify API key works
    const response = await openai.chat.completions.create({
      model: 'google/gemini-flash-1.5',
      messages: [{ role: 'user', content: 'Say "test successful"' }],
      max_tokens: 10
    });

    console.log('OpenRouter test successful');
    return { success: true };
    
  } catch (error: any) {
    console.error('OpenRouter test failed:', error);
    return { 
      success: false, 
      error: error.message,
      debug: {
        status: error.status,
        code: error.code,
        type: error.type
      }
    };
  }
}

async function generateSimpleBook(profile: UserProfile): Promise<GeneratedBook> {
  if (!openai) {
    throw new Error('OpenRouter client not available');
  }

  console.log('Calling OpenRouter API for book generation...');

  const prompt = `Create a personalized ${profile.preferredGenre} book for ${profile.name}. 

Respond with JSON only:
{
  "title": "Book title",
  "author": "AI Author",
  "genre": "${profile.preferredGenre}",
  "premise": "2-3 sentence story premise",
  "themes": ["theme1", "theme2", "theme3"],
  "personalizedElements": ["element1", "element2", "element3"],
  "chapters": ["Chapter 1", "Chapter 2", "Chapter 3"],
  "estimatedLength": "15,000 words",
  "readingTime": "45-60 minutes"
}

Make it personal to ${profile.name} who likes ${profile.interests.join(', ')}.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'google/gemini-flash-1.5', // Free model
      temperature: 0.7,
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: 'You are a novelist. Respond only with valid JSON.'
        },
        { role: 'user', content: prompt }
      ]
    });

    const rawContent = completion.choices[0].message?.content ?? '{}';
    console.log('OpenRouter response received, length:', rawContent.length);

    // Clean up response
    let cleanContent = rawContent;
    if (cleanContent.includes('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    }
    if (cleanContent.includes('```')) {
      cleanContent = cleanContent.replace(/```/g, '');
    }

    // Parse JSON
    let book: any;
    try {
      book = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON response from AI model');
    }
    
    // Add required fields
    book.generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure required fields exist
    if (!book.title) book.title = `A Story for ${profile.name}`;
    if (!book.author) book.author = `AI Author (for ${profile.name})`;
    if (!book.genre) book.genre = profile.preferredGenre;
    if (!book.premise) book.premise = `A personalized story crafted especially for ${profile.name}.`;
    if (!book.themes) book.themes = ['adventure', 'growth', 'discovery'];
    if (!book.personalizedElements) book.personalizedElements = [`Written for ${profile.name}`, 'Incorporates your interests', 'Matches your personality'];
    if (!book.chapters) book.chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];
    if (!book.estimatedLength) book.estimatedLength = '15,000 words';
    if (!book.readingTime) book.readingTime = '45-60 minutes';
    
    console.log('Book parsed successfully:', book.title);
    
    return book as GeneratedBook;
    
  } catch (error: any) {
    console.error('OpenRouter API error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });
    
    throw error;
  }
}
