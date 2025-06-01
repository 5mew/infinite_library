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
    personalChallenges: []
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

  // Authentication check on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Animation trigger
  useEffect(() => {
    if (currentStep === 'welcome') {
      const timer = setTimeout(() => setAnimationStep(1), 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Update user profile name when user logs in
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
    } catch (error) {
      console.error('Failed to load user library:', error);
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

  const requireAuth = (action: () => void) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    action();
  };

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
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const profileToUse = preset ? {
        ...userProfile,
        preferredGenre: preset.genre,
        currentMood: preset.mood
      } : userProfile;

      const res = await fetch('/api/generateBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...profileToUse,
          variation: Math.random(),
          previousBooks: personalLibrary.map(book => ({ title: book.title, genre: book.genre }))
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
        const errorText = await res.text();
        throw new Error(errorText || 'Book generation failed');
      }

      const data = await res.json();
      
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

      const updatedLibrary = [newBook, ...personalLibrary];
      setPersonalLibrary(updatedLibrary);
      setCurrentBook(newBook);
      updateLibraryStats(updatedLibrary);
      saveUserLibrary(updatedLibrary);
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

  const determineDifficulty = (readingLevel: string, genre: string): 'easy' | 'medium' | 'hard' => {
    if (readingLevel === 'casual') return 'easy';
    if (readingLevel === 'advanced') return 'hard';
    return genre === 'Science Fiction' || genre === 'Philosophy' ? 'hard' : 'medium';
  };

  const updateLibraryStats = (library: GeneratedBook[] = personalLibrary) => {
    setLibraryStats({
      totalBooks: library.length,
      booksRead: library.filter(book => book.readingProgress === 100).length,
      readingStreak: calculateReadingStreak(library),
      favoriteGenre: getMostPopularGenre(library),
      totalReadingTime: calculateTotalReadingTime(library)
    });
  };

  const calculateReadingStreak = (library: GeneratedBook[]): number => {
    return Math.floor(library.length / 3);
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

  // Show loading state while checking authentication
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

  // Enhanced Welcome Screen with Authentication
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

          {/* Authentication-aware Quick Actions */}
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
                <div className="flex items-center text-gray-400 font-medium">
                  <span>{user ? 'Create your first book' : 'Sign in to continue'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats Display if user is logged in and has library */}
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

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );

  // Simple render functions for now
  const renderProfileForm = () => (
    <div className="min-h-screen paper-texture py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl font-bold mb-8">Create Your Profile</h1>
          <p className="text-gray-600 mb-8">Profile form will be here</p>
          <button 
            onClick={() => setCurrentStep('welcome')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg"
          >
            Back to Welcome
          </button>
        </div>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="min-h-screen paper-texture py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl font-bold mb-8">Your Library</h1>
          <p className="text-gray-600 mb-8">Library will be here</p>
          <button 
            onClick={() => setCurrentStep('welcome')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg"
          >
            Back to Welcome
          </button>
        </div>
      </div>
    </div>
  );

  const renderGenerating = () => (
    <div className="min-h-screen paper-texture flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <Sparkles className="w-16 h-16 text-purple-600 mx-auto" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-4">Generating Your Book...</h2>
        <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${generationProgress}%` }}
          />
        </div>
      </div>
    </div>
  );

  const renderGeneratedBook = () => (
    <div className="min-h-screen paper-texture py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl font-bold mb-8">Book Generated!</h1>
          <p className="text-gray-600 mb-8">Generated book display will be here</p>
          <button 
            onClick={() => setCurrentStep('library')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg"
          >
            Go to Library
          </button>
        </div>
      </div>
    </div>
  );

  const renderReadingInterface = () => (
    <div className="min-h-screen paper-texture py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl font-bold mb-8">Reading Interface</h1>
          <p className="text-gray-600 mb-8">Reading interface will be here</p>
          <button 
            onClick={() => setIsReading(false)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg"
          >
            Back to Book
          </button>
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

export default InfiniteLibrary;
