import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { findUserById } from '../../lib/db';

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
  timeout: 120000 // Increased timeout for longer content generation
}) : null;

// Enhanced types
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
  complexity?: string;
  mood?: string;
  narrativeStyle?: string;
}

interface ChapterData {
  title: string;
  content: string;
}

interface GeneratedFullBook {
  chapters: ChapterData[];
}

// Enhanced chapter generation configurations
const chapterConfigurations = {
  opening: {
    purpose: 'establish setting, introduce main character, hint at the central conflict',
    elements: ['character introduction', 'world-building', 'inciting incident setup', 'tone establishment'],
    wordCount: '1200-1500'
  },
  development: {
    purpose: 'develop characters, escalate conflict, advance plot',
    elements: ['character development', 'conflict escalation', 'relationship building', 'world expansion'],
    wordCount: '1000-1400'
  },
  climax: {
    purpose: 'reach story climax, confront main conflict, character transformation',
    elements: ['climax confrontation', 'character growth', 'resolution setup', 'emotional peak'],
    wordCount: '1200-1600'
  },
  resolution: {
    purpose: 'resolve conflicts, show character growth, provide satisfying conclusion',
    elements: ['conflict resolution', 'character arc completion', 'thematic conclusion', 'future implications'],
    wordCount: '1000-1300'
  }
};

