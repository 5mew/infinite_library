import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { saveUserBook, findUserById } from '../../lib/db';

// Check if API key exists
const apiKey = process.env.OPENROUTER_API_KEY;
console.log('OpenRouter API Key exists:', !!apiKey);
console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 15)}...` : 'MISSING');

// Configure OpenAI client to use OpenRouter
const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "Authorization": `Bearer ${apiKey}`,
    "HTTP-Referer": process.env.VERCEL_URL || "http://localhost:3000",
    "X-Title": "Infinite Library",
    "Content-Type": "application/json"
  },
  timeout: 90000 // Increased timeout for complex generations
}) : null;

// Enhanced types
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
  variation?: number; // For adding randomness to avoid repetition
  previousBooks?: Array<{ title: string; genre: string }>; // To avoid similar books
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
  complexity: string;
  mood: string;
  tags: string[];
  narrativeStyle: string;
};

// Enhanced genre-specific configurations for better variety
const genreEnhancements = {
  'Mystery/Thriller': {
    prompts: [
      'psychological mystery with unexpected twists',
      'cozy mystery in a small town setting',
      'noir-style detective story',
      'international espionage thriller',
      'locked room mystery'
    ],
    themes: ['justice', 'truth vs lies', 'moral ambiguity', 'investigation', 'hidden secrets'],
    styles: ['first-person detective', 'multiple suspects POV', 'procedural', 'atmospheric']
  },
  'Romance': {
    prompts: [
      'second chance romance with deep emotional connection',
      'enemies to lovers with witty banter',
      'workplace romance with professional challenges',
      'small town romance with community ties',
      'friends to lovers with long history'
    ],
    themes: ['love conquers all', 'personal growth', 'trust and vulnerability', 'family dynamics', 'self-discovery'],
    styles: ['dual POV', 'slow burn', 'emotional journey', 'contemporary setting']
  },
  'Science Fiction': {
    prompts: [
      'near-future technological thriller',
      'space exploration adventure',
      'AI consciousness exploration',
      'dystopian society resistance',
      'time travel consequences'
    ],
    themes: ['humanity vs technology', 'exploration and discovery', 'ethics of progress', 'future society', 'identity'],
    styles: ['hard sci-fi', 'space opera', 'cyberpunk', 'philosophical sci-fi']
  },
  'Fantasy': {
    prompts: [
      'urban fantasy in modern world',
      'epic quest in magical realm',
      'magical realism in everyday life',
      'dark fantasy with moral complexity',
      'portal fantasy to new world'
    ],
    themes: ['good vs evil', 'power and responsibility', 'magic and wonder', 'heroic journey', 'destiny'],
    styles: ['epic fantasy', 'urban fantasy', 'magical realism', 'dark fantasy']
  },
  'Self-Help': {
    prompts: [
      'practical guide with personal stories',
      'transformative journey narrative',
      'step-by-step empowerment guide',
      'mindset shift exploration',
      'life skills mastery story'
    ],
    themes: ['personal empowerment', 'growth mindset', 'overcoming obstacles', 'goal achievement', 'self-discovery'],
    styles: ['narrative non-fiction', 'practical guide', 'inspirational journey', 'case study approach']
  },
  'Adventure': {
    prompts: [
      'survival adventure in extreme conditions',
      'treasure hunting expedition',
      'journey of self-discovery',
      'rescue mission adventure',
      'exploration of unknown territories'
    ],
    themes: ['courage and bravery', 'survival instincts', 'friendship and loyalty', 'perseverance', 'discovery'],
    styles: ['action-packed', 'survival narrative', 'quest story', 'exploration adventure']
  }
};

// Reading level configurations
const readingLevelConfigs = {
  'casual': {
    complexity: 'accessible and engaging',
    vocabulary: 'everyday language with clear explanations',
    sentenceStructure: 'shorter, flowing sentences',
    pacing: 'quick-moving with frequent chapter breaks'
  },
  'intermediate': {
    complexity: 'balanced depth and accessibility',
    vocabulary: 'rich but not overly complex vocabulary',
    sentenceStructure: 'varied sentence structure',
    pacing: 'steady development with good pacing'
  },
  'advanced': {
    complexity: 'sophisticated and nuanced',
    vocabulary: 'extensive vocabulary and literary devices',
    sentenceStructure: 'complex, layered prose',
    pacing: 'thoughtful development with deeper exploration'
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user info from middleware-set headers
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check API key
  if (!apiKey || !openai) {
    console.error('OPENROUTER_API_KEY environment variable is missing');
    return res.status(500).json({ 
      error: 'AI service not configured. Please contact support.' 
    });
  }

  try {
    const profile: UserProfile = req.body;
    console.log(`Generating book for user ${userId}:`, { name: profile.name, genre: profile.preferredGenre });
    
    // Validate input
    if (!profile.name || !profile.preferredGenre || !profile.interests?.length) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, preferredGenre, and interests are required' 
      });
    }

    // Get user details for more personalized generation
    const user = await findUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('Starting enhanced book generation...');
    
    // Generate book with enhanced personalization
    const book = await generateEnhancedBook(profile, userId);
    
    // Save book to user's library
    await saveUserBook(userId, book);
    
    console.log('Book generated and saved successfully:', book.title);
    
    return res.status(200).json(book);
    
  } catch (error: any) {
    console.error('Full error details:', error);
    
    if (error.status === 401 || error.message?.includes('401') || error.message?.includes('auth')) {
      return res.status(401).json({ 
        error: 'AI service authentication failed. Please try again later.',
        debug: process.env.NODE_ENV === 'development' ? {
          hasApiKey: !!apiKey,
          keyFormat: apiKey ? (apiKey.startsWith('sk-or-v1-') ? 'correct' : 'incorrect') : 'missing',
          errorMessage: error.message
        } : undefined
      });
    }
    
    if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
      return res.status(429).json({ error: 'Too many requests. Please try again in a few moments.' });
    }
    
    return res.status(500).json({ 
      error: 'Book generation failed. Please try again.',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function generateEnhancedBook(profile: UserProfile, userId: string): Promise<GeneratedBook> {
  if (!openai) {
    throw new Error('OpenRouter client not available');
  }

  console.log('Calling OpenRouter API with enhanced prompt...');

  // Get genre-specific enhancements
  const genreConfig = genreEnhancements[profile.preferredGenre as keyof typeof genreEnhancements] || genreEnhancements['Adventure'];
  const readingConfig = readingLevelConfigs[profile.readingLevel as keyof typeof readingLevelConfigs] || readingLevelConfigs['intermediate'];
  
  // Add variety by selecting different prompt variations
  const variationIndex = Math.floor((profile.variation || Math.random()) * genreConfig.prompts.length);
  const selectedPrompt = genreConfig.prompts[variationIndex];
  const selectedThemes = genreConfig.themes.slice(0, 3 + Math.floor(Math.random() * 2)); // 3-4 themes
  const selectedStyle = genreConfig.styles[Math.floor(Math.random() * genreConfig.styles.length)];

  // Create enhanced personalization context
  const personalizationContext = `
