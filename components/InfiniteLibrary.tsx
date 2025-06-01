import React, { useState, useEffect } from 'react';
import { Book, User, LogOut, Sparkles, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

// Types
interface UserProfile {
  name: string;
  age: number;
  interests: string[];
  readingLevel: string;
  preferredGenre: string;
  personalityTraits: string[];
  currentMood: string;
  location: string;
  personalChallenges: string[];
  favoriteBooks: string;
  dreamScenario: string;
  personalStory: string;
  creativeTrigger: string;
}

interface Book {
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
}

interface Chapter {
  title: string;
  content: string;
}

enum Step {
  Welcome,
  Profile,
  Browse,
  Read,
}

// Auth Modal Component
const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onSuccess(data.user);
      onClose();
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your full name"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your full name"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const InfiniteLibrary = () => {
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(Step.Welcome);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [generatedBook, setGeneratedBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [userProfile, setUserProfile] = useState({
    name: '',
    age: 25,
    interests: [],
    readingLevel: 'intermediate',
    preferredGenre: '',
    personalityTraits: [],
    currentMood: 'relaxed',
    location: '',
    personalChallenges: [],
    favoriteBooks: '',
    dreamScenario: '',
    personalStory: '',
    creativeTrigger: '',
  });

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setUserProfile(prev => ({ ...prev, name: data.user.name }));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setCurrentStep(Step.Welcome);
      setGeneratedBook(null);
      setChapters([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAuthSuccess = (authUser) => {
    setUser(authUser);
    setUserProfile(prev => ({ ...prev, name: authUser.name }));
    setCurrentStep(Step.Profile);
  };

  const handleGenerateBook = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/generateBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate book');
      }

      setGeneratedBook(data);
      setCurrentStep(Step.Browse);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFullBook = async () => {
    if (!generatedBook) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/generateFullBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookSummary: generatedBook,
          userProfile
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate full book');
      }

      setChapters(data.chapters);
      setCurrentChapter(0);
      setCurrentStep(Step.Read);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Welcome Screen
  if (currentStep === Step.Welcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <Book className="w-20 h-20 mx-auto text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Infinite Library
            </h1>
            <p className="text-xl text-gray-600">
              Where every book is written just for you
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Welcome to Your Personal Literary Universe
            </h2>
            <p className="text-gray-600">
              Experience stories crafted uniquely for your interests, personality, and current mood. 
              Each book is a one-of-a-kind creation that speaks directly to you.
            </p>
            
            <div className="space-y-4">
              {user ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Signed in as {user.email}</p>
                  <button
                    onClick={() => setCurrentStep(Step.Profile)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Start Your Journey <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Begin Your Story <Sparkles className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  // Profile Creation Screen
  if (currentStep === Step.Profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Tell Us About Yourself</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="How should we address you?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={userProfile.age}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Genre</label>
                <select
                  value={userProfile.preferredGenre}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, preferredGenre: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a genre</option>
                  <option value="Mystery/Thriller">Mystery/Thriller</option>
                  <option value="Romance">Romance</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Self-Help">Self-Help</option>
                  <option value="Adventure">Adventure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Interests (comma-separated)</label>
                <input
                  type="text"
                  value={userProfile.interests.join(', ')}
                  onChange={(e) => setUserProfile(prev => ({ 
                    ...prev, 
                    interests: e.target.value.split(',').map(i => i.trim()).filter(i => i)
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., cooking, travel, technology, music"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Mood</label>
                <select
                  value={userProfile.currentMood}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, currentMood: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="relaxed">Relaxed</option>
                  <option value="adventurous">Adventurous</option>
                  <option value="thoughtful">Thoughtful</option>
                  <option value="excited">Excited</option>
                  <option value="romantic">Romantic</option>
                  <option value="curious">Curious</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reading Level</label>
                <select
                  value={userProfile.readingLevel}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, readingLevel: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="casual">Casual</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerateBook}
                disabled={loading || !userProfile.name || !userProfile.preferredGenre || userProfile.interests.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Your Book...
                  </>
                ) : (
                  <>
                    Generate My Book <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Book Browse Screen
  if (currentStep === Step.Browse && generatedBook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Your Personalized Book</h1>
            <button
              onClick={() => setCurrentStep(Step.Profile)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Profile
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold text-gray-800">{generatedBook.title}</h2>
                <p className="text-xl text-gray-600">by {generatedBook.author}</p>
                <div className="flex justify-center gap-2 mt-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {generatedBook.genre}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {generatedBook.readingTime}
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-4">
                <h3 className="font-semibold text-gray-700 mb-2">Premise</h3>
                <p className="text-gray-600">{generatedBook.premise}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Personalized Elements</h3>
                <ul className="space-y-2">
                  {generatedBook.personalizedElements.map((element, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span className="text-gray-600">{element}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Chapters</h3>
                <ol className="space-y-2">
                  {generatedBook.chapters.map((chapter, i) => (
                    <li key={i} className="text-gray-600">{chapter}</li>
                  ))}
                </ol>
              </div>

              <button
                onClick={handleGenerateFullBook}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Chapters...
                  </>
                ) : (
                  <>
                    Start Reading <Book className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reading Screen
  if (currentStep === Step.Read && chapters.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">{generatedBook?.title}</h1>
            <button
              onClick={() => setCurrentStep(Step.Browse)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Overview
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-serif text-center text-gray-800 mb-8">
                {chapters[currentChapter].title}
              </h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {chapters[currentChapter].content}
                </p>
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                <button
                  onClick={() => setCurrentChapter(prev => Math.max(0, prev - 1))}
                  disabled={currentChapter === 0}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  ← Previous
                </button>
                
                <span className="text-gray-500">
                  Chapter {currentChapter + 1} of {chapters.length}
                </span>
                
                <button
                  onClick={() => setCurrentChapter(prev => Math.min(chapters.length - 1, prev + 1))}
                  disabled={currentChapter === chapters.length - 1}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
export default InfiniteLibrary;
