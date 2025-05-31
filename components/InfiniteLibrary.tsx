import React, { useState, useEffect } from 'react';
import { 
  Book, Sparkles, User, Heart, Globe, Clock, Download, Star, 
  BookOpen, Feather, Scroll, Library, Quote, ArrowRight,
  CheckCircle, Circle, Zap, Crown, Bookmark
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
  title: string;
  author: string;
  genre: string;
  premise: string;
  themes: string[];
  personalizedElements: string[];
  chapters: string[];
  estimatedLength: string;
  readingTime: string;
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
  const [generatedBook, setGeneratedBook] = useState<GeneratedBook | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string>('');
  const [animationStep, setAnimationStep] = useState<number>(0);

  const interests: string[] = [
    'Technology', 'Nature', 'Adventure', 'Mystery', 'Romance', 'Science',
    'History', 'Art', 'Music', 'Sports', 'Travel', 'Cooking', 'Animals',
    'Space', 'Magic', 'Friendship', 'Family', 'Career', 'Health'
  ];

  const personalityTraits: string[] = [
    'Adventurous', 'Analytical', 'Creative', 'Empathetic', 'Humorous',
    'Introverted', 'Optimistic', 'Practical', 'Curious', 'Ambitious',
    'Compassionate', 'Independent', 'Thoughtful', 'Energetic'
  ];

  const personalChallenges: string[] = [
    'Building confidence', 'Career transition', 'Relationship issues',
    'Stress management', 'Finding purpose', 'Overcoming fear',
    'Work-life balance', 'Health goals', 'Financial planning',
    'Personal growth', 'Communication skills', 'Time management'
  ];

  const genres: string[] = [
    'Mystery/Thriller', 'Romance', 'Science Fiction', 'Fantasy',
    'Self-Help', 'Adventure', 'Historical Fiction', 'Contemporary Fiction',
    'Educational', 'Children\'s Story', 'Biography/Memoir', 'Comedy'
  ];

  useEffect(() => {
    if (currentStep === 'welcome') {
      const timer = setTimeout(() => setAnimationStep(1), 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

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

  const generatePersonalizedBook = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const res = await fetch('/api/generateBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile)
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Book generation failed');
      }

      const data = await res.json();
      setGeneratedBook(data);
      setCurrentStep('generated');
      
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'book_generated', {
          event_category: 'engagement',
          event_label: userProfile.preferredGenre,
          value: 1
        });
      }
    } catch (error: any) {
      console.error('Book generation error:', error);
      setGenerationError(error.message || 'Something went wrong during book generation. Please try again.');
      setCurrentStep('profile');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const renderWelcome = () => (
    <div className="min-h-screen paper-texture relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 transform rotate-12">
          <Feather className="w-32 h-32 text-gray-600" />
        </div>
        <div className="absolute bottom-32 right-32 transform -rotate-12">
          <Scroll className="w-24 h-24 text-gray-600" />
        </div>
        <div className="absolute top-1/2 left-1/4 transform -rotate-45">
          <Quote className="w-16 h-16 text-gray-600" />
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="text-center space-y-12 max-w-5xl mx-auto">
          {/* Hero section */}
          <div className={`space-y-8 ${animationStep >= 1 ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 animate-book-flip">
                  <BookOpen className="w-24 h-24 text-purple-600" />
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full opacity-20 blur-xl"></div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h1 className="font-display text-7xl md:text-8xl font-bold text-gray-900 leading-tight">
                Infinite
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 bg-clip-text text-transparent">
                  {' '}Library
                </span>
              </h1>
              
              <div className="relative max-w-3xl mx-auto">
                <p className="font-serif text-2xl md:text-3xl text-gray-700 leading-relaxed italic">
                  "Where every story is written uniquely for you"
                </p>
                <div className="absolute -top-4 -left-4">
                  <Quote className="w-8 h-8 text-purple-400 opacity-50" />
                </div>
              </div>
              
              <p className="font-sans text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Experience books crafted by advanced AI to match your personality, interests, 
                and current life journey. Every narrative is as unique as you are.
              </p>
            </div>
          </div>

          {/* Features grid */}
          <div className={`grid md:grid-cols-3 gap-8 mt-16 ${animationStep >= 1 ? 'animate-slide-in-right' : 'opacity-0'}`}>
            <div className="card-elegant p-8 hover-lift group">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-gray-900">Deeply Personal</h3>
                <p className="font-serif text-gray-600 leading-relaxed">
                  Characters and plots intricately woven around your unique personality, 
                  experiences, and the chapters of your own story.
                </p>
              </div>
            </div>

            <div className="card-elegant p-8 hover-lift group">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-gray-900">AI Artistry</h3>
                <p className="font-serif text-gray-600 leading-relaxed">
                  Cutting-edge artificial intelligence creates literary works that rival 
                  traditional authorship, tailored precisely to your preferences.
                </p>
              </div>
            </div>

            <div className="card-elegant p-8 hover-lift group">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-gray-900">Emotionally Resonant</h3>
                <p className="font-serif text-gray-600 leading-relaxed">
                  Stories that speak to your soul, addressing your current challenges 
                  and aspirations with profound empathy and wisdom.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 space-y-8">
            <div className="vintage-border p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl">
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-4">
                  <Crown className="w-8 h-8 text-yellow-600" />
                  <span className="font-display text-2xl font-semibold text-gray-800">Begin Your Literary Journey</span>
                  <Crown className="w-8 h-8 text-yellow-600" />
                </div>
                
                <p className="font-serif text-lg text-gray-700 max-w-2xl mx-auto">
                  In just a few moments, we'll craft a masterpiece that reflects your inner world. 
                  Your personalized book awaits—shall we begin?
                </p>
                
                <button 
                  onClick={() => setCurrentStep('profile')}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white font-semibold text-xl px-12 py-5 rounded-2xl hover-lift transition-all duration-300 focus-ring"
                >
                  <span className="relative z-10 flex items-center space-x-3">
                    <Feather className="w-6 h-6" />
                    <span>Craft My Personal Book</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center space-x-12 pt-8">
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-purple-600">10,000+</div>
                <div className="font-sans text-sm text-gray-600 uppercase tracking-wide">Books Created</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-blue-600">98%</div>
                <div className="font-sans text-sm text-gray-600 uppercase tracking-wide">Reader Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-purple-600">∞</div>
                <div className="font-sans text-sm text-gray-600 uppercase tracking-wide">Possibilities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
            
            {/* Progress indicator */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="w-3 h-3 rounded-full bg-purple-200"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Form sections */}
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
              <p className="font-serif text-gray-600 mt-2">Select up to 5 things that spark your curiosity</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {interests.map(interest => (
                <button
                  key={interest}
                  onClick={() => handleArrayToggle('interests', interest)}
                  className={`group relative p-4 rounded-xl font-medium transition-all duration-300 border-2 ${
                    userProfile.interests.includes(interest)
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-600 shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                  disabled={!userProfile.interests.includes(interest) && userProfile.interests.length >= 5}
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
                {userProfile.interests.length}/5 selected
              </span>
            </div>
          </div>

          {/* Personality Traits */}
          <div className="card-elegant p-8 space-y-8">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="font-display text-3xl font-semibold text-gray-900 flex items-center space-x-3">
                <Sparkles className="w-8 h-8 text-yellow-500" />
                <span>Your Essence</span>
              </h2>
              <p className="font-serif text-gray-600 mt-2">Choose 3-5 traits that best describe your personality</p>
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
                  disabled={!userProfile.personalityTraits.includes(trait) && userProfile.personalityTraits.length >= 5}
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
                {userProfile.personalityTraits.length}/5 selected
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
                  onClick={generatePersonalizedBook}
                  disabled={!userProfile.name || !userProfile.preferredGenre || userProfile.interests.length === 0}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white font-semibold text-xl px-12 py-5 rounded-2xl hover-lift transition-all duration-300 focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="relative z-10 flex items-center space-x-3">
                    <Feather className="w-6 h-6" />
                    <span>Generate My Personal Book</span>
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

  const renderGeneratedBook = () => (
    <div className="min-h-screen paper-texture py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-6 animate-fade-in-up">
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

          {generatedBook && (
            <>
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
                        {generatedBook.title}
                      </h1>
                      <p className="font-serif text-xl opacity-90">by {generatedBook.author}</p>
                      <div className="inline-block px-4 py-2 bg-white/20 rounded-full">
                        <span className="font-sans text-sm font-medium">{generatedBook.genre}</span>
                      </div>
                      <p className="font-serif text-lg leading-relaxed opacity-95 max-w-3xl">
                        {generatedBook.premise}
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
                    {generatedBook.personalizedElements.map((element, index) => (
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
                      <span className="font-serif font-semibold text-gray-900">{generatedBook.estimatedLength}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="font-sans font-medium text-gray-600">Reading Time:</span>
                      <span className="font-serif font-semibold text-gray-900">{generatedBook.readingTime}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="font-sans font-medium text-gray-600">Chapters:</span>
                      <span className="font-serif font-semibold text-gray-900">{generatedBook.chapters.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter Outline */}
              <div className="card-elegant p-8 space-y-6">
                <h3 className="font-display text-2xl font-semibold text-center">Chapter Journey</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedBook.chapters.map((chapter, index) => (
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
                  {generatedBook.themes.map((theme, index) => (
                    <span key={index} className="px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 rounded-full font-serif font-medium text-lg border border-purple-200">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-center space-y-8">
                <div className="vintage-border p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl">
                  <div className="space-y-6">
                    <h3 className="font-display text-2xl font-semibold text-gray-800">
                      Ready to Begin Reading?
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                      <button className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold text-lg px-10 py-4 rounded-2xl hover-lift transition-all duration-300 focus-ring">
                        <span className="relative z-10 flex items-center space-x-3">
                          <Download className="w-5 h-5" />
                          <span>Download Digital ($19.99)</span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                      
                      <button className="group bg-white text-purple-600 border-2 border-purple-600 font-semibold text-lg px-10 py-4 rounded-2xl hover:bg-purple-50 transition-all duration-300 focus-ring">
                        <span className="flex items-center space-x-3">
                          <BookOpen className="w-5 h-5" />
                          <span>Order Physical Copy ($39.99)</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setCurrentStep('profile');
                    setGeneratedBook(null);
                  }}
                  className="group font-serif text-lg text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <span className="border-b border-purple-300 group-hover:border-purple-500">
                    Create Another Masterpiece
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {currentStep === 'welcome' && renderWelcome()}
      {currentStep === 'profile' && !isGenerating && renderProfileForm()}
      {isGenerating && renderGenerating()}
      {currentStep === 'generated' && generatedBook && renderGeneratedBook()}
    </div>
  );
};

export default InfiniteLibrary;