READER PROFILE FOR ${profile.name}:
- Age: ${profile.age}
- Location: ${profile.location || 'unspecified'}
- Core Interests: ${profile.interests.slice(0, 5).join(', ')}
- Personality: ${profile.personalityTraits.slice(0, 4).join(', ')}
- Current Mood: ${profile.currentMood}
- Reading Level: ${profile.readingLevel} (${readingConfig.complexity})
- Life Focus Areas: ${profile.personalChallenges.slice(0, 3).join(', ') || 'general growth'}
- Previous Books: ${profile.previousBooks?.map(b => `"${b.title}" (${b.genre})`).join(', ') || 'none'}
`;

  const enhancedPrompt = `Create a highly personalized ${profile.preferredGenre} book for ${profile.name}.

BOOK REQUIREMENTS:
- Style: ${selectedPrompt}
- Narrative Approach: ${selectedStyle}
- Reading Level: ${readingConfig.complexity}
- Vocabulary: ${readingConfig.vocabulary}
- Pacing: ${readingConfig.pacing}

${personalizationContext}

PERSONALIZATION INSTRUCTIONS:
1. Weave ${profile.name}'s interests (${profile.interests.slice(0, 3).join(', ')}) naturally into the plot
2. Create characters that reflect their personality traits (${profile.personalityTraits.slice(0, 3).join(', ')})
3. Address their current mood (${profile.currentMood}) through the story tone
4. If they have life challenges, subtly incorporate relevant themes of growth
5. Use language appropriate for ${profile.readingLevel} readers
6. Make the setting and details feel familiar to someone from ${profile.location || 'a modern setting'}

AVOID repeating elements from: ${profile.previousBooks?.map(b => b.title).join(', ') || 'none'}

