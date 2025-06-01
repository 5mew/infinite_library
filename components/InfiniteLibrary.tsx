import React, { useState, useEffect } from 'react';
import { 
  Book, Sparkles, User, Heart, Globe, Clock, Download, Star, 
  BookOpen, Feather, Scroll, Library, Quote, ArrowRight,
  CheckCircle, Circle, Zap, Crown, Bookmark, Search, Filter,
  Grid, List, RefreshCw, Share2, Save, Eye, Trash2, Settings,
  PlusCircle, BookMarked, Calendar, TrendingUp, Award
} from 'lucide-react';

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

interface GeneratedBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  premise: string;
  themes: string[];
  personalizedElements: string[];
  chapters: string[];
  estimatedLength: string;
  readingTime: string;
  createdAt: Date;
  lastRead?: Date;
  readingProgress: number;
  favorite: boolean;
  tags: string[];
  mood: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface BookContent {
  chapters: Array<{
    title: string;
    content: string;
  }>;
  loading?: boolean;
}

interface LibraryStats {
  totalBooks: number;
  booksRead: number;
  readingStreak: number;
  favoriteGenre: string;
  totalReadingTime: number;
}

const InfiniteLibrary = () => {
  const [currentStep, setCurrentStep] = useState<string>('welcome');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    age: '',
    interests: [],
    readingLevel: '',
    preferredGenre: '',
    personalityTraits: [],
    currentMood: '',
    location: '',
    personalChallenges: []
  });
  
  // Enhanced library state
  const [personalLibrary, setPersonalLibrary] = useState<GeneratedBook[]>([]);
  const [currentBook, setCurrentBook] = useState<GeneratedBook | null>(null);
  const [libraryView, setLibraryView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'progress' | 'favorite'>('recent');
  const [libraryStats, setLibraryStats] = useState<LibraryStats>({
    totalBooks: 0,
    booksRead: 0,
    readingStreak: 0,
    favoriteGenre: '',
    totalReadingTime: 0
  });
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string>('');
  const [animationStep, setAnimationStep] = useState<number>(0);
  
  // Reading state
  const [isReading, setIsReading] = useState<boolean>(false);
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [bookContent, setBookContent] = useState<BookContent | null>(null);

  // Quick generation presets
  const quickGenPresets = [
    { name: 'Quick Mystery', genre: 'Mystery/Thriller', mood: 'adventurous', tags: ['quick-read', 'suspense'] },
    { name: 'Comfort Read', genre: 'Romance', mood: 'peaceful', tags: ['feel-good', 'light'] },
    { name: 'Brain Food', genre: 'Science Fiction', mood: 'contemplative', tags: ['thought-provoking', 'complex'] },
    { name: 'Adventure Time', genre: 'Adventure', mood: 'energetic', tags: ['action', 'exciting'] },
    { name: 'Life Wisdom', genre: 'Self-Help', mood: 'motivated', tags: ['growth', 'practical'] },
    { name: 'Fantasy Escape', genre: 'Fantasy', mood: 'dreamy', tags: ['magical', 'immersive'] }
  ];

  const interests: string[] = [
    'Technology', 'Nature', 'Adventure', 'Mystery', 'Romance', 'Science',
    'History', 'Art', 'Music', 'Sports', 'Travel', 'Cooking', 'Animals',
    'Space', 'Magic', 'Friendship', 'Family', 'Career', 'Health', 'Philosophy',
    'Psychology', 'Economics', 'Politics', 'Environment', 'Innovation'
  ];

  const personalityTraits: string[] = [
    'Adventurous', 'Analytical', 'Creative', 'Empathetic', 'Humorous',
    'Introverted', 'Optimistic', 'Practical', 'Curious', 'Ambitious',
    'Compassionate', 'Independent', 'Thoughtful', 'Energetic', 'Patient',
    'Bold', 'Diplomatic', 'Innovative', 'Resilient', 'Wise'
  ];

  const personalChallenges: string[] = [
    'Building confidence', 'Career transition', 'Relationship issues',
    'Stress management', 'Finding purpose', 'Overcoming fear',
    'Work-life balance', 'Health goals', 'Financial planning',
    'Personal growth', 'Communication skills', 'Time management',
    'Creative blocks', 'Decision making', 'Self-acceptance'
  ];

  const genres: string[] = [
    'Mystery/Thriller', 'Romance', 'Science Fiction', 'Fantasy',
    'Self-Help', 'Adventure', 'Historical Fiction', 'Contemporary Fiction',
    'Educational', 'Children\'s Story', 'Biography/Memoir', 'Comedy',
    'Horror', 'Drama', 'Poetry', 'Philosophy', 'Business', 'Health & Wellness'
  ];

  // Enhanced book generation with variety
  const generatePersonalizedBook = async (preset?: any) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationError('');
    
    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      // If using preset, modify profile temporarily
      const profileToUse = preset ? {
        ...userProfile,
        preferredGenre: preset.genre,
        currentMood: preset.mood
      } : userProfile;

      const res = await fetch('/api/generateBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileToUse,
          variation: Math.random(), // Add randomness for variety
          previousBooks: personalLibrary.map(book => ({ title: book.title, genre: book.genre }))
        })
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Book generation failed');
      }

      const data = await res.json();
      
      // Enhanced book object
      const newBook: GeneratedBook = {
        ...data,
        id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        readingProgress: 0,
        favorite: false,
        tags: preset?.tags || [],
        mood: preset?.mood || userProfile.currentMood,
        difficulty: determineDifficulty(userProfile.readingLevel, data.genre)
      };

      setPersonalLibrary(prev => [newBook, ...prev]);
      setCurrentBook(newBook);
      updateLibraryStats();
      setCurrentStep(preset ? 'library' : 'generated');
      
    } catch (error: any) {
      console.error('Book generation error:', error);
      setGenerationError(error.message || 'Something went wrong during book generation. Please try again.');
      if (!preset) setCurrentStep('profile');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const determineDifficulty = (readingLevel: string, genre: string): 'easy' | 'medium' | 'hard' => {
    if (readingLevel === 'casual') return 'easy';
    if (readingLevel === 'advanced') return 'hard';
    return genre === 'Science Fiction' || genre === 'Philosophy' ? 'hard' : 'medium';
  };

  const updateLibraryStats = () => {
    setLibraryStats(prev => ({
      totalBooks: personalLibrary.length + 1,
      booksRead: personalLibrary.filter(book => book.readingProgress === 100).length,
      readingStreak: calculateReadingStreak(),
      favoriteGenre: getMostPopularGenre(),
      totalReadingTime: calculateTotalReadingTime()
    }));
  };

  const calculateReadingStreak = (): number => {
    // Simple streak calculation - in production, use actual reading dates
    return Math.floor(personalLibrary.length / 3);
  };

  const getMostPopularGenre = (): string => {
    if (personalLibrary.length === 0) return userProfile.preferredGenre;
    const genreCounts = personalLibrary.reduce((acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(genreCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '';
  };

  const calculateTotalReadingTime = (): number => {
    return personalLibrary.reduce((total, book) => {
      const readingTimeNum = parseInt(book.readingTime.split('-')[0]) || 30;
      return total + (readingTimeNum * book.readingProgress / 100);
    }, 0);
  };

  const filteredLibrary = personalLibrary.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.themes.some(theme => theme.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGenre = filterGenre === 'all' || book.genre === filterGenre;
    return matchesSearch && matchesGenre;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title': return a.title.localeCompare(b.title);
      case 'progress': return b.readingProgress - a.readingProgress;
      case 'favorite': return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const toggleBookFavorite = (bookId: string) => {
    setPersonalLibrary(prev => prev.map(book => 
      book.id === bookId ? { ...book, favorite: !book.favorite } : book
    ));
  };

  const deleteBook = (bookId: string) => {
    setPersonalLibrary(prev => prev.filter(book => book.id !== bookId));
    updateLibraryStats();
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: keyof UserProfile, item: string) => {
    setUserProfile(prev => {
      const currentArray = prev[field] as string[];
      return {
        ...prev,
        [field]: currentArray.includes(item) 
          ? currentArray.filter(i => i !== item)
          : [...currentArray, item]
      };
    });
  };

  const generateFullBook = async (book: GeneratedBook) => {
    try {
      setBookContent({ chapters: [], loading: true });
      
      const res = await fetch('/api/generateFullBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookSummary: book,
          userProfile: userProfile 
        })
      });

      if (!res.ok) {
        throw new Error('Failed to generate full book content');
      }

      const fullContent = await res.json();
      setBookContent(fullContent);
      
    } catch (error) {
      console.error('Full book generation error:', error);
      setBookContent(createFallbackContent(book));
    }
  };

  const createFallbackContent = (book: GeneratedBook): BookContent => {
    return {
      chapters: book.chapters.map((title, index) => ({
        title,
        content: `This is the beginning of ${title}. In this chapter, our story unfolds as ${userProfile.name} embarks on a journey that reflects their love of ${userProfile.interests.slice(0, 2).join(' and ')}. 

The narrative weaves together elements that speak to their ${userProfile.personalityTraits.slice(0, 2).join(' and ')} nature, creating a story that feels both familiar and wonderfully new.

As the chapter progresses, themes of ${book.themes.slice(0, 2).join(' and ')} become apparent, setting the stage for the adventures to come.

This personalized tale continues to unfold, drawing from the rich tapestry of ${userProfile.name}'s unique perspective and experiences...

[This is a preview of your personalized book. The full AI-generated content would continue here with rich, detailed storytelling tailored specifically to your profile and preferences.]`
      }))
    };
  };

  // Enhanced Welcome Screen with Library Overview
  const renderWelcome = () => (
    <div className="min-h-screen paper-texture relative overflow-hidden">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="text-center space-y-12 max-w-5xl mx-auto">
          <div className={`space-y-8 ${animationStep >= 1 ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 animate-book-flip">
                  <BookOpen className="w-24 h-24 text-purple-600" />
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full opacity-20 blur-xl"></div>
              </div>
            </div>
            
            <h1 className="font-display text-7xl md:text-8xl font-bold text-gray-900 leading-tight">
              Infinite
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 bg-clip-text text-transparent">
                {' '}Library
              </span>
            </h1>
            
            <p className="font-serif text-2xl md:text-3xl text-gray-700 leading-relaxed italic">
              "Where every story is written uniquely for you"
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="font-medium">AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-medium">Personalized</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Instant Generation</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <button 
              onClick={() => setCurrentStep('profile')}
              className="group card-elegant p-8 hover-lift text-left"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <PlusCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display text-2xl font-semibold">Create Your First Book</h3>
              </div>
              <p className="font-serif text-gray-600 mb-4">Start by telling us about yourself to generate a perfectly personalized story.</p>
              <div className="flex items-center text-purple-600 font-medium">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {personalLibrary.length > 0 && (
              <button 
                onClick={() => setCurrentStep('library')}
                className="group card-elegant p-8 hover-lift text-left"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Library className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold">Your Library</h3>
                </div>
                <p className="font-serif text-gray-600 mb-4">Continue reading or browse your collection of {personalLibrary.length} personalized books.</p>
                <div className="flex items-center text-blue-600 font-medium">
                  <span>Browse Library</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            )}
          </div>

          {/* Stats Display if library exists */}
          {personalLibrary.length > 0 && (
            <div className="vintage-border p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl">
              <h3 className="font-display text-2xl font-semibold text-center mb-6">Your Reading Journey</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="font-display text-3xl font-bold text-purple-600">{libraryStats.totalBooks}</div>
                  <div className="font-sans text-sm text-gray-600">Books Created</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-3xl font-bold text-blue-600">{libraryStats.booksRead}</div>
                  <div className="font-sans text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-3xl font-bold text-green-600">{libraryStats.readingStreak}</div>
                  <div className="font-sans text-sm text-gray-600">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-3xl font-bold text-yellow-600">{Math.round(libraryStats.totalReadingTime)}</div>
                  <div className="font-sans text-sm text-gray-600">Minutes Read</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Enhanced Library View
  const renderLibrary = () => (
    <div className="min-h-screen paper-texture py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Library Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900">Your Library</h1>
              <p className="font-serif text-xl text-gray-600 mt-2">
                {personalLibrary.length} personalized books • {libraryStats.booksRead} completed
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentStep('profile')}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>New Book</span>
              </button>
              <button className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Quick Generation Presets */}
          <div className="card-elegant p-6">
            <h3 className="font-display text-xl font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 text-yellow-500 mr-2" />
              Quick Generate
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickGenPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => generatePersonalizedBook(preset)}
                  className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-blue-50 rounded-lg text-center transition-all hover-lift group"
                  disabled={isGenerating}
                >
                  <div className="font-medium text-sm text-gray-900 group-hover:text-purple-700">
                    {preset.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{preset.genre}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="card-elegant p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="recent">Recently Added</option>
                  <option value="title">Title A-Z</option>
                  <option value="progress">Reading Progress</option>
                  <option value="favorite">Favorites First</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLibraryView('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    libraryView === 'grid' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setLibraryView('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    libraryView === 'list' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Books Grid/List */}
          {filteredLibrary.length === 0 ? (
            <div className="card-elegant p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-display text-2xl font-semibold text-gray-600 mb-2">No books found</h3>
              <p className="font-serif text-gray-500 mb-6">
                {searchQuery || filterGenre !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'Create your first personalized book to get started!'}
              </p>
              <button 
                onClick={() => setCurrentStep('profile')}
                className="btn-primary"
              >
                Create Your First Book
              </button>
            </div>
          ) : (
            <div className={libraryView === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {filteredLibrary.map((book) => (
                <div key={book.id} className="card-elegant hover-lift group">
                  {libraryView === 'grid' ? (
                    // Grid view
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-display font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                            {book.title}
                          </h3>
                          <p className="font-serif text-gray-600 text-sm mt-1">by {book.author}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {book.genre}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              book.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                              book.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {book.difficulty}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleBookFavorite(book.id)}
                          className="p-1 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <Heart className={`w-5 h-5 ${book.favorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                        </button>
                      </div>
                      
                      <p className="font-serif text-gray-600 text-sm line-clamp-3">
                        {book.premise}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Progress</span>
                          <span>{book.readingProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${book.readingProgress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{book.readingTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setCurrentBook(book);
                              setIsReading(true);
                              setCurrentChapter(Math.floor(book.readingProgress / 100 * book.chapters.length));
                              generateFullBook(book);
                            }}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            {book.readingProgress === 0 ? 'Start Reading' : 'Continue'}
                          </button>
                          <button
                            onClick={() => deleteBook(book.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // List view
                    <div className="p-4 flex items-center space-x-6">
                      <div className="w-12 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-semibold text-lg text-gray-900 truncate">
                              {book.title}
                            </h3>
                            <p className="font-serif text-gray-600 text-sm">{book.author} • {book.genre}</p>
                            <p className="font-serif text-gray-500 text-sm mt-1 line-clamp-2">
                              {book.premise}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-4 ml-4">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900">{book.readingProgress}%</div>
                              <div className="text-xs text-gray-500">Progress</div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleBookFavorite(book.id)}
                                className="p-2 rounded-full hover:bg-red-50 transition-colors"
                              >
                                <Heart className={`w-5 h-5 ${book.favorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                              </button>
                              
                              <button
                                onClick={() => {
                                  setCurrentBook(book);
                                  setIsReading(true);
                                  setCurrentChapter(Math.floor(book.readingProgress / 100 * book.chapters.length));
                                  generateFullBook(book);
                                }}
                                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                {book.readingProgress === 0 ? 'Start' : 'Continue'}
                              </button>
                              
                              <button
                                onClick={() => deleteBook(book.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Keep existing profile form (with minor enhancements)
  const renderProfileForm = () => (
    <div className="min-h-screen paper-texture py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <Library className="w-12 h-12 text-purple-600" />
              <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900">
                Tell Us Your Story
              </h1>
            </div>
            <p className="font-serif text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              The more we understand about you, the more beautifully we can weave your personal narrative. 
              Each detail helps us craft a story that truly resonates with your soul.
            </p>
            
            {/* Back to library button if library exists */}
            {personalLibrary.length > 0 && (
              <button
                onClick={() => setCurrentStep('library')}
                className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>Back to Library</span>
              </button>
            )}
          </div>

          {/* Enhanced form sections */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Personal Information */}
            <div className="card-elegant p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <User className="w-8 h-8 text-blue-600" />
                  <span>About You</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">Help us understand who you are</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-sans font-medium text-gray-800 mb-3 text-lg">Your Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white"
                    placeholder="Enter your name..."
                  />
                </div>

                <div>
                  <label className="block font-sans font-medium text-gray-800 mb-3 text-lg">Age Range</label>
                  <select
                    value={userProfile.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white"
                  >
                    <option value="">Select your age range</option>
                    <option value="under-18">Under 18</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46-60">46-60</option>
                    <option value="over-60">Over 60</option>
                  </select>
                </div>

                <div>
                  <label className="block font-sans font-medium text-gray-800 mb-3 text-lg">Location</label>
                  <input
                    type="text"
                    value={userProfile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white"
                    placeholder="City, State/Country"
                  />
                </div>
              </div>
            </div>

            {/* Reading Preferences */}
            <div className="card-elegant p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                  <span>Reading Style</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">How do you like to experience stories?</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block font-sans font-medium text-gray-800 mb-3 text-lg">Preferred Genre</label>
                  <select
                    value={userProfile.preferredGenre}
                    onChange={(e) => handleInputChange('preferredGenre', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white"
                  >
                    <option value="">Choose your favorite genre</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-sans font-medium text-gray-800 mb-3 text-lg">Reading Complexity</label>
                  <select
                    value={userProfile.readingLevel}
                    onChange={(e) => handleInputChange('readingLevel', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white"
                  >
                    <option value="">Select your preference</option>
                    <option value="casual">Casual - Light, easy reads</option>
                    <option value="intermediate">Intermediate - Balanced complexity</option>
                    <option value="advanced">Advanced - Rich, literary style</option>
                  </select>
                </div>

                <div>
                  <label className="block font-sans font-medium text-gray-800 mb-3 text-lg">Current Mood</label>
                  <select
                    value={userProfile.currentMood}
                    onChange={(e) => handleInputChange('currentMood', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white"
                  >
                    <option value="">How are you feeling today?</option>
                    <option value="optimistic">Optimistic & Energetic</option>
                    <option value="contemplative">Contemplative & Reflective</option>
                    <option value="adventurous">Adventurous & Bold</option>
                    <option value="nostalgic">Nostalgic & Sentimental</option>
                    <option value="motivated">Motivated & Goal-Oriented</option>
                    <option value="peaceful">Peaceful & Relaxed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Interests Section */}
          <div className="card-elegant p-8 space-y-8">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                <Heart className="w-8 h-8 text-red-500" />
                <span>Your Passions</span>
              </h2>
              <p className="font-serif text-gray-600 mt-2">Select up to 8 things that spark your curiosity</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {interests.map(interest => (
                <button
                  key={interest}
                  onClick={() => handleArrayToggle('interests', interest)}
                  className={`group relative p-4 rounded-xl font-medium transition-all duration-300 border-2 ${
                    userProfile.interests.includes(interest)
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-600 shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                  disabled={!userProfile.interests.includes(interest) && userProfile.interests.length >= 8}
                >
                  <span className="text-sm font-sans">{interest}</span>
                  {userProfile.interests.includes(interest) && (
                    <CheckCircle className="w-4 h-4 absolute -top-2 -right-2 text-white bg-purple-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="text-center">
              <span className="font-sans text-sm text-gray-500">
                {userProfile.interests.length}/8 selected
              </span>
            </div>
          </div>

          {/* Rest of the form sections remain the same */}
          {/* Personality Traits */}
          <div className="card-elegant p-8 space-y-8">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                <Sparkles className="w-8 h-8 text-yellow-500" />
                <span>Your Essence</span>
              </h2>
              <p className="font-serif text-gray-600 mt-2">Choose 3-7 traits that best describe your personality</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {personalityTraits.map(trait => (
                <button
                  key={trait}
                  onClick={() => handleArrayToggle('personalityTraits', trait)}
                  className={`group relative p-4 rounded-xl font-medium transition-all duration-300 border-2 ${
                    userProfile.personalityTraits.includes(trait)
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  disabled={!userProfile.personalityTraits.includes(trait) && userProfile.personalityTraits.length >= 7}
                >
                  <span className="text-sm font-sans">{trait}</span>
                  {userProfile.personalityTraits.includes(trait) && (
                    <CheckCircle className="w-4 h-4 absolute -top-2 -right-2 text-white bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="text-center">
              <span className="font-sans text-sm text-gray-500">
                {userProfile.personalityTraits.length}/7 selected
              </span>
            </div>
          </div>

          {/* Life Focus Areas */}
          <div className="card-elegant p-8 space-y-8">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                <Globe className="w-8 h-8 text-green-600" />
                <span>Life's Journey</span>
              </h2>
              <p className="font-serif text-gray-600 mt-2">Optional: Areas you're focusing on or working through</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {personalChallenges.map(challenge => (
                <button
                  key={challenge}
                  onClick={() => handleArrayToggle('personalChallenges', challenge)}
                  className={`group relative p-4 rounded-xl font-medium transition-all duration-300 border-2 text-left ${
                    userProfile.personalChallenges.includes(challenge)
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-600 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <span className="text-sm font-sans">{challenge}</span>
                  {userProfile.personalChallenges.includes(challenge) && (
                    <CheckCircle className="w-4 h-4 absolute top-2 right-2 text-white bg-green-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center space-y-6">
            {generationError && (
              <div className="card-elegant p-6 bg-red-50 border-red-200 text-red-700 max-w-md mx-auto">
                <h3 className="font-display font-semibold text-lg mb-2">Generation Failed</h3>
                <p className="font-serif text-sm mb-4">{generationError}</p>
                <button 
                  onClick={() => setGenerationError('')}
                  className="font-sans text-sm underline hover:no-underline"
                >
                  Try Again
                </button>
              </div>
            )}
            
            <div className="vintage-border p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-3">
                  <Zap className="w-8 h-8 text-purple-600" />
                  <span className="font-display text-2xl font-semibold text-gray-800">Ready to Create Magic?</span>
                </div>
                
                <p className="font-serif text-gray-700">
                  We have everything we need to craft your personalized literary masterpiece. 
                  This process typically takes 30-60 seconds.
                </p>
                
                <button 
                  onClick={() => generatePersonalizedBook()}
                  disabled={!userProfile.name || !userProfile.preferredGenre || userProfile.interests.length === 0 || isGenerating}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white font-semibold text-xl px-12 py-5 rounded-2xl hover-lift transition-all duration-300 focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="relative z-10 flex items-center space-x-3">
                    <Feather className="w-6 h-6" />
                    <span>{isGenerating ? 'Generating...' : 'Generate My Personal Book'}</span>
                    <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Keep existing generation and generated book displays but update navigation
  const renderGenerating = () => (
    <div className="min-h-screen paper-texture flex items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl mx-auto px-6">
        <div className="relative">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="animate-spin">
                <Sparkles className="w-20 h-20 text-purple-600" />
              </div>
              <div className="absolute inset-0 animate-ping">
                <div className="w-20 h-20 bg-purple-400 rounded-full opacity-20"></div>
              </div>
            </div>
          </div>
          
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Crafting Your Story
          </h2>
          
          <p className="font-serif text-xl text-gray-700 mb-8 leading-relaxed">
            Our AI is weaving together the threads of your personality, interests, and dreams 
            into a narrative that speaks directly to your soul...
          </p>
        </div>
        
        {/* Enhanced Progress Bar */}
        <div className="space-y-6">
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{width: `${generationProgress}%`}}
            >
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className={`flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 ${
              generationProgress > 20 ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"
            }`}>
              {generationProgress > 20 ? 
                <CheckCircle className="w-6 h-6 text-green-600" /> : 
                <Circle className="w-6 h-6" />
              }
              <span className="font-sans font-medium">Analyzing your profile</span>
            </div>
            
            <div className={`flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 ${
              generationProgress > 50 ? "bg-green-50 text-green-700" : 
              generationProgress > 20 ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-500"
            }`}>
              {generationProgress > 50 ? 
                <CheckCircle className="w-6 h-6 text-green-600" /> : 
                generationProgress > 20 ? <Circle className="w-6 h-6 text-blue-600 animate-pulse" /> :
                <Circle className="w-6 h-6" />
              }
              <span className="font-sans font-medium">Incorporating preferences</span>
            </div>
            
            <div className={`flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 ${
              generationProgress > 80 ? "bg-green-50 text-green-700" : 
              generationProgress > 50 ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-500"
            }`}>
              {generationProgress > 80 ? 
                <CheckCircle className="w-6 h-6 text-green-600" /> : 
                generationProgress > 50 ? <Circle className="w-6 h-6 text-blue-600 animate-pulse" /> :
                <Circle className="w-6 h-6" />
              }
              <span className="font-sans font-medium">Generating narrative</span>
            </div>
            
            <div className={`flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 ${
              generationProgress === 100 ? "bg-green-50 text-green-700" : 
              generationProgress > 80 ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-500"
            }`}>
              {generationProgress === 100 ? 
                <CheckCircle className="w-6 h-6 text-green-600" /> : 
                generationProgress > 80 ? <Circle className="w-6 h-6 text-blue-600 animate-pulse" /> :
                <Circle className="w-6 h-6" />
              }
              <span className="font-sans font-medium">Finalizing chapters</span>
            </div>
          </div>
          
          {generationProgress === 100 && (
            <div className="animate-fade-in-up">
              <p className="font-serif text-lg text-green-600 font-medium">
                Almost ready! Preparing your personalized book...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Keep existing renderGeneratedBook and renderReadingInterface but add library navigation
  const renderGeneratedBook = () => {
    if (!currentBook) return null;
    
    return (
      <div className="min-h-screen paper-texture py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Header with navigation */}
            <div className="text-center space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentStep('library')}
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Back to Library</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleBookFavorite(currentBook.id)}
                    className="p-2 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Heart className={`w-6 h-6 ${currentBook.favorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-50 transition-colors">
                    <Share2 className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <Bookmark className="w-12 h-12 text-purple-600" />
                <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900">
                  Your Book is Ready!
                </h1>
              </div>
              <p className="font-serif text-xl text-gray-700 max-w-3xl mx-auto">
                A literary masterpiece crafted exclusively for you, reflecting your unique story and aspirations.
              </p>
            </div>

            {/* Book Preview */}
            <div className="vintage-border p-0 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 rounded-3xl overflow-hidden animate-slide-in-right">
              <div className="p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-8 right-8 transform rotate-12">
                    <Feather className="w-32 h-32" />
                  </div>
                  <div className="absolute bottom-8 left-8 transform -rotate-12">
                    <Quote className="w-24 h-24" />
                  </div>
                </div>
                
                <div className="relative z-10 flex items-start space-x-8">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-32 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <BookOpen className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
                      {currentBook.title}
                    </h1>
                    <p className="font-serif text-xl opacity-90">by {currentBook.author}</p>
                    <div className="flex items-center space-x-3">
                      <span className="px-4 py-2 bg-white/20 rounded-full">
                        <span className="font-sans text-sm font-medium">{currentBook.genre}</span>
                      </span>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        currentBook.difficulty === 'easy' ? 'bg-green-500/20' :
                        currentBook.difficulty === 'medium' ? 'bg-yellow-500/20' :
                        'bg-red-500/20'
                      }`}>
                        {currentBook.difficulty} read
                      </span>
                    </div>
                    <p className="font-serif text-lg leading-relaxed opacity-95 max-w-3xl">
                      {currentBook.premise}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-elegant p-8 space-y-6">
                <h3 className="font-display text-2xl font-semibold flex items-center space-x-3">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <span>Personalized For You</span>
                </h3>
                <div className="space-y-4">
                  {currentBook.personalizedElements.map((element, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-3 flex-shrink-0"></div>
                      <span className="font-serif text-gray-700 leading-relaxed">{element}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-elegant p-8 space-y-6">
                <h3 className="font-display text-2xl font-semibold flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-green-500" />
                  <span>Book Details</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-sans font-medium text-gray-600">Length:</span>
                    <span className="font-serif font-semibold text-gray-900">{currentBook.estimatedLength}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-sans font-medium text-gray-600">Reading Time:</span>
                    <span className="font-serif font-semibold text-gray-900">{currentBook.readingTime}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-sans font-medium text-gray-600">Chapters:</span>
                    <span className="font-serif font-semibold text-gray-900">{currentBook.chapters.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-sans font-medium text-gray-600">Difficulty:</span>
                    <span className={`font-serif font-semibold capitalize ${
                      currentBook.difficulty === 'easy' ? 'text-green-600' :
                      currentBook.difficulty === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {currentBook.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter Outline */}
            <div className="card-elegant p-8 space-y-6">
              <h3 className="font-display text-2xl font-semibold text-center">Chapter Journey</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentBook.chapters.map((chapter, index) => (
                  <div key={index} className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-purple-50 hover:to-blue-50 transition-all duration-300 hover-lift">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <h4 className="font-display font-semibold text-gray-900">{chapter}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Themes */}
            <div className="card-elegant p-8 space-y-6">
              <h3 className="font-display text-2xl font-semibold text-center">Core Themes</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {currentBook.themes.map((theme, index) => (
                  <span key={index} className="px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 rounded-full font-serif font-medium text-lg border border-purple-200">
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            {/* Read Now Section */}
            <div className="text-center space-y-8">
              <div className="vintage-border p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-center space-x-3">
                    <BookOpen className="w-8 h-8 text-purple-600" />
                    <span className="font-display text-2xl font-semibold text-gray-800">Ready to Begin Your Journey?</span>
                  </div>
                  
                  <p className="font-serif text-gray-700 max-w-2xl mx-auto">
                    Immerse yourself in a story written uniquely for you. Experience the magic of personalized literature.
                  </p>
                  
                  <div className="flex justify-center space-x-4">
                    <button 
                      onClick={() => {
                        setIsReading(true);
                        setCurrentChapter(Math.floor(currentBook.readingProgress / 100 * currentBook.chapters.length));
                        generateFullBook(currentBook);
                      }}
                      className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white font-semibold text-xl px-12 py-5 rounded-2xl hover-lift transition-all duration-300 focus-ring"
                    >
                      <span className="relative z-10 flex items-center space-x-3">
                        <BookOpen className="w-6 h-6" />
                        <span>{currentBook.readingProgress === 0 ? 'Start Reading Now' : 'Continue Reading'}</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    
                    <button 
                      onClick={() => setCurrentStep('library')}
                      className="px-8 py-5 bg-white border-2 border-purple-200 text-purple-700 font-semibold text-xl rounded-2xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                    >
                      Save for Later
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  setCurrentStep('profile');
                  setCurrentBook(null);
                }}
                className="group font-serif text-lg text-purple-600 hover:text-purple-700 transition-colors"
              >
                <span className="border-b border-purple-300 group-hover:border-purple-500">
                  Create Another Masterpiece
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Reading Interface
  const renderReadingInterface = () => {
    if (!currentBook) return null;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 paper-texture">
        {/* Reading Header */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setIsReading(false);
                  // Update reading progress when leaving
                  const progress = Math.round(((currentChapter + 1) / currentBook.chapters.length) * 100);
                  setPersonalLibrary(prev => prev.map(book => 
                    book.id === currentBook.id ? { ...book, readingProgress: progress, lastRead: new Date() } : book
                  ));
                }}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
                <span>Back to Book</span>
              </button>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="font-serif text-sm text-gray-600">
                    Chapter {currentChapter + 1} of {bookContent?.chapters?.length || currentBook.chapters.length}
                  </div>
                  <div className="font-display font-semibold text-gray-900">{currentBook.title}</div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="font-serif text-sm text-gray-600">
                    {Math.round(((currentChapter + 1) / currentBook.chapters.length) * 100)}% complete
                  </span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 rounded-full transition-all duration-300"
                      style={{ width: `${((currentChapter + 1) / currentBook.chapters.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleBookFavorite(currentBook.id)}
                    className="p-2 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${currentBook.favorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-50 transition-colors">
                    <BookMarked className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-50 transition-colors">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Content */}
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Chapter Content */}
            <div className="reading-content bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
              {bookContent?.loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin mb-4">
                    <Sparkles className="w-12 h-12 text-purple-600 mx-auto" />
                  </div>
                  <p className="font-serif text-lg text-gray-600">Generating your full story...</p>
                  <p className="font-serif text-sm text-gray-500 mt-2">This may take a moment for longer chapters</p>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-3xl font-bold text-gray-900 mb-8 chapter-title">
                    {bookContent?.chapters?.[currentChapter]?.title || currentBook.chapters[currentChapter]}
                  </h2>
                  
                  <div className="font-serif text-lg leading-relaxed text-gray-800 chapter-text">
                    {bookContent?.chapters?.[currentChapter]?.content ? 
                      bookContent.chapters[currentChapter].content.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="mb-6">{paragraph}</p>
                      )) : 
                      <div className="space-y-4">
                        <p className="text-gray-600 mb-4">Generating chapter content...</p>
                        <div className="space-y-2">
                          <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                          <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    }
                  </div>
                </>
              )}
            </div>

            {/* Chapter Navigation */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => {
                  const newChapter = Math.max(0, currentChapter - 1);
                  setCurrentChapter(newChapter);
                  // Update progress
                  const progress = Math.round(((newChapter + 1) / currentBook.chapters.length) * 100);
                  setPersonalLibrary(prev => prev.map(book => 
                    book.id === currentBook.id ? { ...book, readingProgress: progress } : book
                  ));
                }}
                disabled={currentChapter === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
                <span className="font-medium">Previous Chapter</span>
              </button>

              <div className="flex space-x-2">
                {currentBook.chapters.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentChapter(index);
                      // Update progress
                      const progress = Math.round(((index + 1) / currentBook.chapters.length) * 100);
                      setPersonalLibrary(prev => prev.map(book => 
                        book.id === currentBook.id ? { ...book, readingProgress: progress } : book
                      ));
                    }}
                    className={`w-10 h-10 rounded-full font-medium transition-all ${
                      index === currentChapter
                        ? 'bg-purple-600 text-white'
                        : index <= currentChapter
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-white text-gray-600 hover:bg-purple-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const newChapter = Math.min(currentBook.chapters.length - 1, currentChapter + 1);
                  setCurrentChapter(newChapter);
                  // Update progress and mark as read if finished
                  const progress = Math.round(((newChapter + 1) / currentBook.chapters.length) * 100);
                  setPersonalLibrary(prev => prev.map(book => 
                    book.id === currentBook.id ? { 
                      ...book, 
                      readingProgress: progress,
                      lastRead: new Date()
                    } : book
                  ));
                  
                  // If finished, show completion message
                  if (newChapter === currentBook.chapters.length - 1 && progress === 100) {
                    setTimeout(() => {
                      alert(`Congratulations! You've completed "${currentBook.title}"! 🎉`);
                    }, 1000);
                  }
                }}
                disabled={currentChapter >= currentBook.chapters.length - 1}
                className="flex items-center space-x-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-medium">Next Chapter</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Reading Options */}
            <div className="flex justify-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all">
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Reading Mode</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all">
                <Download className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Export</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all">
                <Share2 className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render logic
  useEffect(() => {
    if (currentStep === 'welcome') {
      const timer = setTimeout(() => setAnimationStep(1), 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Initialize library stats
  useEffect(() => {
    updateLibraryStats();
  }, [personalLibrary]);

  return (
    <div className="min-h-screen">
      {isReading ? renderReadingInterface() : (
        <>
          {currentStep === 'welcome' && renderWelcome()}
          {currentStep === 'library' && renderLibrary()}
          {currentStep === 'profile' && !isGenerating && renderProfileForm()}
          {isGenerating && renderGenerating()}
          {currentStep === 'generated' && currentBook && renderGeneratedBook()}
        </>
      )}
    </div>
  );
};

export default InfiniteLibrary;
