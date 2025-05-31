import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Check if API key exists
const apiKey = process.env.GEMINI_API_KEY;
console.log('Gemini API Key exists:', !!apiKey);
console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 7)}...` : 'MISSING');

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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
  chapters: { title: string; summary: string }[];
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
    console.error('GEMINI_API_KEY environment variable is missing');
    return res.status(500).json({ 
      error: 'Gemini API key not configured. Please add GEMINI_API_KEY to environment variables.' 
    });
  }

  if (!genAI) {
    console.error('Gemini client not initialized');
    return res.status(500).json({ 
      error: 'Gemini client initialization failed' 
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

    console.log('Starting book generation with Gemini...');
    
    // Generate book with retries
    const book = await generateBookWithRetries(profile, 3);
    
    console.log('Book generated successfully:', book.title);
    
    return res.status(200).json(book);
    
  } catch (error: any) {
    console.error('Full error details:', error);
    
    if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
      return res.status(429).json({ error: 'AI service rate limit exceeded. Please try again in a few moments.' });
    }
    
    if (error.message?.includes('safety') || error.message?.includes('blocked')) {
      return res.status(400).json({ error: 'Content failed safety checks. Please try different preferences.' });
    }

    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      return res.status(500).json({ error: 'Gemini API key issue: ' + error.message });
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
      
      // Simple quality check
      const qualityScore = assessBookQuality(book);
      
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
  if (!genAI) {
    throw new Error('Gemini client not available');
  }

  console.log('Calling Gemini API...');

  const prompt = buildAdvancedPrompt(profile);

  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.8,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });

    console.log('Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawContent = response.text();

    console.log('Gemini response received');
    console.log('Raw content preview:', rawContent.substring(0, 200));

    // Clean up the response (remove markdown formatting if present)
    let cleanContent = rawContent;
    if (cleanContent.includes('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    }
    if (cleanContent.includes('```')) {
      cleanContent = cleanContent.replace(/```/g, '');
    }

    // Parse JSON
    let book: GeneratedBook;
    try {
      book = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content that failed to parse:', cleanContent);
      throw new Error('Invalid JSON response from Gemini model');
    }
    
    // Add generation ID
    book.generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate required fields
    if (!book.title || !book.premise) {
      throw new Error('Generated book missing required fields');
    }

    // Ensure chapters is an array of strings (convert if needed)
    if (book.chapters && Array.isArray(book.chapters)) {
      if (typeof book.chapters[0] === 'object') {
        // Convert {title: "...", summary: "..."} to just title strings
        book.chapters = book.chapters.map((ch: any) => 
          typeof ch === 'object' ? ch.title || `Chapter ${book.chapters.indexOf(ch) + 1}` : ch
        );
      }
    } else {
      book.chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];
    }
    
    console.log('Book parsed successfully:', book.title);
    
    return book;
    
  } catch (error: any) {
    console.error('Gemini API error:', error);
    
    if (error.message?.includes('quota') || error.message?.includes('rate')) {
      throw new Error('Gemini API rate limit exceeded');
    }
    
    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      throw new Error('Invalid Gemini API key');
    }

    if (error.message?.includes('safety') || error.message?.includes('blocked')) {
      throw new Error('Content blocked by Gemini safety filters');
    }
    
    throw new Error('Gemini API call failed: ' + error.message);
  }
}

function buildAdvancedPrompt(profile: UserProfile): string {
  const personalityInsights = analyzePersonality(profile);
  const narrativeStyle = determineNarrativeStyle(profile);
  
  return `You are an award-winning novelist and personalization expert. Create a deeply engaging, personalized ${profile.preferredGenre.toLowerCase()} book tailored specifically for this reader.

READER PROFILE:
Name: ${profile.name}
Age: ${profile.age}
Location: ${profile.location}
Interests: ${profile.interests.join(', ')}
Personality Traits: ${profile.personalityTraits.join(', ')}
Current Mood: ${profile.currentMood}
Life Focus Areas: ${profile.personalChallenges.join(', ')}
Reading Level: ${profile.readingLevel}

PERSONALITY INSIGHTS:
${personalityInsights}

NARRATIVE STYLE REQUIREMENTS:
${narrativeStyle}

Create a personalized book and respond with ONLY valid JSON in this exact format:

{
  "title": "An engaging title that reflects the reader's interests",
  "author": "AI Author (Personalized for ${profile.name})", 
  "genre": "${profile.preferredGenre}",
  "premise": "A compelling 2-3 sentence premise that incorporates the reader's personality and interests",
  "themes": ["theme1", "theme2", "theme3", "theme4"],
  "personalizedElements": [
    "Specific way this book is customized for the reader",
    "Another personalization detail",
    "A third customization aspect",
    "Fourth personalized element",
    "Fifth unique customization"
  ],
  "chapters": [
    "Chapter 1: Engaging Chapter Title",
    "Chapter 2: Another Chapter Title", 
    "Chapter 3: Third Chapter Title",
    "Chapter 4: Fourth Chapter Title",
    "Chapter 5: Final Chapter Title"
  ],
  "estimatedLength": "15,000 words",
  "readingTime": "45-60 minutes"
}

CRITICAL REQUIREMENTS:
- Make the story genuinely personal and relevant to ${profile.name}
- Incorporate their interests: ${profile.interests.slice(0, 4).join(', ')}
- Reflect their personality: ${profile.personalityTraits.slice(0, 3).join(', ')}
- Address their life focus if provided: ${profile.personalChallenges.slice(0, 2).join(', ')}
- Use appropriate complexity for ${profile.readingLevel} reading level
- Ensure all content is appropriate and engaging
- Respond with ONLY the JSON - no markdown formatting, no explanations

Generate the JSON now:`;
}

function analyzePersonality(profile: UserProfile): string {
  const traits = profile.personalityTraits;
  let analysis = "Personality analysis: ";
  
  if (traits.includes('Analytical')) {
    analysis += "Appreciates logical plot development and detailed world-building. ";
  }
  if (traits.includes('Creative')) {
    analysis += "Enjoys vivid imagery and innovative storytelling approaches. ";
  }
  if (traits.includes('Empathetic')) {
    analysis += "Connects with emotional character development and relationship dynamics. ";
  }
  if (traits.includes('Adventurous')) {
    analysis += "Prefers active plots with exploration and new experiences. ";
  }
  if (traits.includes('Introverted')) {
    analysis += "Values internal character reflection and quiet moments of growth. ";
  }
  
  return analysis;
}

function determineNarrativeStyle(profile: UserProfile): string {
  const level = profile.readingLevel;
  const mood = profile.currentMood;
  const genre = profile.preferredGenre;
  
  let style = "";
  
  // Reading level adjustments
  if (level === 'casual') {
    style += "Use accessible language, shorter sentences, and clear narrative flow. ";
  } else if (level === 'advanced') {
    style += "Employ sophisticated vocabulary, complex sentence structures, and literary devices. ";
  } else {
    style += "Balance engaging language with moderate complexity. ";
  }
  
  // Mood-based tone
  if (mood === 'optimistic') {
    style += "Maintain an uplifting tone with hopeful outcomes. ";
  } else if (mood === 'contemplative') {
    style += "Include thoughtful moments and philosophical elements. ";
  } else if (mood === 'adventurous') {
    style += "Emphasize action, discovery, and exciting plot developments. ";
  }
  
  // Genre-specific elements
  if (genre?.includes('Mystery')) {
    style += "Build suspense gradually with clever clues and red herrings. ";
  } else if (genre?.includes('Romance')) {
    style += "Focus on emotional connection and relationship development. ";
  } else if (genre?.includes('Self-Help')) {
    style += "Include practical insights and actionable advice woven into narrative. ";
  }
  
  return style;
}

function assessBookQuality(book: GeneratedBook): number {
  let score = 0.5; // Base score
  
  // Check if title exists and is meaningful
  if (book.title && book.title.length > 5) score += 0.1;
  
  // Check if premise exists and is substantial
  if (book.premise && book.premise.length > 50) score += 0.1;
  
  // Check if themes are provided
  if (book.themes && book.themes.length >= 3) score += 0.1;
  
  // Check if personalized elements are detailed
  if (book.personalizedElements && book.personalizedElements.length >= 3) score += 0.1;
  
  // Check if chapters are provided
  if (book.chapters && book.chapters.length >= 3) score += 0.1;
  
  return Math.min(1.0, score);
}