Respond with ONLY valid JSON in this exact format:
{
  "title": "An engaging, original title that hints at personalization",
  "author": "AI Author (Crafted for ${profile.name})",
  "genre": "${profile.preferredGenre}",
  "premise": "A compelling 2-3 sentence premise that clearly shows how this story is tailored to ${profile.name}'s interests and personality",
  "themes": ${JSON.stringify(selectedThemes)},
  "personalizedElements": [
    "Specific way this book reflects ${profile.name}'s interest in [specific interest]",
    "How the main character embodies ${profile.name}'s [personality trait] nature",
    "Setting/plot element that connects to ${profile.name}'s [background/location/challenge]",
    "Narrative choice that matches ${profile.name}'s ${profile.currentMood} mood"
  ],
  "chapters": [
    "Chapter 1: [Engaging title that sets up the personalized story]",
    "Chapter 2: [Title showing character development]",
    "Chapter 3: [Title indicating conflict/challenge]",
    "Chapter 4: [Title showing growth/discovery]",
    "Chapter 5: [Title leading to climax]",
    "Chapter 6: [Resolution title that ties to personal growth]"
  ],
  "estimatedLength": "12,000-18,000 words",
  "readingTime": "40-75 minutes",
  "complexity": "${profile.readingLevel}",
  "mood": "${profile.currentMood}",
  "tags": ["personalized", "${profile.preferredGenre.toLowerCase()}", "${profile.currentMood}", "character-driven"],
  "narrativeStyle": "${selectedStyle}"
}

Make this book feel like it was written specifically for ${profile.name} - not just generic fiction with their name inserted.

Respond with ONLY the JSON - no markdown, no explanations, no extra text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'google/gemini-flash-1.5',
      temperature: 0.8,
      max_tokens: 4000,
      messages: [
        {
          role: 'system',
          content: `You are an expert novelist specializing in personalized fiction. You create unique, engaging stories tailored to individual readers' personalities, interests, and life situations. Your books feel genuinely personal, not generic. Always respond with valid JSON only.`
        },
        { 
          role: 'user', 
          content: enhancedPrompt 
        }
      ]
    });

    const rawContent = completion.choices[0].message?.content ?? '{}';
    console.log('OpenRouter response received');
    console.log('Raw content preview:', rawContent.substring(0, 200));

    // Clean up response (remove any markdown formatting)
    let cleanContent = rawContent.trim();
    if (cleanContent.includes('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    }
    if (cleanContent.includes('```')) {
      cleanContent = cleanContent.replace(/```/g, '');
    }
    
    // Extract JSON from response
    const jsonStart = cleanContent.indexOf('{');
    const jsonEnd = cleanContent.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }

    // Parse and validate JSON
    let book: any;
    try {
      book = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Clean content:', cleanContent);
      throw new Error('Invalid response from AI service. Please try again.');
    }
    
    // Add generation metadata
    book.generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate and provide enhanced defaults for required fields
    if (!book.title) book.title = `A Personal ${profile.preferredGenre} Story for ${profile.name}`;
    if (!book.author) book.author = `AI Author (Crafted for ${profile.name})`;
    if (!book.genre) book.genre = profile.preferredGenre;
    if (!book.premise) {
      book.premise = `A personalized ${profile.preferredGenre.toLowerCase()} story crafted especially for ${profile.name}, incorporating their passion for ${profile.interests.slice(0, 2).join(' and ')} and reflecting their ${profile.personalityTraits.slice(0, 1)[0] || 'unique'} personality.`;
    }
    if (!book.themes || !Array.isArray(book.themes)) {
      book.themes = selectedThemes;
    }
    if (!book.personalizedElements || !Array.isArray(book.personalizedElements)) {
      book.personalizedElements = [
        `Written specifically for ${profile.name}'s interests in ${profile.interests.slice(0, 2).join(' and ')}`,
        `Characters that embody ${profile.name}'s ${profile.personalityTraits.slice(0, 1)[0] || 'unique'} personality`,
        `Themes that resonate with ${profile.name}'s current ${profile.currentMood} mood`,
        `Setting and situations that feel familiar to ${profile.name}'s background`
      ];
    }
    if (!book.chapters || !Array.isArray(book.chapters) || book.chapters.length < 5) {
      book.chapters = [
        'Chapter 1: A New Beginning',
        'Chapter 2: Discovery and Challenge',
        'Chapter 3: Growing Obstacles',
        'Chapter 4: Moment of Truth',
        'Chapter 5: Resolution and Growth',
        'Chapter 6: New Horizons'
      ];
    }
    if (!book.estimatedLength) book.estimatedLength = '12,000-18,000 words';
    if (!book.readingTime) book.readingTime = '40-75 minutes';
    if (!book.complexity) book.complexity = profile.readingLevel;
    if (!book.mood) book.mood = profile.currentMood;
    if (!book.tags || !Array.isArray(book.tags)) {
      book.tags = ['personalized', profile.preferredGenre.toLowerCase(), profile.currentMood];
    }
    if (!book.narrativeStyle) book.narrativeStyle = selectedStyle;
    
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
      throw new Error('AI service authentication failed');
    }
    
    if (error.status === 429) {
      throw new Error('Too many requests to AI service');
    }
    
    if (error.status === 402) {
      throw new Error('AI service quota exceeded');
    }
    
    throw new Error('AI service temporarily unavailable: ' + error.message);
  }
}
