import React, { useState, useEffect } from 'react';
import { 
  Book, Sparkles, User, Heart, Globe, Clock, Download, Star, 
  BookOpen, Feather, Scroll, Library, Quote, ArrowRight,
  CheckCircle, Circle, Zap, Crown, Bookmark, Search, Filter,
  Grid, List, RefreshCw, Share2, Save, Eye, Trash2, Settings,
  PlusCircle, BookMarked, Calendar, TrendingUp, Award, LogOut
} from 'lucide-react';
import AuthModal from './AuthModal';

// Enhanced interfaces
interface AuthUser {
  id: string;
  name: string;
  email: string;
}

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
  // Free-form creative fields
  favoriteBooks: string;
  dreamScenario: string;
  personalStory: string;
  creativeTrigger: string;
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
  complexity?: string;
  narrativeStyle?: string;
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
  // Authentication state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Navigation state
  const [currentStep, setCurrentStep] = useState<string>('welcome');
  
  // User profile and library state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    age: '',
    interests: [],
    readingLevel: '',
    preferredGenre: '',
    personalityTraits: [],
    currentMood: '',
    location: '',
    personalChallenges: [],
    favoriteBooks: '',
    dreamScenario: '',
    personalStory: '',
    creativeTrigger: ''
  });
  
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
  
  // Generation and reading state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string>('');
  const [animationStep, setAnimationStep] = useState<number>(0);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [bookContent, setBookContent] = useState<BookContent | null>(null);

  // Creative quick generation presets
  const quickGenPresets = [
    { 
      name: 'Surprise Me!', 
      genre: 'Random', 
      mood: 'curious', 
      tags: ['unexpected', 'creative'],
      prompt: 'Create something completely unexpected based on my personality'
    },
    { 
      name: 'Dream Adventure', 
      genre: 'Fantasy', 
      mood: 'adventurous', 
      tags: ['dreams', 'adventure'],
      prompt: 'Turn my wildest dreams into an epic adventure'
    },
    { 
      name: 'Personal Growth', 
      genre: 'Self-Help', 
      mood: 'motivated', 
      tags: ['growth', 'inspiration'],
      prompt: 'Create a story that helps me overcome my current challenges'
    },
    { 
      name: 'Cozy Escape', 
      genre: 'Romance', 
      mood: 'peaceful', 
      tags: ['comfort', 'escape'],
      prompt: 'Give me a heartwarming story to escape into'
    },
    { 
      name: 'Mind Bender', 
      genre: 'Science Fiction', 
      mood: 'contemplative', 
      tags: ['thought-provoking', 'complex'],
      prompt: 'Challenge my thinking with a mind-bending sci-fi tale'
    },
    { 
      name: 'Mystery Box', 
      genre: 'Mystery/Thriller', 
      mood: 'curious', 
      tags: ['mystery', 'intrigue'],
      prompt: 'Create a mystery that I would love to solve'
    }
  ];

  const interests: string[] = [
    'Technology', 'Nature', 'Adventure', 'Mystery', 'Romance', 'Science',
    'History', 'Art', 'Music', 'Sports', 'Travel', 'Cooking', 'Animals',
    'Space', 'Magic', 'Friendship', 'Family', 'Career', 'Health', 'Philosophy',
    'Psychology', 'Economics', 'Politics', 'Environment', 'Innovation',
    'Gaming', 'Photography', 'Writing', 'Dancing', 'Meditation', 'Learning'
  ];

  const personalityTraits: string[] = [
    'Adventurous', 'Analytical', 'Creative', 'Empathetic', 'Humorous',
    'Introverted', 'Optimistic', 'Practical', 'Curious', 'Ambitious',
    'Compassionate', 'Independent', 'Thoughtful', 'Energetic', 'Patient',
    'Bold', 'Diplomatic', 'Innovative', 'Resilient', 'Wise', 'Playful',
    'Introspective', 'Spontaneous', 'Methodical', 'Artistic'
  ];

  const personalChallenges: string[] = [
    'Building confidence', 'Career transition', 'Relationship issues',
    'Stress management', 'Finding purpose', 'Overcoming fear',
    'Work-life balance', 'Health goals', 'Financial planning',
    'Personal growth', 'Communication skills', 'Time management',
    'Creative blocks', 'Decision making', 'Self-acceptance',
    'Leadership skills', 'Public speaking', 'Setting boundaries'
  ];

  const genres: string[] = [
    'Surprise Me (AI Choice)', 'Mystery/Thriller', 'Romance', 'Science Fiction', 'Fantasy',
    'Self-Help', 'Adventure', 'Historical Fiction', 'Contemporary Fiction',
    'Educational', 'Comedy', 'Horror', 'Drama', 'Poetry', 'Philosophy', 
    'Business', 'Health & Wellness', 'Memoir Style', 'Experimental Fiction'
  ];

  // Authentication and data management functions
  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (currentStep === 'welcome') {
      const timer = setTimeout(() => setAnimationStep(1), 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    if (user && !userProfile.name) {
      setUserProfile(prev => ({
        ...prev,
        name: user.name
      }));
    }
  }, [user]);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        loadUserData(data.user.id);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleAuthSuccess = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    setShowAuthModal(false);
    loadUserData(authenticatedUser.id);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setPersonalLibrary([]);
      setCurrentStep('welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      const savedLibrary = localStorage.getItem(`library_${userId}`);
      if (savedLibrary) {
        const library = JSON.parse(savedLibrary);
        setPersonalLibrary(library);
        updateLibraryStats(library);
      }
      
      const savedProfile = localStorage.getItem(`profile_${userId}`);
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setUserProfile(prev => ({ ...prev, ...profile }));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const saveUserLibrary = (library: GeneratedBook[]) => {
    if (user) {
      try {
        localStorage.setItem(`library_${user.id}`, JSON.stringify(library));
      } catch (error) {
        console.error('Failed to save library:', error);
      }
    }
  };

  const saveUserProfile = (profile: UserProfile) => {
    if (user) {
      try {
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(profile));
      } catch (error) {
        console.error('Failed to save profile:', error);
      }
    }
  };

  const requireAuth = (action: () => void) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    action();
  };

  // Enhanced book generation with creativity focus
  const generatePersonalizedBook = async (preset?: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationError('');
    
    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 8, 90));
      }, 400);

      // Save current profile
      saveUserProfile(userProfile);

      const profileToUse = preset ? {
        ...userProfile,
        preferredGenre: preset.genre === 'Random' ? 'Surprise Me (AI Choice)' : preset.genre,
        currentMood: preset.mood,
        creativeTrigger: preset.prompt || userProfile.creativeTrigger
      } : userProfile;

      const res = await fetch('/api/generateBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...profileToUse,
          variation: Math.random(),
          previousBooks: personalLibrary.map(book => ({ title: book.title, genre: book.genre })),
          creativeMode: true,
          preset: preset
        })
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!res.ok) {
        if (res.status === 401) {
          setUser(null);
          setShowAuthModal(true);
          throw new Error('Please log in to generate books');
        }
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Book generation failed');
      }

      const data = await res.json();
      
      const newBook: GeneratedBook = {
        ...data,
        id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        readingProgress: 0,
        favorite: false,
        tags: preset?.tags || ['personalized'],
        mood: preset?.mood || userProfile.currentMood,
        difficulty: determineDifficulty(userProfile.readingLevel, data.genre)
      };

      const updatedLibrary = [newBook, ...personalLibrary];
      setPersonalLibrary(updatedLibrary);
      setCurrentBook(newBook);
      updateLibraryStats(updatedLibrary);
      saveUserLibrary(updatedLibrary);
      setCurrentStep('generated');
      
    } catch (error: any) {
      console.error('Book generation error:', error);
      setGenerationError(error.message || 'Something went wrong during book generation. Please try again.');
      if (currentStep !== 'library') setCurrentStep('profile');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const generateFullBook = async (book: GeneratedBook) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setBookContent({ chapters: [], loading: true });
      
      const res = await fetch('/api/generateFullBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          bookSummary: book,
          userProfile: userProfile 
        })
      });

      if (!res.ok) {
        if (res.status === 401) {
          setUser(null);
          setShowAuthModal(true);
          throw new Error('Please log in to read full books');
        }
        throw new Error('Failed to generate full book content');
      }

      const fullContent = await res.json();
      setBookContent(fullContent);
      
    } catch (error: any) {
      console.error('Full book generation error:', error);
      if (error.message.includes('log in')) {
        setBookContent(null);
        return;
      }
      setBookContent(createFallbackContent(book));
    }
  };

  // Utility functions
  const determineDifficulty = (readingLevel: string, genre: string): 'easy' | 'medium' | 'hard' => {
    if (readingLevel === 'casual') return 'easy';
    if (readingLevel === 'advanced') return 'hard';
    return genre === 'Science Fiction' || genre === 'Philosophy' ? 'hard' : 'medium';
  };

  const updateLibraryStats = (library: GeneratedBook[] = personalLibrary) => {
    setLibraryStats({
      totalBooks: library.length,
      booksRead: library.filter(book => book.readingProgress === 100).length,
      readingStreak: Math.floor(library.length / 3),
      favoriteGenre: getMostPopularGenre(library),
      totalReadingTime: calculateTotalReadingTime(library)
    });
  };

  const getMostPopularGenre = (library: GeneratedBook[]): string => {
    if (library.length === 0) return userProfile.preferredGenre;
    const genreCounts = library.reduce((acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(genreCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '';
  };

  const calculateTotalReadingTime = (library: GeneratedBook[]): number => {
    return library.reduce((total, book) => {
      const readingTimeNum = parseInt(book.readingTime.split('-')[0]) || 30;
      return total + (readingTimeNum * book.readingProgress / 100);
    }, 0);
  };

  const toggleBookFavorite = (bookId: string) => {
    const updatedLibrary = personalLibrary.map(book => 
      book.id === bookId ? { ...book, favorite: !book.favorite } : book
    );
    setPersonalLibrary(updatedLibrary);
    saveUserLibrary(updatedLibrary);
  };

  const deleteBook = (bookId: string) => {
    const updatedLibrary = personalLibrary.filter(book => book.id !== bookId);
    setPersonalLibrary(updatedLibrary);
    updateLibraryStats(updatedLibrary);
    saveUserLibrary(updatedLibrary);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    const updatedProfile = {
      ...userProfile,
      [field]: value
    };
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
  };

  const handleArrayToggle = (field: keyof UserProfile, item: string) => {
    const currentArray = userProfile[field] as string[];
    const updatedProfile = {
      ...userProfile,
      [field]: currentArray.includes(item) 
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item]
    };
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
  };

  const createFallbackContent = (book: GeneratedBook): BookContent => {
    return {
      chapters: book.chapters.map((title, index) => ({
        title,
        content: `This is the beginning of ${title}. In this chapter, our story unfolds as ${userProfile.name} embarks on a journey that reflects their unique perspective and experiences.

The narrative weaves together elements that speak to their interests and personality, creating a story that feels both personal and engaging.

As the chapter progresses, themes and ideas become apparent, setting the stage for the adventures to come.

This personalized tale continues to unfold, drawing from the rich tapestry of ${userProfile.name}'s unique perspective and experiences...

[This is a preview of your personalized book. The full AI-generated content would continue here with rich, detailed storytelling tailored specifically to your profile and preferences.]`
      }))
    };
  };

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <BookOpen className="w-12 h-12 text-purple-600 mx-auto" />
          </div>
          <p className="font-serif text-lg text-gray-600">Loading your library...</p>
        </div>
      </div>
    );
  }

  // Enhanced Welcome Screen
  const renderWelcome = () => (
    <div className="min-h-screen paper-texture relative overflow-hidden">
      {/* Navigation Bar */}
      <div className="relative z-20 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <span className="font-display text-2xl font-bold text-gray-900">Infinite Library</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-700">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>

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
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <button 
              onClick={() => requireAuth(() => setCurrentStep('profile'))}
              className="group card-elegant p-8 hover-lift text-left"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <PlusCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display text-2xl font-semibold">
                  {user ? 'Create Your Next Book' : 'Start Your Journey'}
                </h3>
              </div>
              <p className="font-serif text-gray-600 mb-4">
                {user 
                  ? 'Generate another perfectly personalized story tailored just for you.'
                  : 'Sign up to create your first AI-generated personalized book.'
                }
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                <span>{user ? 'Create Book' : 'Get Started'}</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {user && personalLibrary.length > 0 ? (
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
                <p className="font-serif text-gray-600 mb-4">
                  Continue reading or browse your collection of {personalLibrary.length} personalized books.
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  <span>Browse Library</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ) : (
              <div className="card-elegant p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                    <Library className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-gray-600">Your Library</h3>
                </div>
                <p className="font-serif text-gray-500 mb-4">
                  {user 
                    ? 'Your personalized books will appear here once you create them.'
                    : 'Sign in to start building your personal collection of AI-generated books.'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Stats Display */}
          {user && personalLibrary.length > 0 && (
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

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );

  // Creative Profile Form with Free-Response Fields
  const renderProfileForm = () => (
    <div className="min-h-screen paper-texture py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900">
              Tell Us Your Story
            </h1>
            <p className="font-serif text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              The more we understand about you, the more beautifully we can craft your personal narrative. 
              Be creative and honest - this is what makes your book truly unique.
            </p>
            
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

          {/* Basic Info */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="card-elegant p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <User className="w-8 h-8 text-blue-600" />
                  <span>About You</span>
                </h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-sans font-medium text-gray-800 mb-3 text-lg">Your Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white"
                    placeholder="What should we call you?"
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
                    placeholder="Where do you call home?"
                  />
                </div>
              </div>
            </div>

            <div className="card-elegant p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                  <span>Reading Style</span>
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block font-sans font-medium text-gray-800 mb-3 text-lg">What Genre Calls to You?</label>
                  <select
                    value={userProfile.preferredGenre}
                    onChange={(e) => handleInputChange('preferredGenre', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white"
                  >
                    <option value="">Choose your adventure</option>
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
                    <option value="">What feels right for you?</option>
                    <option value="casual">Casual - Easy, flowing reads</option>
                    <option value="intermediate">Intermediate - Rich but accessible</option>
                    <option value="advanced">Advanced - Complex, literary depth</option>
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
                    <option value="curious">Curious & Exploring</option>
                    <option value="peaceful">Peaceful & Relaxed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Creative Free-Response Sections */}
          <div className="space-y-12">
            {/* Favorite Books */}
            <div className="card-elegant p-8 space-y-6">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <Bookmark className="w-8 h-8 text-green-600" />
                  <span>Literary Inspiration</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">What books, authors, or stories have moved you?</p>
              </div>
              
              <textarea
                value={userProfile.favoriteBooks}
                onChange={(e) => handleInputChange('favoriteBooks', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white h-32"
                placeholder="Tell us about books you've loved, authors who inspire you, or stories that have stayed with you. Be as specific or general as you like..."
              />
            </div>

            {/* Dream Scenario */}
            <div className="card-elegant p-8 space-y-6">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <span>Dream Scenario</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">If you could live in any story, what would it be like?</p>
              </div>
              
              <textarea
                value={userProfile.dreamScenario}
                onChange={(e) => handleInputChange('dreamScenario', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white h-32"
                placeholder="Describe a world, situation, or adventure you'd love to experience. Fantasy realm? Space station? Cozy cottage? Time period? Let your imagination run wild..."
              />
            </div>

            {/* Personal Story */}
            <div className="card-elegant p-8 space-y-6">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <Quote className="w-8 h-8 text-purple-600" />
                  <span>Your Story</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">What's something meaningful from your own life journey?</p>
              </div>
              
              <textarea
                value={userProfile.personalStory}
                onChange={(e) => handleInputChange('personalStory', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white h-32"
                placeholder="Share an experience, lesson, relationship, or moment that has shaped you. This helps us create characters and situations that resonate deeply with your life..."
              />
            </div>

            {/* Creative Trigger */}
            <div className="card-elegant p-8 space-y-6">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <Sparkles className="w-8 h-8 text-pink-500" />
                  <span>Creative Inspiration</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">What should inspire your unique story?</p>
              </div>
              
              <textarea
                value={userProfile.creativeTrigger}
                onChange={(e) => handleInputChange('creativeTrigger', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white h-32"
                placeholder="Give us a creative direction: 'Write about second chances,' 'Include a mysterious library,' 'Focus on finding courage,' 'Make it feel like a warm hug,' or anything that sparks your imagination..."
              />
            </div>
          </div>

          {/* Quick Selection Sections */}
          <div className="space-y-12">
            {/* Interests */}
            <div className="card-elegant p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <Heart className="w-8 h-8 text-red-500" />
                  <span>Your Passions</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">What lights you up? (Select as many as you like)</p>
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
                  >
                    <span className="text-sm font-sans">{interest}</span>
                    {userProfile.interests.includes(interest) && (
                      <CheckCircle className="w-4 h-4 absolute -top-2 -right-2 text-white bg-purple-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Personality Traits */}
            <div className="card-elegant p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                  <span>Your Essence</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">How would people who know you best describe you?</p>
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
                  >
                    <span className="text-sm font-sans">{trait}</span>
                    {userProfile.personalityTraits.includes(trait) && (
                      <CheckCircle className="w-4 h-4 absolute -top-2 -right-2 text-white bg-blue-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Life Focus Areas */}
            <div className="card-elegant p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <Globe className="w-8 h-8 text-green-600" />
                  <span>Life's Journey</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">What are you working on or focusing on in your life? (Optional)</p>
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
                  Your personalized story awaits! The more you've shared, the more magical it will be.
                </p>
                
                <button 
                  onClick={() => generatePersonalizedBook()}
                  disabled={!userProfile.name || isGenerating}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white font-semibold text-xl px-12 py-5 rounded-2xl hover-lift transition-all duration-300 focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="relative z-10 flex items-center space-x-3">
                    <Feather className="w-6 h-6" />
                    <span>{isGenerating ? 'Creating Your Story...' : 'Generate My Personal Book'}</span>
                    <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  </span>
                </button>
                
                {userProfile.name && (
                  <p className="text-sm text-gray-600">
                    Don't worry - you can always come back and update your preferences later!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Library with Quick Generate
  const renderLibrary = () => (
    <div className="min-h-screen paper-texture py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Library Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900">Your Personal Library</h1>
              <p className="font-serif text-xl text-gray-600 mt-2">
                {personalLibrary.length} personalized books • {libraryStats.booksRead} completed
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentStep('profile')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center space-x-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create New Book</span>
              </button>
            </div>
          </div>

          {/* Quick Generate Presets */}
          <div className="card-elegant p-6">
            <h3 className="font-display text-xl font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 text-yellow-500 mr-2" />
              Quick Generate - Surprise Yourself!
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickGenPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => generatePersonalizedBook(preset)}
                  className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-blue-50 rounded-lg text-center transition-all hover-lift group border-2 border-transparent hover:border-purple-200"
                  disabled={isGenerating}
                >
                  <div className="font-medium text-sm text-gray-900 group-hover:text-purple-700 mb-1">
                    {preset.name}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{preset.genre}</div>
                  <div className="text-xs text-gray-400 italic">{preset.prompt.slice(0, 40)}...</div>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center italic">
              Each preset uses your profile to create something unique and unexpected!
            </p>
          </div>

          {/* Books Display */}
          {personalLibrary.length === 0 ? (
            <div className="card-elegant p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-display text-2xl font-semibold text-gray-600 mb-2">Your Library Awaits</h3>
              <p className="font-serif text-gray-500 mb-6">
                Create your first personalized book to begin your infinite reading journey!
              </p>
              <div className="space-y-4">
                <button 
                  onClick={() => setCurrentStep('profile')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold"
                >
                  Create Your First Book
                </button>
                <p className="text-sm text-gray-500">
                  Or try one of the quick generate options above for instant inspiration!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {personalLibrary.map((book) => (
                <div key={book.id} className="card-elegant hover-lift group p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 mb-2">
                        {book.title}
                      </h3>
                      <p className="font-serif text-gray-600 text-sm">by {book.author}</p>
                      <div className="flex items-center space-x-2 mt-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
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
                          setCurrentStep('generated');
                        }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => {
                          setCurrentBook(book);
                          setIsReading(true);
                          setCurrentChapter(Math.floor(book.readingProgress / 100 * book.chapters.length));
                          generateFullBook(book);
                        }}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {book.readingProgress === 0 ? 'Start' : 'Continue'}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Rest of render functions
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
        
        <div className="space-y-6">
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{width: `${generationProgress}%`}}
            >
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
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

  const renderGeneratedBook = () => {
    if (!currentBook) return null;
    
    return (
      <div className="min-h-screen paper-texture py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-12">
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
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <Bookmark className="w-12 h-12 text-purple-600" />
                <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900">
                  Your Book is Ready!
                </h1>
              </div>
            </div>

            {/* Book Preview */}
            <div className="vintage-border p-0 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 rounded-3xl overflow-hidden">
              <div className="p-12 text-white relative overflow-hidden">
                <div className="relative z-10 flex items-start space-x-8">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-32 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <BookOpen className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <h1 className="font-display text-4xl mimport React, { useState, useEffect } from 'react';
import { 
  Book, Sparkles, User, Heart, Globe, Clock, Download, Star, 
  BookOpen, Feather, Scroll, Library, Quote, ArrowRight,
  CheckCircle, Circle, Zap, Crown, Bookmark, Search, Filter,
  Grid, List, RefreshCw, Share2, Save, Eye, Trash2, Settings,
  PlusCircle, BookMarked, Calendar, TrendingUp, Award, LogOut
} from 'lucide-react';
import AuthModal from './AuthModal';

// Enhanced interfaces
interface AuthUser {
  id: string;
  name: string;
  email: string;
}

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
  // Free-form creative fields
  favoriteBooks: string;
  dreamScenario: string;
  personalStory: string;
  creativeTrigger: string;
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
  complexity?: string;
  narrativeStyle?: string;
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
  // Authentication state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Navigation state
  const [currentStep, setCurrentStep] = useState<string>('welcome');
  
  // User profile and library state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    age: '',
    interests: [],
    readingLevel: '',
    preferredGenre: '',
    personalityTraits: [],
    currentMood: '',
    location: '',
    personalChallenges: [],
    favoriteBooks: '',
    dreamScenario: '',
    personalStory: '',
    creativeTrigger: ''
  });
  
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
  
  // Generation and reading state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string>('');
  const [animationStep, setAnimationStep] = useState<number>(0);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [bookContent, setBookContent] = useState<BookContent | null>(null);

  // Creative quick generation presets
  const quickGenPresets = [
    { 
      name: 'Surprise Me!', 
      genre: 'Random', 
      mood: 'curious', 
      tags: ['unexpected', 'creative'],
      prompt: 'Create something completely unexpected based on my personality'
    },
    { 
      name: 'Dream Adventure', 
      genre: 'Fantasy', 
      mood: 'adventurous', 
      tags: ['dreams', 'adventure'],
      prompt: 'Turn my wildest dreams into an epic adventure'
    },
    { 
      name: 'Personal Growth', 
      genre: 'Self-Help', 
      mood: 'motivated', 
      tags: ['growth', 'inspiration'],
      prompt: 'Create a story that helps me overcome my current challenges'
    },
    { 
      name: 'Cozy Escape', 
      genre: 'Romance', 
      mood: 'peaceful', 
      tags: ['comfort', 'escape'],
      prompt: 'Give me a heartwarming story to escape into'
    },
    { 
      name: 'Mind Bender', 
      genre: 'Science Fiction', 
      mood: 'contemplative', 
      tags: ['thought-provoking', 'complex'],
      prompt: 'Challenge my thinking with a mind-bending sci-fi tale'
    },
    { 
      name: 'Mystery Box', 
      genre: 'Mystery/Thriller', 
      mood: 'curious', 
      tags: ['mystery', 'intrigue'],
      prompt: 'Create a mystery that I would love to solve'
    }
  ];

  const interests: string[] = [
    'Technology', 'Nature', 'Adventure', 'Mystery', 'Romance', 'Science',
    'History', 'Art', 'Music', 'Sports', 'Travel', 'Cooking', 'Animals',
    'Space', 'Magic', 'Friendship', 'Family', 'Career', 'Health', 'Philosophy',
    'Psychology', 'Economics', 'Politics', 'Environment', 'Innovation',
    'Gaming', 'Photography', 'Writing', 'Dancing', 'Meditation', 'Learning'
  ];

  const personalityTraits: string[] = [
    'Adventurous', 'Analytical', 'Creative', 'Empathetic', 'Humorous',
    'Introverted', 'Optimistic', 'Practical', 'Curious', 'Ambitious',
    'Compassionate', 'Independent', 'Thoughtful', 'Energetic', 'Patient',
    'Bold', 'Diplomatic', 'Innovative', 'Resilient', 'Wise', 'Playful',
    'Introspective', 'Spontaneous', 'Methodical', 'Artistic'
  ];

  const personalChallenges: string[] = [
    'Building confidence', 'Career transition', 'Relationship issues',
    'Stress management', 'Finding purpose', 'Overcoming fear',
    'Work-life balance', 'Health goals', 'Financial planning',
    'Personal growth', 'Communication skills', 'Time management',
    'Creative blocks', 'Decision making', 'Self-acceptance',
    'Leadership skills', 'Public speaking', 'Setting boundaries'
  ];

  const genres: string[] = [
    'Surprise Me (AI Choice)', 'Mystery/Thriller', 'Romance', 'Science Fiction', 'Fantasy',
    'Self-Help', 'Adventure', 'Historical Fiction', 'Contemporary Fiction',
    'Educational', 'Comedy', 'Horror', 'Drama', 'Poetry', 'Philosophy', 
    'Business', 'Health & Wellness', 'Memoir Style', 'Experimental Fiction'
  ];

  // Authentication and data management functions
  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (currentStep === 'welcome') {
      const timer = setTimeout(() => setAnimationStep(1), 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    if (user && !userProfile.name) {
      setUserProfile(prev => ({
        ...prev,
        name: user.name
      }));
    }
  }, [user]);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        loadUserData(data.user.id);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleAuthSuccess = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    setShowAuthModal(false);
    loadUserData(authenticatedUser.id);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setPersonalLibrary([]);
      setCurrentStep('welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      const savedLibrary = localStorage.getItem(`library_${userId}`);
      if (savedLibrary) {
        const library = JSON.parse(savedLibrary);
        setPersonalLibrary(library);
        updateLibraryStats(library);
      }
      
      const savedProfile = localStorage.getItem(`profile_${userId}`);
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setUserProfile(prev => ({ ...prev, ...profile }));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const saveUserLibrary = (library: GeneratedBook[]) => {
    if (user) {
      try {
        localStorage.setItem(`library_${user.id}`, JSON.stringify(library));
      } catch (error) {
        console.error('Failed to save library:', error);
      }
    }
  };

  const saveUserProfile = (profile: UserProfile) => {
    if (user) {
      try {
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(profile));
      } catch (error) {
        console.error('Failed to save profile:', error);
      }
    }
  };

  const requireAuth = (action: () => void) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    action();
  };

  // Enhanced book generation with creativity focus
  const generatePersonalizedBook = async (preset?: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationError('');
    
    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 8, 90));
      }, 400);

      // Save current profile
      saveUserProfile(userProfile);

      const profileToUse = preset ? {
        ...userProfile,
        preferredGenre: preset.genre === 'Random' ? 'Surprise Me (AI Choice)' : preset.genre,
        currentMood: preset.mood,
        creativeTrigger: preset.prompt || userProfile.creativeTrigger
      } : userProfile;

      const res = await fetch('/api/generateBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...profileToUse,
          variation: Math.random(),
          previousBooks: personalLibrary.map(book => ({ title: book.title, genre: book.genre })),
          creativeMode: true,
          preset: preset
        })
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!res.ok) {
        if (res.status === 401) {
          setUser(null);
          setShowAuthModal(true);
          throw new Error('Please log in to generate books');
        }
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Book generation failed');
      }

      const data = await res.json();
      
      const newBook: GeneratedBook = {
        ...data,
        id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        readingProgress: 0,
        favorite: false,
        tags: preset?.tags || ['personalized'],
        mood: preset?.mood || userProfile.currentMood,
        difficulty: determineDifficulty(userProfile.readingLevel, data.genre)
      };

      const updatedLibrary = [newBook, ...personalLibrary];
      setPersonalLibrary(updatedLibrary);
      setCurrentBook(newBook);
      updateLibraryStats(updatedLibrary);
      saveUserLibrary(updatedLibrary);
      setCurrentStep('generated');
      
    } catch (error: any) {
      console.error('Book generation error:', error);
      setGenerationError(error.message || 'Something went wrong during book generation. Please try again.');
      if (currentStep !== 'library') setCurrentStep('profile');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const generateFullBook = async (book: GeneratedBook) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setBookContent({ chapters: [], loading: true });
      
      const res = await fetch('/api/generateFullBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          bookSummary: book,
          userProfile: userProfile 
        })
      });

      if (!res.ok) {
        if (res.status === 401) {
          setUser(null);
          setShowAuthModal(true);
          throw new Error('Please log in to read full books');
        }
        throw new Error('Failed to generate full book content');
      }

      const fullContent = await res.json();
      setBookContent(fullContent);
      
    } catch (error: any) {
      console.error('Full book generation error:', error);
      if (error.message.includes('log in')) {
        setBookContent(null);
        return;
      }
      setBookContent(createFallbackContent(book));
    }
  };

  // Utility functions
  const determineDifficulty = (readingLevel: string, genre: string): 'easy' | 'medium' | 'hard' => {
    if (readingLevel === 'casual') return 'easy';
    if (readingLevel === 'advanced') return 'hard';
    return genre === 'Science Fiction' || genre === 'Philosophy' ? 'hard' : 'medium';
  };

  const updateLibraryStats = (library: GeneratedBook[] = personalLibrary) => {
    setLibraryStats({
      totalBooks: library.length,
      booksRead: library.filter(book => book.readingProgress === 100).length,
      readingStreak: Math.floor(library.length / 3),
      favoriteGenre: getMostPopularGenre(library),
      totalReadingTime: calculateTotalReadingTime(library)
    });
  };

  const getMostPopularGenre = (library: GeneratedBook[]): string => {
    if (library.length === 0) return userProfile.preferredGenre;
    const genreCounts = library.reduce((acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(genreCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '';
  };

  const calculateTotalReadingTime = (library: GeneratedBook[]): number => {
    return library.reduce((total, book) => {
      const readingTimeNum = parseInt(book.readingTime.split('-')[0]) || 30;
      return total + (readingTimeNum * book.readingProgress / 100);
    }, 0);
  };

  const toggleBookFavorite = (bookId: string) => {
    const updatedLibrary = personalLibrary.map(book => 
      book.id === bookId ? { ...book, favorite: !book.favorite } : book
    );
    setPersonalLibrary(updatedLibrary);
    saveUserLibrary(updatedLibrary);
  };

  const deleteBook = (bookId: string) => {
    const updatedLibrary = personalLibrary.filter(book => book.id !== bookId);
    setPersonalLibrary(updatedLibrary);
    updateLibraryStats(updatedLibrary);
    saveUserLibrary(updatedLibrary);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    const updatedProfile = {
      ...userProfile,
      [field]: value
    };
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
  };

  const handleArrayToggle = (field: keyof UserProfile, item: string) => {
    const currentArray = userProfile[field] as string[];
    const updatedProfile = {
      ...userProfile,
      [field]: currentArray.includes(item) 
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item]
    };
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
  };

  const createFallbackContent = (book: GeneratedBook): BookContent => {
    return {
      chapters: book.chapters.map((title, index) => ({
        title,
        content: `This is the beginning of ${title}. In this chapter, our story unfolds as ${userProfile.name} embarks on a journey that reflects their unique perspective and experiences.

The narrative weaves together elements that speak to their interests and personality, creating a story that feels both personal and engaging.

As the chapter progresses, themes and ideas become apparent, setting the stage for the adventures to come.

This personalized tale continues to unfold, drawing from the rich tapestry of ${userProfile.name}'s unique perspective and experiences...

[This is a preview of your personalized book. The full AI-generated content would continue here with rich, detailed storytelling tailored specifically to your profile and preferences.]`
      }))
    };
  };

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <BookOpen className="w-12 h-12 text-purple-600 mx-auto" />
          </div>
          <p className="font-serif text-lg text-gray-600">Loading your library...</p>
        </div>
      </div>
    );
  }

  // Enhanced Welcome Screen
  const renderWelcome = () => (
    <div className="min-h-screen paper-texture relative overflow-hidden">
      {/* Navigation Bar */}
      <div className="relative z-20 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <span className="font-display text-2xl font-bold text-gray-900">Infinite Library</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-700">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>

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
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <button 
              onClick={() => requireAuth(() => setCurrentStep('profile'))}
              className="group card-elegant p-8 hover-lift text-left"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <PlusCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display text-2xl font-semibold">
                  {user ? 'Create Your Next Book' : 'Start Your Journey'}
                </h3>
              </div>
              <p className="font-serif text-gray-600 mb-4">
                {user 
                  ? 'Generate another perfectly personalized story tailored just for you.'
                  : 'Sign up to create your first AI-generated personalized book.'
                }
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                <span>{user ? 'Create Book' : 'Get Started'}</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {user && personalLibrary.length > 0 ? (
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
                <p className="font-serif text-gray-600 mb-4">
                  Continue reading or browse your collection of {personalLibrary.length} personalized books.
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  <span>Browse Library</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ) : (
              <div className="card-elegant p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                    <Library className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-gray-600">Your Library</h3>
                </div>
                <p className="font-serif text-gray-500 mb-4">
                  {user 
                    ? 'Your personalized books will appear here once you create them.'
                    : 'Sign in to start building your personal collection of AI-generated books.'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Stats Display */}
          {user && personalLibrary.length > 0 && (
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

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );

  // Creative Profile Form with Free-Response Fields
  const renderProfileForm = () => (
    <div className="min-h-screen paper-texture py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900">
              Tell Us Your Story
            </h1>
            <p className="font-serif text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              The more we understand about you, the more beautifully we can craft your personal narrative. 
              Be creative and honest - this is what makes your book truly unique.
            </p>
            
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

          {/* Basic Info */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="card-elegant p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <User className="w-8 h-8 text-blue-600" />
                  <span>About You</span>
                </h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-sans font-medium text-gray-800 mb-3 text-lg">Your Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white"
                    placeholder="What should we call you?"
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
                    placeholder="Where do you call home?"
                  />
                </div>
              </div>
            </div>

            <div className="card-elegant p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                  <span>Reading Style</span>
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block font-sans font-medium text-gray-800 mb-3 text-lg">What Genre Calls to You?</label>
                  <select
                    value={userProfile.preferredGenre}
                    onChange={(e) => handleInputChange('preferredGenre', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white"
                  >
                    <option value="">Choose your adventure</option>
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
                    <option value="">What feels right for you?</option>
                    <option value="casual">Casual - Easy, flowing reads</option>
                    <option value="intermediate">Intermediate - Rich but accessible</option>
                    <option value="advanced">Advanced - Complex, literary depth</option>
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
                    <option value="curious">Curious & Exploring</option>
                    <option value="peaceful">Peaceful & Relaxed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Creative Free-Response Sections */}
          <div className="space-y-12">
            {/* Favorite Books */}
            <div className="card-elegant p-8 space-y-6">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <Bookmark className="w-8 h-8 text-green-600" />
                  <span>Literary Inspiration</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">What books, authors, or stories have moved you?</p>
              </div>
              
              <textarea
                value={userProfile.favoriteBooks}
                onChange={(e) => handleInputChange('favoriteBooks', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white h-32"
                placeholder="Tell us about books you've loved, authors who inspire you, or stories that have stayed with you. Be as specific or general as you like..."
              />
            </div>

            {/* Dream Scenario */}
            <div className="card-elegant p-8 space-y-6">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <span>Dream Scenario</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">If you could live in any story, what would it be like?</p>
              </div>
              
              <textarea
                value={userProfile.dreamScenario}
                onChange={(e) => handleInputChange('dreamScenario', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white h-32"
                placeholder="Describe a world, situation, or adventure you'd love to experience. Fantasy realm? Space station? Cozy cottage? Time period? Let your imagination run wild..."
              />
            </div>

            {/* Personal Story */}
            <div className="card-elegant p-8 space-y-6">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <Quote className="w-8 h-8 text-purple-600" />
                  <span>Your Story</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">What's something meaningful from your own life journey?</p>
              </div>
              
              <textarea
                value={userProfile.personalStory}
                onChange={(e) => handleInputChange('personalStory', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white h-32"
                placeholder="Share an experience, lesson, relationship, or moment that has shaped you. This helps us create characters and situations that resonate deeply with your life..."
              />
            </div>

            {/* Creative Trigger */}
            <div className="card-elegant p-8 space-y-6">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <Sparkles className="w-8 h-8 text-pink-500" />
                  <span>Creative Inspiration</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">What should inspire your unique story?</p>
              </div>
              
              <textarea
                value={userProfile.creativeTrigger}
                onChange={(e) => handleInputChange('creativeTrigger', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white h-32"
                placeholder="Give us a creative direction: 'Write about second chances,' 'Include a mysterious library,' 'Focus on finding courage,' 'Make it feel like a warm hug,' or anything that sparks your imagination..."
              />
            </div>
          </div>

          {/* Quick Selection Sections */}
          <div className="space-y-12">
            {/* Interests */}
            <div className="card-elegant p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <Heart className="w-8 h-8 text-red-500" />
                  <span>Your Passions</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">What lights you up? (Select as many as you like)</p>
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
                  >
                    <span className="text-sm font-sans">{interest}</span>
                    {userProfile.interests.includes(interest) && (
                      <CheckCircle className="w-4 h-4 absolute -top-2 -right-2 text-white bg-purple-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Personality Traits */}
            <div className="card-elegant p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                  <span>Your Essence</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">How would people who know you best describe you?</p>
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
                  >
                    <span className="text-sm font-sans">{trait}</span>
                    {userProfile.personalityTraits.includes(trait) && (
                      <CheckCircle className="w-4 h-4 absolute -top-2 -right-2 text-white bg-blue-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Life Focus Areas */}
            <div className="card-elegant p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <Globe className="w-8 h-8 text-green-600" />
                  <span>Life's Journey</span>
                </h2>
                <p className="font-serif text-gray-600 mt-2">What are you working on or focusing on in your life? (Optional)</p>
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
                  Your personalized story awaits! The more you've shared, the more magical it will be.
                </p>
                
                <button 
                  onClick={() => generatePersonalizedBook()}
                  disabled={!userProfile.name || isGenerating}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white font-semibold text-xl px-12 py-5 rounded-2xl hover-lift transition-all duration-300 focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="relative z-10 flex items-center space-x-3">
                    <Feather className="w-6 h-6" />
                    <span>{isGenerating ? 'Creating Your Story...' : 'Generate My Personal Book'}</span>
                    <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  </span>
                </button>
                
                {userProfile.name && (
                  <p className="text-sm text-gray-600">
                    Don't worry - you can always come back and update your preferences later!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Library with Quick Generate
  const renderLibrary = () => (
    <div className="min-h-screen paper-texture py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Library Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900">Your Personal Library</h1>
              <p className="font-serif text-xl text-gray-600 mt-2">
                {personalLibrary.length} personalized books • {libraryStats.booksRead} completed
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentStep('profile')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center space-x-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create New Book</span>
              </button>
            </div>
          </div>

          {/* Quick Generate Presets */}
          <div className="card-elegant p-6">
            <h3 className="font-display text-xl font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 text-yellow-500 mr-2" />
              Quick Generate - Surprise Yourself!
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickGenPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => generatePersonalizedBook(preset)}
                  className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-blue-50 rounded-lg text-center transition-all hover-lift group border-2 border-transparent hover:border-purple-200"
                  disabled={isGenerating}
                >
                  <div className="font-medium text-sm text-gray-900 group-hover:text-purple-700 mb-1">
                    {preset.name}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{preset.genre}</div>
                  <div className="text-xs text-gray-400 italic">{preset.prompt.slice(0, 40)}...</div>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center italic">
              Each preset uses your profile to create something unique and unexpected!
            </p>
          </div>

          {/* Books Display */}
          {personalLibrary.length === 0 ? (
            <div className="card-elegant p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-display text-2xl font-semibold text-gray-600 mb-2">Your Library Awaits</h3>
              <p className="font-serif text-gray-500 mb-6">
                Create your first personalized book to begin your infinite reading journey!
              </p>
              <div className="space-y-4">
                <button 
                  onClick={() => setCurrentStep('profile')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold"
                >
                  Create Your First Book
                </button>
                <p className="text-sm text-gray-500">
                  Or try one of the quick generate options above for instant inspiration!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {personalLibrary.map((book) => (
                <div key={book.id} className="card-elegant hover-lift group p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 mb-2">
                        {book.title}
                      </h3>
                      <p className="font-serif text-gray-600 text-sm">by {book.author}</p>
                      <div className="flex items-center space-x-2 mt-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
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
                          setCurrentStep('generated');
                        }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => {
                          setCurrentBook(book);
                          setIsReading(true);
                          setCurrentChapter(Math.floor(book.readingProgress / 100 * book.chapters.length));
                          generateFullBook(book);
                        }}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {book.readingProgress === 0 ? 'Start' : 'Continue'}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Rest of render functions
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
        
        <div className="space-y-6">
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{width: `${generationProgress}%`}}
            >
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
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

  const renderGeneratedBook = () => {
    if (!currentBook) return null;
    
    return (
      <div className="min-h-screen paper-texture py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-12">
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
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <Bookmark className="w-12 h-12 text-purple-600" />
                <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900">
                  Your Book is Ready!
                </h1>
              </div>
            </div>

            {/* Book Preview */}
            <div className="vintage-border p-0 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 rounded-3xl overflow-hidden">
              <div className="p-12 text-white relative overflow-hidden">
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
                    </div>
                    <p className="font-serif text-lg leading-relaxed opacity-95 max-w-3xl">
                      {currentBook.premise}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Read Now Section */}
            <div className="text-center space-y-8">
              <div className="vintage-border p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-center space-x-3">
                    <BookOpen className="w-8 h-8 text-purple-600" />
                    <span className="font-display text-2xl font-semibold text-gray-800">Ready to Begin?</span>
                  </div>
                  
                  <p className="font-serif text-gray-700 max-w-2xl mx-auto">
                    Immerse yourself in a story written uniquely for you.
                  </p>
                  
                  <div className="flex justify-center space-x-4">
                    <button 
                      onClick={() => {
                        setIsReading(true);
                        setCurrentChapter(0);
                        generateFullBook(currentBook);
                      }}
                      className="group bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white font-semibold text-xl px-12 py-5 rounded-2xl hover-lift transition-all duration-300"
                    >
                      <span className="flex items-center space-x-3">
                        <BookOpen className="w-6 h-6" />
                        <span>Start Reading</span>
                      </span>
                    </button>
                    
                    <button 
                      onClick={() => setCurrentStep('profile')}
                      className="px-8 py-5 border-2 border-purple-600 text-purple-600 font-semibold rounded-2xl hover:bg-purple-50 transition-all"
                    >
                      Create Another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReadingInterface = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 paper-texture">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsReading(false)}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              <span>Back to Book</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="font-serif text-sm text-gray-600">
                Chapter {currentChapter + 1} of {bookContent?.chapters?.length || currentBook?.chapters.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {currentBook?.title}
            </h1>
            <p className="font-serif text-xl text-gray-600">by {currentBook?.author}</p>
          </div>

          <div className="reading-content bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
            {bookContent?.loading ? (
              <div className="text-center py-12">
                <div className="animate-spin mb-4">
                  <Sparkles className="w-12 h-12 text-purple-600 mx-auto" />
                </div>
                <p className="font-serif text-lg text-gray-600">Generating your full story...</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-8">
                  {bookContent?.chapters?.[currentChapter]?.title || currentBook?.chapters[currentChapter]}
                </h2>
                
                <div className="font-serif text-lg leading-relaxed text-gray-800">
                  {bookContent?.chapters?.[currentChapter]?.content ? 
                    bookContent.chapters[currentChapter].content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-6">{paragraph}</p>
                    )) : 
                    <div className="text-center py-8">
                      <p className="text-gray-600">Generating chapter content...</p>
                    </div>
                  }
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
              disabled={currentChapter === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              {currentBook?.chapters.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentChapter(index)}
                  className={`w-10 h-10 rounded-full font-medium transition-all ${
                    index === currentChapter ? 'bg-purple-600 text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentChapter(Math.min((currentBook?.chapters.length || 1) - 1, currentChapter + 1))}
              disabled={currentChapter >= (currentBook?.chapters.length || 1) - 1}
              className="flex items-center space-x-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Main component return logic
  if (isReading && currentBook) {
    return renderReadingInterface();
  }

  if (isGenerating) {
    return renderGenerating();
  }

  switch (currentStep) {
    case 'welcome':
      return renderWelcome();
    case 'profile':
      return user ? renderProfileForm() : renderWelcome();
    case 'library':
      return user ? renderLibrary() : renderWelcome();
    case 'generated':
      return currentBook ? renderGeneratedBook() : renderWelcome();
    default:
      return renderWelcome();
  }
};

export default InfiniteLibrary;import React, { useState, useEffect } from 'react';
import { 
  Book, Sparkles, User, Heart, Globe, Clock, Download, Star, 
  BookOpen, Feather, Scroll, Library, Quote, ArrowRight,
  CheckCircle, Circle, Zap, Crown, Bookmark, Search, Filter,
  Grid, List, RefreshCw, Share2, Save, Eye, Trash2, Settings,
  PlusCircle, BookMarked, Calendar, TrendingUp, Award, LogOut
} from 'lucide-react';
import AuthModal from './AuthModal';

// Enhanced interfaces
interface AuthUser {
  id: string;
  name: string;
  email: string;
}

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
  // Free-form creative fields
  favoriteBooks: string;
  dreamScenario: string;
  personalStory: string;
  creativeTrigger: string;
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
  complexity?: string;
  narrativeStyle?: string;
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
  // Authentication state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Navigation state
  const [currentStep, setCurrentStep] = useState<string>('welcome');
  
  // User profile and library state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    age: '',
    interests: [],
    readingLevel: '',
    preferredGenre: '',
    personalityTraits: [],
    currentMood: '',
    location: '',
    personalChallenges: [],
    favoriteBooks: '',
    dreamScenario: '',
    personalStory: '',
    creativeTrigger: ''
  });
  
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
  
  // Generation and reading state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string>('');
  const [animationStep, setAnimationStep] = useState<number>(0);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [bookContent, setBookContent] = useState<BookContent | null>(null);

  // Creative quick generation presets
  const quickGenPresets = [
    { 
      name: 'Surprise Me!', 
      genre: 'Random', 
      mood: 'curious', 
      tags: ['unexpected', 'creative'],
      prompt: 'Create something completely unexpected based on my personality'
    },
    { 
      name: 'Dream Adventure', 
      genre: 'Fantasy', 
      mood: 'adventurous', 
      tags: ['dreams', 'adventure'],
      prompt: 'Turn my wildest dreams into an epic adventure'
    },
    { 
      name: 'Personal Growth', 
      genre: 'Self-Help', 
      mood: 'motivated', 
      tags: ['growth', 'inspiration'],
      prompt: 'Create a story that helps me overcome my current challenges'
    },
    { 
      name: 'Cozy Escape', 
      genre: 'Romance', 
      mood: 'peaceful', 
      tags: ['comfort', 'escape'],
      prompt: 'Give me a heartwarming story to escape into'
    },
    { 
      name: 'Mind Bender', 
      genre: 'Science Fiction', 
      mood: 'contemplative', 
      tags: ['thought-provoking', 'complex'],
      prompt: 'Challenge my thinking with a mind-bending sci-fi tale'
    },
    { 
      name: 'Mystery Box', 
      genre: 'Mystery/Thriller', 
      mood: 'curious', 
      tags: ['mystery', 'intrigue'],
      prompt: 'Create a mystery that I would love to solve'
    }
  ];

  const interests: string[] = [
    'Technology', 'Nature', 'Adventure', 'Mystery', 'Romance', 'Science',
    'History', 'Art', 'Music', 'Sports', 'Travel', 'Cooking', 'Animals',
    'Space', 'Magic', 'Friendship', 'Family', 'Career', 'Health', 'Philosophy',
    'Psychology', 'Economics', 'Politics', 'Environment', 'Innovation',
    'Gaming', 'Photography', 'Writing', 'Dancing', 'Meditation', 'Learning'
  ];

  const personalityTraits: string[] = [
    'Adventurous', 'Analytical', 'Creative', 'Empathetic', 'Humorous',
    'Introverted', 'Optimistic', 'Practical', 'Curious', 'Ambitious',
    'Compassionate', 'Independent', 'Thoughtful', 'Energetic', 'Patient',
    'Bold', 'Diplomatic', 'Innovative', 'Resilient', 'Wise', 'Playful',
    'Introspective', 'Spontaneous', 'Methodical', 'Artistic'
  ];

  const personalChallenges: string[] = [
    'Building confidence', 'Career transition', 'Relationship issues',
    'Stress management', 'Finding purpose', 'Overcoming fear',
    'Work-life balance', 'Health goals', 'Financial planning',
    'Personal growth', 'Communication skills', 'Time management',
    'Creative blocks', 'Decision making', 'Self-acceptance',
    'Leadership skills', 'Public speaking', 'Setting boundaries'
  ];

  const genres: string[] = [
    'Surprise Me (AI Choice)', 'Mystery/Thriller', 'Romance', 'Science Fiction', 'Fantasy',
    'Self-Help', 'Adventure', 'Historical Fiction', 'Contemporary Fiction',
    'Educational', 'Comedy', 'Horror', 'Drama', 'Poetry', 'Philosophy', 
    'Business', 'Health & Wellness', 'Memoir Style', 'Experimental Fiction'
  ];

  // Authentication and data management functions
  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (currentStep === 'welcome') {
      const timer = setTimeout(() => setAnimationStep(1), 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    if (user && !userProfile.name) {
      setUserProfile(prev => ({
        ...prev,
        name: user.name
      }));
    }
  }, [user]);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        loadUserData(data.user.id);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleAuthSuccess = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    setShowAuthModal(false);
    loadUserData(authenticatedUser.id);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setPersonalLibrary([]);
      setCurrentStep('welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      const savedLibrary = localStorage.getItem(`library_${userId}`);
      if (savedLibrary) {
        const library = JSON.parse(savedLibrary);
        setPersonalLibrary(library);
        updateLibraryStats(library);
      }
      
      const savedProfile = localStorage.getItem(`profile_${userId}`);
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setUserProfile(prev => ({ ...prev, ...profile }));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const saveUserLibrary = (library: GeneratedBook[]) => {
    if (user) {
      try {
        localStorage.setItem(`library_${user.id}`, JSON.stringify(library));
      } catch (error) {
        console.error('Failed to save library:', error);
      }
    }
  };

  const saveUserProfile = (profile: UserProfile) => {
    if (user) {
      try {
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(profile));
      } catch (error) {
        console.error('Failed to save profile:', error);
      }
    }
  };

  const requireAuth = (action: () => void) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    action();
  };

  // Enhanced book generation with creativity focus
  const generatePersonalizedBook = async (preset?: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationError('');
    
    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 8, 90));
      }, 400);

      // Save current profile
      saveUserProfile(userProfile);

      const profileToUse = preset ? {
        ...userProfile,
        preferredGenre: preset.genre === 'Random' ? 'Surprise Me (AI Choice)' : preset.genre,
        currentMood: preset.mood,
        creativeTrigger: preset.prompt || userProfile.creativeTrigger
      } : userProfile;

      const res = await fetch('/api/generateBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...profileToUse,
          variation: Math.random(),
          previousBooks: personalLibrary.map(book => ({ title: book.title, genre: book.genre })),
          creativeMode: true,
          preset: preset
        })
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!res.ok) {
        if (res.status === 401) {
          setUser(null);
          setShowAuthModal(true);
          throw new Error('Please log in to generate books');
        }
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Book generation failed');
      }

      const data = await res.json();
      
      const newBook: GeneratedBook = {
        ...data,
        id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        readingProgress: 0,
        favorite: false,
        tags: preset?.tags || ['personalized'],
        mood: preset?.mood || userProfile.currentMood,
        difficulty: determineDifficulty(userProfile.readingLevel, data.genre)
      };

      const updatedLibrary = [newBook, ...personalLibrary];
      setPersonalLibrary(updatedLibrary);
      setCurrentBook(newBook);
      updateLibraryStats(updatedLibrary);
      saveUserLibrary(updatedLibrary);
      setCurrentStep('generated');
      
    } catch (error: any) {
      console.error('Book generation error:', error);
      setGenerationError(error.message || 'Something went wrong during book generation. Please try again.');
      if (currentStep !== 'library') setCurrentStep('profile');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const generateFullBook = async (book: GeneratedBook) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setBookContent({ chapters: [], loading: true });
      
      const res = await fetch('/api/generateFullBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          bookSummary: book,
          userProfile: userProfile 
        })
      });

      if (!res.ok) {
        if (res.status === 401) {
          setUser(null);
          setShowAuthModal(true);
          throw new Error('Please log in to read full books');
        }
        throw new Error('Failed to generate full book content');
      }

      const fullContent = await res.json();
      setBookContent(fullContent);
      
    } catch (error: any) {
      console.error('Full book generation error:', error);
      if (error.message.includes('log in')) {
        setBookContent(null);
        return;
      }
      setBookContent(createFallbackContent(book));
    }
  };

  // Utility functions
  const determineDifficulty = (readingLevel: string, genre: string): 'easy' | 'medium' | 'hard' => {
    if (readingLevel === 'casual') return 'easy';
    if (readingLevel === 'advanced') return 'hard';
    return genre === 'Science Fiction' || genre === 'Philosophy' ? 'hard' : 'medium';
  };

  const updateLibraryStats = (library: GeneratedBook[] = personalLibrary) => {
    setLibraryStats({
      totalBooks: library.length,
      booksRead: library.filter(book => book.readingProgress === 100).length,
      readingStreak: Math.floor(library.length / 3),
      favoriteGenre: getMostPopularGenre(library),
      totalReadingTime: calculateTotalReadingTime(library)
    });
  };

  const getMostPopularGenre = (library: GeneratedBook[]): string => {
    if (library.length === 0) return userProfile.preferredGenre;
    const genreCounts = library.reduce((acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(genreCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '';
  };

  const calculateTotalReadingTime = (library: GeneratedBook[]): number => {
    return library.reduce((total, book) => {
      const readingTimeNum = parseInt(book.readingTime.split('-')[0]) || 30;
      return total + (readingTimeNum * book.readingProgress / 100);
    }, 0);
  };

  const toggleBookFavorite = (bookId: string) => {
    const updatedLibrary = personalLibrary.map(book => 
      book.id === bookId ? { ...book, favorite: !book.favorite } : book
    );
    setPersonalLibrary(updatedLibrary);
    saveUserLibrary(updatedLibrary);
  };

  const deleteBook = (bookId: string) => {
    const updatedLibrary = personalLibrary.filter(book => book.id !== bookId);
    setPersonalLibrary(updatedLibrary);
    updateLibraryStats(updatedLibrary);
    saveUserLibrary(updatedLibrary);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    const updatedProfile = {
      ...userProfile,
      [field]: value
    };
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
  };

  const handleArrayToggle = (field: keyof UserProfile, item: string) => {
    const currentArray = userProfile[field] as string[];
    const updatedProfile = {
      ...userProfile,
      [field]: currentArray.includes(item) 
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item]
    };
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
  };

  const createFallbackContent = (book: GeneratedBook): BookContent => {
    return {
      chapters: book.chapters.map((title, index) => ({
        title,
        content: `This is the beginning of ${title}. In this chapter, our story unfolds as ${userProfile.name} embarks on a journey that reflects their unique perspective and experiences.

The narrative weaves together elements that speak to their interests and personality, creating a story that feels both personal and engaging.

As the chapter progresses, themes and ideas become apparent, setting the stage for the adventures to come.

This personalized tale continues to unfold, drawing from the rich tapestry of ${userProfile.name}'s unique perspective and experiences...

[This is a preview of your personalized book. The full AI-generated content would continue here with rich, detailed storytelling tailored specifically to your profile and preferences.]`
      }))
    };
  };

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <BookOpen className="w-12 h-12 text-purple-600 mx-auto" />
          </div>
          <p className="font-serif text-lg text-gray-600">Loading your library...</p>
        </div>
      </div>
    );
  }

  // Enhanced Welcome Screen
  const renderWelcome = () => (
    <div className="min-h-screen paper-texture relative overflow-hidden">
      {/* Navigation Bar */}
      <div className="relative z-20 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <span className="font-display text-2xl font-bold text-gray-900">Infinite Library</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-700">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>

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
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <button 
              onClick={() => requireAuth(() => setCurrentStep('profile'))}
              className="group card-elegant p-8 hover-lift text-left"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <PlusCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display text-2xl font-semibold">
                  {user ? 'Create Your Next Book' : 'Start Your Journey'}
                </h3>
              </div>
              <p className="font-serif text-gray-600 mb-4">
                {user 
                  ? 'Generate another perfectly personalized story tailored just for you.'
                  : 'Sign up to create your first AI-generated personalized book.'
                }
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                <span>{user ? 'Create Book' : 'Get Started'}</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {user && personalLibrary.length > 0 ? (
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
                <p className="font-serif text-gray-600 mb-4">
                  Continue reading or browse your collection of {personalLibrary.length} personalized books.
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  <span>Browse Library</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ) : (
              <div className="card-elegant p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                    <Library className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-gray-600">Your Library</h3>
                </div>
                <p className="font-serif text-gray-500 mb-4">
                  {user 
                    ? 'Your personalized books will appear here once you create them.'
                    : 'Sign in to start building your personal collection of AI-generated books.'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Stats Display */}
          {user && personalLibrary.length > 0 && (
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

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );

  // Creative Profile Form with Free-Response Fields
  const renderProfileForm = () => (
    <div className="min-h-screen paper-texture py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900">
              Tell Us Your Story
            </h1>
            <p className="font-serif text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              The more we understand about you, the more beautifully we can craft your personal narrative. 
              Be creative and honest - this is what makes your book truly unique.
            </p>
            
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

          {/* Basic Info */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="card-elegant p-8 space-y-8">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                  <User className="w-8 h-8 text-blue-600" />
                  <span>About You</span>
                </h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-sans font-medium text-gray-800 mb-3 text-lg">Your Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl font-serif text-lg focus:border-purple-500 focus:ring-0 transition-colors bg-white"
                    placeholder="What should we call you?"
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
                    
