import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 30000 // 30 second timeout
});

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
  qualityScore?: number;
  generationId: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const profile: UserProfile = req.body;
    
    // Validate input
    if (!profile.name || !profile.preferredGenre || !profile.interests?.length) {
      return book;
      
    } catch (error) {
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
  const prompt = buildAdvancedPrompt(profile);
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use gpt-4o when available
      temperature: 0.85,
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
    
    // Safety check
    const moderation = await openai.moderations.create({ 
      input: rawContent 
    });
    
    if (moderation.results[0].flagged) {
      throw new Error('Content failed safety checks - content policy violation');
    }

    // Parse and validate JSON
    let book: GeneratedBook;
    try {
      book = JSON.parse(rawContent);
    } catch (parseError) {
      throw new Error('Invalid JSON response from AI model');
    }
    
    // Add generation metadata
    book.generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate required fields
    if (!book.title || !book.premise || !book.chapters?.length) {
      throw new Error('Generated book missing required fields');
    }
    
    return book;
    
  } catch (error) {
    if (error.code === 'rate_limit_exceeded') {
      throw new Error('AI service rate limit exceeded');
    }
    throw error;
  }
}

function buildAdvancedPrompt(profile: UserProfile): string {
  const personalityInsights = analyzePersonality(profile);
  const narrativeStyle = determineNarrativeStyle(profile);
  
  return `Create a personalized ${profile.preferredGenre.toLowerCase()} book as JSON with this exact structure:

{
  "title": "string",
  "author": "string", 
  "genre": "string",
  "premise": "string (2-3 sentences)",
  "themes": ["string array of 3-5 core themes"],
  "personalizedElements": ["string array of 5-7 specific personalizations"],
  "chapters": [
    {"title": "string", "summary": "string (1-2 sentences)"}
  ],
  "estimatedLength": "string (e.g., '15,000 words')",
  "readingTime": "string (e.g., '45-60 minutes')"
}

PERSONALIZATION PROFILE:
${JSON.stringify(profile, null, 2)}

PERSONALITY INSIGHTS:
${personalityInsights}

NARRATIVE REQUIREMENTS:
- Reading level: ${profile.readingLevel || 'casual'} (adjust vocabulary and complexity accordingly)
- Mood alignment: ${profile.currentMood} (reflect this in tone and pacing)
- Location integration: ${profile.location ? `Incorporate ${profile.location} setting elements` : 'Use relatable settings'}
- Challenge focus: ${profile.personalChallenges.length ? `Address these life areas: ${profile.personalChallenges.slice(0, 2).join(', ')}` : 'Focus on universal growth themes'}

STYLE GUIDE:
${narrativeStyle}

Create 5-7 chapters with compelling titles and summaries. Make the story feel specifically written for this person - not generic. Include subtle references to their interests (${profile.interests.slice(0, 4).join(', ')}) and personality traits (${profile.personalityTraits.slice(0, 3).join(', ')}).

The personalizedElements array should list specific ways this book is customized for them.

OUTPUT VALID JSON ONLY - NO MARKDOWN, NO CODE FENCES.`;
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
  if (genre.includes('Mystery')) {
    style += "Build suspense gradually with clever clues and red herrings. ";
  } else if (genre.includes('Romance')) {
    style += "Focus on emotional connection and relationship development. ";
  } else if (genre.includes('Self-Help')) {
    style += "Include practical insights and actionable advice woven into narrative. ";
  }
  
  return style;
}

async function assessBookQuality(book: GeneratedBook): Promise<number> {
  try {
    // Quick quality assessment using GPT
    const assessment = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.1,
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: 'Rate the quality of this book concept on a scale of 0.0 to 1.0. Consider: coherence, personalization depth, engagement potential, and appropriateness. Respond with just a number.'
        },
        {
          role: 'user',
          content: `Title: ${book.title}\nPremise: ${book.premise}\nChapters: ${book.chapters.length}\nPersonalized Elements: ${book.personalizedElements.length}`
        }
      ]
    });
    
    const scoreText = assessment.choices[0].message?.content?.trim();
    const score = parseFloat(scoreText || '0.5');
    return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
    
  } catch (error) {
    console.error('Quality assessment failed:', error);
    return 0.7; // Default acceptable score
  }
} res.status(400).json({ 
        error: 'Missing required fields: name, preferredGenre, and interests are required' 
      });
    }

    // Generate book with retries
    const book = await generateBookWithRetries(profile, 3);
    
    // Log successful generation for analytics
    console.log(`Book generated successfully for ${profile.name}, genre: ${profile.preferredGenre}`);
    
    return res.status(200).json(book);
    
  } catch (error) {
    console.error('Book generation error:', error);
    
    if (error.message?.includes('rate limit')) {
      return res.status(429).json({ error: 'AI service rate limit exceeded. Please try again in a few moments.' });
    }
    
    if (error.message?.includes('content policy')) {
      return res.status(400).json({ error: 'Content failed safety checks. Please try different preferences.' });
    }
    
    return res.status(500).json({ 
      error: 'Book generation failed. Please try again.' 
    });
  }
}

async function generateBookWithRetries(profile: UserProfile, maxRetries: number): Promise<GeneratedBook> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Generation attempt ${attempt} for ${profile.name}`);
      
      const book = await generateBook(profile);
      
      // Quality check
      const qualityScore = await assessBookQuality(book);
      book.qualityScore = qualityScore;
      
      if (qualityScore < 0.6 && attempt < maxRetries) {
        console.log(`Quality score ${qualityScore} too low, retrying...`);
        continue;
      }
      
      return