// Reading level specific instructions
const readingLevelInstructions = {
  'casual': {
    vocabulary: 'Use everyday language, explain complex concepts simply, keep sentences flowing and readable',
    pacing: 'Quick-moving scenes, frequent dialogue, shorter paragraphs, engaging action',
    depth: 'Focus on plot and character emotions, lighter on philosophical themes'
  },
  'intermediate': {
    vocabulary: 'Rich vocabulary but accessible, some literary devices, varied sentence structure',
    pacing: 'Balanced pacing with good scene variety, mix of action and reflection',
    depth: 'Moderate thematic depth, character psychology, some subtext'
  },
  'advanced': {
    vocabulary: 'Sophisticated vocabulary, complex literary devices, varied and complex prose',
    pacing: 'Thoughtful pacing, complex scene structures, deeper character exploration',
    depth: 'Rich thematic content, psychological complexity, layered meanings'
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

  if (!apiKey || !openai) {
    return res.status(500).json({ error: 'AI service not configured' });
  }

  try {
    const { bookSummary, userProfile }: { bookSummary: BookSummary; userProfile: UserProfile } = req.body;
    
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    console.log(`Generating full book content for user ${userId}:`, bookSummary.title);
    
    // Generate enhanced content for each chapter
    const chapters = await Promise.allSettled(
      bookSummary.chapters.map(async (chapterTitle: string, index: number): Promise<ChapterData> => {
        const content = await generateEnhancedChapterContent(
          chapterTitle, 
          index, 
          bookSummary, 
          userProfile,
          userId
        );
        return { title: chapterTitle, content };
      })
    );
    
    // Handle any failed chapter generations
    const successfulChapters: ChapterData[] = [];
    const failedChapters: number[] = [];
    
    chapters.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulChapters.push(result.value);
      } else {
        console.error(`Chapter ${index + 1} generation failed:`, result.reason);
        failedChapters.push(index);
        // Create fallback content for failed chapters
        successfulChapters.push({
          title: bookSummary.chapters[index],
          content: createEnhancedFallbackContent(bookSummary.chapters[index], userProfile, bookSummary, index)
        });
      }
    });
    
    const result: GeneratedFullBook = { chapters: successfulChapters };
    
    if (failedChapters.length > 0) {
      console.log(`Generated book with ${failedChapters.length} fallback chapters`);
    }
    
    return res.status(200).json(result);
    
  } catch (error: any) {
    console.error('Full book generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate full book content. Please try again.',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function generateEnhancedChapterContent(
  chapterTitle: string, 
  chapterIndex: number, 
  bookSummary: BookSummary, 
  userProfile: UserProfile,
  userId: string
): Promise<string> {
  if (!openai) throw new Error('OpenAI client not available');

  // Determine chapter type and configuration
  const totalChapters = bookSummary.chapters.length;
  let chapterType: 'opening' | 'development' | 'climax' | 'resolution';
  
  if (chapterIndex === 0) {
    chapterType = 'opening';
  } else if (chapterIndex >= totalChapters - 2) {
    chapterType = chapterIndex === totalChapters - 1 ? 'resolution' : 'climax';
  } else {
    chapterType = 'development';
  }
  
  const chapterConfig = chapterConfigurations[chapterType];
  const readingConfig = readingLevelInstructions[userProfile.readingLevel as keyof typeof readingLevelInstructions] || readingLevelInstructions['intermediate'];

  // Create story context for consistency
  const storyContext = `
BOOK CONTEXT:
- Title: "${bookSummary.title}"
- Genre: ${bookSummary.genre}
- Premise: ${bookSummary.premise}
- Main Themes: ${bookSummary.themes.join(', ')}
- Narrative Style: ${bookSummary.narrativeStyle || 'third person'}
- Mood: ${bookSummary.mood || userProfile.currentMood}

READER: ${userProfile.name}
- Interests: ${userProfile.interests.join(', ')}
- Personality: ${userProfile.personalityTraits.join(', ')}
- Reading Level: ${userProfile.readingLevel}
- Location Context: ${userProfile.location || 'modern setting'}

CHAPTER CONTEXT:
- Position: Chapter ${chapterIndex + 1} of ${totalChapters}
- Type: ${chapterType} chapter
- Purpose: ${chapterConfig.purpose}
- Target Length: ${chapterConfig.wordCount} words
`;

  const enhancedPrompt = `Write Chapter ${chapterIndex + 1}: "${chapterTitle}" for the personalized book "${bookSummary.title}".

${storyContext}

CHAPTER REQUIREMENTS:
1. PURPOSE: ${chapterConfig.purpose}
2. KEY ELEMENTS: Include ${chapterConfig.elements.join(', ')}
3. PERSONALIZATION: 
   - Reflect ${userProfile.name}'s interests in ${userProfile.interests.slice(0, 3).join(', ')}
   - Character traits should echo ${userProfile.personalityTraits.slice(0, 2).join(' and ')} qualities
   - Include subtle references to ${userProfile.location ? `${userProfile.location} context` : 'familiar modern settings'}
   - Match the ${userProfile.currentMood} mood through tone and pacing

WRITING STYLE:
- Reading Level: ${userProfile.readingLevel}
- Vocabulary: ${readingConfig.vocabulary}
- Pacing: ${readingConfig.pacing}
- Depth: ${readingConfig.depth}

STORY PROGRESSION:
${chapterIndex === 0 ? 
  `- Introduce the world and main character in a way that feels personal to ${userProfile.name}
   - Set up the central conflict while weaving in themes of ${bookSummary.themes.slice(0, 2).join(' and ')}
   - Establish the ${bookSummary.narrativeStyle || 'narrative'} voice` :
  chapterIndex < totalChapters - 2 ?
  `- Build on previous chapter developments
   - Escalate the central conflict
   - Develop character relationships and growth
   - Advance toward the climax while maintaining themes` :
  chapterIndex === totalChapters - 1 ?
  `- Provide satisfying resolution to all conflicts
   - Show character growth and transformation
   - Connect back to the themes of ${bookSummary.themes.join(', ')}
   - End with hope and personal relevance to ${userProfile.name}` :
  `- Build to the story's climax
   - Confront the main conflict directly
   - Show character at their moment of greatest challenge
   - Set up for final resolution`
}

PERSONALIZATION NOTES:
${bookSummary.personalizedElements.map((element, i) => `${i + 1}. ${element}`).join('\n')}

Write a complete, engaging chapter (${chapterConfig.wordCount} words) that feels like it was written specifically for ${userProfile.name}. Include vivid descriptions, realistic dialogue, and emotional depth appropriate for ${userProfile.readingLevel} readers.

Write ONLY the chapter content - no title headers, no formatting instructions, just the story text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'google/gemini-flash-1.5',
      temperature: 0.7, // Slightly lower for more consistent quality
      max_tokens: 3000, // Increased for longer chapters
      messages: [
        {
          role: 'system',
          content: `You are an expert novelist writing personalized fiction. Create immersive, engaging chapter content that feels tailored to the specific reader. Focus on rich character development, vivid settings, and emotional resonance. Maintain consistency with the overall story while making each chapter compelling on its own.`
        },
        { role: 'user', content: enhancedPrompt }
      ]
    });

    const content = completion.choices[0].message?.content || '';
    
    if (content.length < 500) {
      console.warn(`Chapter ${chapterIndex + 1} content seems too short, using fallback`);
      return createEnhancedFallbackContent(chapterTitle, userProfile, bookSummary, chapterIndex);
    }
    
    return content;
    
  } catch (error: any) {
    console.error(`Error generating chapter ${chapterIndex + 1}:`, error);
    return createEnhancedFallbackContent(chapterTitle, userProfile, bookSummary, chapterIndex);
  }
}

function createEnhancedFallbackContent(
  chapterTitle: string, 
  userProfile: UserProfile, 
  bookSummary: BookSummary,
  chapterIndex: number
): string {
  const totalChapters = bookSummary.chapters.length;
  const isOpening = chapterIndex === 0;
  const isClimactic = chapterIndex >= totalChapters - 2;
  const isResolution = chapterIndex === totalChapters - 1;
  
  // Create more sophisticated fallback content based on chapter position
  let chapterContent = '';
  
  if (isOpening) {
    chapterContent = `The morning light filtered through the window as ${userProfile.name} would have imagined it—soft and promising, carrying with it the scent of ${userProfile.interests.includes('Nature') ? 'fresh pine and morning dew' : userProfile.interests.includes('Cooking') ? 'fresh coffee and baking bread' : 'new possibilities'}. This was the beginning of something extraordinary, a journey that would weave together all the elements that made life meaningful.

The protagonist of our story embodied the very qualities that ${userProfile.name} understood deeply—the ${userProfile.personalityTraits.slice(0, 2).join(' and ')} nature that comes from experience and wisdom. There was something familiar about the setting, reminiscent of ${userProfile.location || 'places that feel like home'}, where stories worth telling often begin.

As the chapter unfolds, the themes of ${bookSummary.themes.slice(0, 2).join(' and ')} begin to emerge, not through heavy-handed exposition, but through the lived experience of characters who feel real because they reflect the complexities that ${userProfile.name} would recognize from their own journey.`;
  } else if (isResolution) {
    chapterContent = `The resolution came not with fanfare, but with the quiet satisfaction that ${userProfile.name} would appreciate—the kind that comes from understanding that growth happens in moments both large and small. The journey had tested every aspect of character, much like the real challenges of ${userProfile.personalChallenges.slice(0, 2).join(' and ')}.

Looking back, the protagonist could see how each choice had led to this moment of clarity. The interests that had seemed separate—${userProfile.interests.slice(0, 3).join(', ')}—now formed a coherent pattern, a tapestry of meaning that spoke to the very themes the story had explored: ${bookSummary.themes.join(', ')}.

As this personalized tale reaches its conclusion, there's a sense of completion that honors both the journey taken and the paths yet to be explored. For someone like ${userProfile.name}, who understands the value of ${userProfile.personalityTraits.slice(0, 2).join(' and ')} approaches to life's challenges, this ending offers not just closure, but the promise of new beginnings.`;
  } else if (isClimactic) {
    chapterContent = `This was the moment everything had been building toward—the convergence of all the challenges, all the growth, all the themes that had woven through the story like threads in a tapestry. For ${userProfile.name}, reading this climactic chapter, there would be recognition in the way the protagonist faced their greatest trial with the same ${userProfile.personalityTraits.slice(0, 2).join(' and ')} spirit that defines true character.

The conflict that arose touched on the deepest themes of the story: ${bookSummary.themes.slice(0, 3).join(', ')}. It was the kind of challenge that required not just courage, but the wisdom that comes from understanding one's own interests and passions—the very qualities that made ${userProfile.name}'s approach to ${userProfile.interests.slice(0, 2).join(' and ')} so uniquely their own.

In this crucial moment, every lesson learned, every relationship forged, every insight gained throughout the journey would be tested. The resolution was still to come, but already the transformation was evident—the kind of growth that comes from facing one's challenges with authenticity and purpose.`;
  } else {
    chapterContent = `The story continued to unfold with the careful pacing that ${userProfile.name} would appreciate, building layer upon layer of meaning while maintaining the engaging momentum that keeps readers invested. This chapter delved deeper into the world established earlier, exploring how the themes of ${bookSummary.themes.slice(0, 2).join(' and ')} played out in the daily lives of characters who felt remarkably real.

There was something in the way the protagonist approached challenges that would resonate with ${userProfile.name}—perhaps it was the ${userProfile.personalityTraits.slice(0, 2).join(' and ')} approach to problem-solving, or the way their interests in ${userProfile.interests.slice(0, 3).join(', ')} informed their perspective on the unfolding events.

As the chapter progressed, the complexity of the situation became more apparent, much like the real-world challenges that ${userProfile.name} might recognize from their own experience with ${userProfile.personalChallenges.slice(0, 2).join(' and ')}. Yet there was hope in the narrative, a sense that understanding and growth were not just possible, but inevitable for those willing to embrace the journey.`;
  }
  
  // Add reading level appropriate complexity
  if (userProfile.readingLevel === 'casual') {
    chapterContent = chapterContent.replace(/—[^—]*—/g, '').replace(/,\s*[^,]*,/g, ','); // Simplify complex sentences
  } else if (userProfile.readingLevel === 'advanced') {
    chapterContent += `\n\nThe narrative layers of this chapter invite multiple readings, each revealing new insights into the human condition and the specific challenges that define our time. For a reader like ${userProfile.name}, with their sophisticated understanding of ${userProfile.interests.slice(0, 2).join(' and ')}, the subtleties embedded in this section of the story offer rich material for reflection and personal application.`;
  }
  
  return chapterContent;
}
