import React, { useState } from 'react';
import { Book, Sparkles, User, Heart, Globe, Clock, Download, Star } from 'lucide-react';

const InfiniteLibrary = () => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [userProfile, setUserProfile] = useState({
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
  const [generatedBook, setGeneratedBook] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState('');

  const interests = [
    'Technology', 'Nature', 'Adventure', 'Mystery', 'Romance', 'Science',
    'History', 'Art', 'Music', 'Sports', 'Travel', 'Cooking', 'Animals',
    'Space', 'Magic', 'Friendship', 'Family', 'Career', 'Health'
  ];

  const personalityTraits = [
    'Adventurous', 'Analytical', 'Creative', 'Empathetic', 'Humorous',
    'Introverted', 'Optimistic', 'Practical', 'Curious', 'Ambitious',
    'Compassionate', 'Independent', 'Thoughtful', 'Energetic'
  ];

  const personalChallenges = [
    'Building confidence', 'Career transition', 'Relationship issues',
    'Stress management', 'Finding purpose', 'Overcoming fear',
    'Work-life balance', 'Health goals', 'Financial planning',
    'Personal growth', 'Communication skills', 'Time management'
  ];

  const genres = [
    'Mystery/Thriller', 'Romance', 'Science Fiction', 'Fantasy',
    'Self-Help', 'Adventure', 'Historical Fiction', 'Contemporary Fiction',
    'Educational', 'Children\'s Story', 'Biography/Memoir', 'Comedy'
  ];

  const handleInputChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field, item) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(item) 
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const generatePersonalizedBook = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Update progress during generation
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
      
      // Track successful generation
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'book_generated', {
          event_category: 'engagement',
          event_label: userProfile.preferredGenre,
          value: 1
        });
      }
    } catch (error) {
      console.error('Book generation error:', error);
      setGenerationError(error.message || 'Something went wrong during book generation. Please try again.');
      setCurrentStep('profile');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const createPersonalizedContent = (profile) => {
    // AI-like content generation logic (this would integrate with actual AI APIs)
    const bookTemplates = {
      'Mystery/Thriller': {
        title: `The ${profile.location || 'Hidden'} Conspiracy`,
        premise: `A ${profile.personalityTraits.includes('Analytical') ? 'methodical detective' : 'curious amateur sleuth'} in ${profile.location || 'a small town'} discovers a web of secrets that threatens everything they hold dear.`,
        themes: profile.personalChallenges.length > 0 ? profile.personalChallenges : ['justice', 'truth', 'courage']
      },
      'Romance': {
        title: `Love in the Time of ${profile.interests[0] || 'Change'}`,
        premise: `A ${profile.personalityTraits.includes('Creative') ? 'artistic' : 'passionate'} individual finds unexpected love while pursuing their dreams in ${profile.interests.includes('Travel') ? 'a foreign country' : 'their hometown'}.`,
        themes: ['love', 'growth', 'commitment']
      },
      'Self-Help': {
        title: `Your Journey to ${profile.personalChallenges[0] || 'Success'}`,
        premise: `A practical guide tailored for ${profile.personalityTraits.includes('Analytical') ? 'logical thinkers' : 'creative minds'} who want to overcome challenges and achieve their goals.`,
        themes: profile.personalChallenges
      },
      'Fantasy': {
        title: `The ${profile.personalityTraits[0] || 'Brave'} Chronicles`,
        premise: `In a world where ${profile.interests.includes('Magic') ? 'magic flows through nature' : 'ancient powers awaken'}, a young hero must embrace their unique gifts to save their realm.`,
        themes: ['courage', 'destiny', 'friendship']
      }
    };

    const selectedTemplate = bookTemplates[profile.preferredGenre] || bookTemplates['Fantasy'];
    
    return {
      title: selectedTemplate.title,
      author: "AI Author (Personalized for You)",
      genre: profile.preferredGenre,
      premise: selectedTemplate.premise,
      themes: selectedTemplate.themes,
      personalizedElements: [
        `Characters reflect your ${profile.personalityTraits.join(' and ')} nature`,
        `Story incorporates your interests in ${profile.interests.slice(0, 3).join(', ')}`,
        `Addresses your focus on ${profile.personalChallenges.slice(0, 2).join(' and ')}`,
        `Written for your ${profile.readingLevel} reading level`,
        `Set in locations similar to ${profile.location || 'familiar environments'}`
      ],
      chapters: [
        "Chapter 1: The Beginning",
        "Chapter 2: Discovery",
        "Chapter 3: Challenge",
        "Chapter 4: Growth",
        "Chapter 5: Resolution"
      ],
      estimatedLength: "15,000 words",
      readingTime: "45-60 minutes"
    };
  };

  const renderWelcome = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="flex justify-center">
          <Book className="w-16 h-16 text-purple-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Infinite Library</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Experience books written uniquely for you. Every story is crafted by AI to match your personality, interests, and current life situation.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <User className="w-8 h-8 text-blue-600 mb-4 mx-auto" />
          <h3 className="font-semibold mb-2">Deeply Personal</h3>
          <p className="text-gray-600 text-sm">Characters and plots tailored to your personality and experiences</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <Sparkles className="w-8 h-8 text-purple-600 mb-4 mx-auto" />
          <h3 className="font-semibold mb-2">AI-Powered</h3>
          <p className="text-gray-600 text-sm">Advanced AI creates unique, high-quality content just for you</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <Heart className="w-8 h-8 text-red-600 mb-4 mx-auto" />
          <h3 className="font-semibold mb-2">Emotionally Relevant</h3>
          <p className="text-gray-600 text-sm">Stories that resonate with your current challenges and goals</p>
        </div>
      </div>

      <button 
        onClick={() => setCurrentStep('profile')}
        className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors"
      >
        Create Your Personal Book
      </button>
    </div>
  );

  const renderProfileForm = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Tell Us About Yourself</h2>
        <p className="text-gray-600">The more we know, the more personalized your book will be</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-xl shadow-lg border space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={userProfile.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
            <select
              value={userProfile.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select age range</option>
              <option value="under-18">Under 18</option>
              <option value="18-25">18-25</option>
              <option value="26-35">26-35</option>
              <option value="36-45">36-45</option>
              <option value="46-60">46-60</option>
              <option value="over-60">Over 60</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={userProfile.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="City, State/Country"
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white p-6 rounded-xl shadow-lg border space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Book className="w-5 h-5" />
            Reading Preferences
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Genre</label>
            <select
              value={userProfile.preferredGenre}
              onChange={(e) => handleInputChange('preferredGenre', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a genre</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reading Level</label>
            <select
              value={userProfile.readingLevel}
              onChange={(e) => handleInputChange('readingLevel', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select reading level</option>
              <option value="casual">Casual - Easy, relaxing reads</option>
              <option value="intermediate">Intermediate - Moderate complexity</option>
              <option value="advanced">Advanced - Complex, literary style</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Mood</label>
            <select
              value={userProfile.currentMood}
              onChange={(e) => handleInputChange('currentMood', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

      {/* Interests */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Your Interests (Select up to 5)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {interests.map(interest => (
            <button
              key={interest}
              onClick={() => handleArrayToggle('interests', interest)}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                userProfile.interests.includes(interest)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={!userProfile.interests.includes(interest) && userProfile.interests.length >= 5}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Personality Traits */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Personality Traits (Select 3-5)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {personalityTraits.map(trait => (
            <button
              key={trait}
              onClick={() => handleArrayToggle('personalityTraits', trait)}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                userProfile.personalityTraits.includes(trait)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={!userProfile.personalityTraits.includes(trait) && userProfile.personalityTraits.length >= 5}
            >
              {trait}
            </button>
          ))}
        </div>
      </div>

      {/* Personal Challenges */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Areas of Focus (Optional - helps create relevant themes)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {personalChallenges.map(challenge => (
            <button
              key={challenge}
              onClick={() => handleArrayToggle('personalChallenges', challenge)}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                userProfile.personalChallenges.includes(challenge)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {challenge}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        {generationError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-md">
            <p className="font-medium">Generation Failed</p>
            <p className="text-sm mt-1">{generationError}</p>
            <button 
              onClick={() => setGenerationError('')}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        )}
        <button 
          onClick={generatePersonalizedBook}
          disabled={!userProfile.name || !userProfile.preferredGenre || userProfile.interests.length === 0}
          className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate My Personal Book
        </button>
      </div>
    </div>
  );

  const renderGenerating = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="animate-spin">
          <Sparkles className="w-16 h-16 text-purple-600" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-gray-900">Creating Your Personal Book</h2>
      <div className="space-y-4 max-w-lg mx-auto">
        <p className="text-gray-600">Our AI is crafting a unique story just for you...</p>
        <div className="bg-gray-200 rounded-full h-3">
          <div 
            className="bg-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{width: `${generationProgress}%`}}
          ></div>
        </div>
        <div className="text-sm text-gray-500 space-y-1">
          <p className={generationProgress > 20 ? "text-green-600" : "text-purple-600"}>
            {generationProgress > 20 ? "✓" : "→"} Analyzing your personality profile
          </p>
          <p className={generationProgress > 50 ? "text-green-600" : generationProgress > 20 ? "text-purple-600" : "text-gray-400"}>
            {generationProgress > 50 ? "✓" : generationProgress > 20 ? "→" : "•"} Incorporating interests and preferences
          </p>
          <p className={generationProgress > 80 ? "text-green-600" : generationProgress > 50 ? "text-purple-600" : "text-gray-400"}>
            {generationProgress > 80 ? "✓" : generationProgress > 50 ? "→" : "•"} Generating personalized narrative
          </p>
          <p className={generationProgress === 100 ? "text-green-600" : generationProgress > 80 ? "text-purple-600" : "text-gray-400"}>
            {generationProgress === 100 ? "✓" : generationProgress > 80 ? "→" : "•"} Finalizing chapters and themes
          </p>
        </div>
        {generationProgress === 100 && (
          <p className="text-green-600 font-medium">Almost ready! Preparing your book...</p>
        )}
      </div>
    </div>
  );

  const renderGeneratedBook = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Personal Book is Ready!</h2>
        <p className="text-gray-600">A unique story created specifically for you</p>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-2xl">
        <div className="flex items-start gap-6">
          <div className="bg-white/20 p-4 rounded-lg">
            <Book className="w-12 h-12" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{generatedBook.title}</h1>
            <p className="text-lg mb-1">by {generatedBook.author}</p>
            <p className="text-purple-200 mb-4">{generatedBook.genre}</p>
            <p className="text-lg leading-relaxed">{generatedBook.premise}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Personalized For You
          </h3>
          <ul className="space-y-2">
            {generatedBook.personalizedElements.map((element, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{element}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            Book Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Length:</span>
              <span className="font-medium">{generatedBook.estimatedLength}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reading Time:</span>
              <span className="font-medium">{generatedBook.readingTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chapters:</span>
              <span className="font-medium">{generatedBook.chapters.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-xl font-semibold mb-4">Chapter Outline</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generatedBook.chapters.map((chapter, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{chapter}</h4>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Core Themes</h3>
        <div className="flex flex-wrap gap-2">
          {generatedBook.themes.map((theme, index) => (
            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {theme}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
          <Download className="w-5 h-5" />
          Download Digital Book ($19.99)
        </button>
        <button className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-colors">
          Order Physical Copy ($39.99)
        </button>
      </div>

      <div className="text-center">
        <button 
          onClick={() => {
            setCurrentStep('profile');
            setGeneratedBook(null);
          }}
          className="text-purple-600 hover:text-purple-700 font-medium"
        >
          Create Another Book
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {currentStep === 'welcome' && renderWelcome()}
        {currentStep === 'profile' && !isGenerating && renderProfileForm()}
        {isGenerating && renderGenerating()}
        {currentStep === 'generated' && generatedBook && renderGeneratedBook()}
      </div>
    </div>
  );
};

export default InfiniteLibrary;
