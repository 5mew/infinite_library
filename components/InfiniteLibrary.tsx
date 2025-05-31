// Add these new state variables at the top with other useState declarations:
const [isReading, setIsReading] = useState<boolean>(false);
const [currentChapter, setCurrentChapter] = useState<number>(0);
const [bookContent, setBookContent] = useState<any>(null);

// Replace the renderGeneratedBook function:
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
                  
                  <button 
                    onClick={() => {
                      setIsReading(true);
                      setCurrentChapter(0);
                      generateFullBook();
                    }}
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white font-semibold text-xl px-12 py-5 rounded-2xl hover-lift transition-all duration-300 focus-ring"
                  >
                    <span className="relative z-10 flex items-center space-x-3">
                      <BookOpen className="w-6 h-6" />
                      <span>Start Reading Now</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
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

// Add this new function to generate full book content:
const generateFullBook = async () => {
  try {
    setBookContent({ loading: true });
    
    const res = await fetch('/api/generateFullBook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        bookSummary: generatedBook,
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
    // Create fallback content if API fails
    setBookContent(createFallbackContent());
  }
};

// Add fallback content creator:
const createFallbackContent = () => {
  return {
    chapters: generatedBook?.chapters.map((title, index) => ({
      title,
      content: `This is the beginning of ${title}. In this chapter, our story unfolds as ${userProfile.name} embarks on a journey that reflects their love of ${userProfile.interests.slice(0, 2).join(' and ')}. 

The narrative weaves together elements that speak to their ${userProfile.personalityTraits.slice(0, 2).join(' and ')} nature, creating a story that feels both familiar and wonderfully new.

As the chapter progresses, themes of ${generatedBook?.themes.slice(0, 2).join(' and ')} become apparent, setting the stage for the adventures to come.

This personalized tale continues to unfold, drawing from the rich tapestry of ${userProfile.name}'s unique perspective and experiences...

[This is a preview of your personalized book. The full AI-generated content would continue here with rich, detailed storytelling tailored specifically to your profile and preferences.]`
    })) || []
  };
};

// Add the reading interface function:
const renderReadingInterface = () => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 paper-texture">
    {/* Reading Header */}
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsReading(false)}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            <span>Back to Overview</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <span className="font-serif text-sm text-gray-600">
              Chapter {currentChapter + 1} of {bookContent?.chapters?.length || generatedBook?.chapters.length}
            </span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentChapter + 1) / (bookContent?.chapters?.length || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Reading Content */}
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Book Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {generatedBook?.title}
          </h1>
          <p className="font-serif text-xl text-gray-600">by {generatedBook?.author}</p>
        </div>

        {/* Chapter Content */}
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
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-8 chapter-title">
                {bookContent?.chapters?.[currentChapter]?.title || generatedBook?.chapters[currentChapter]}
              </h2>
              
              <div className="font-serif text-lg leading-relaxed text-gray-800 chapter-text">
                {bookContent?.chapters?.[currentChapter]?.content ? 
                  bookContent.chapters[currentChapter].content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-6">{paragraph}</p>
                  )) : 
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Generating chapter content...</p>
                    <div className="animate-pulse h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="animate-pulse h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                }
              </div>
            </>
          )}
        </div>

        {/* Chapter Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
            disabled={currentChapter === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            <span className="font-medium">Previous Chapter</span>
          </button>

          <div className="flex space-x-2">
            {generatedBook?.chapters.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentChapter(index)}
                className={`w-10 h-10 rounded-full font-medium transition-all ${
                  index === currentChapter
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-purple-100'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentChapter(Math.min((generatedBook?.chapters.length || 1) - 1, currentChapter + 1))}
            disabled={currentChapter >= (generatedBook?.chapters.length || 1) - 1}
            className="flex items-center space-x-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-medium">Next Chapter</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Update the main return statement to include reading interface:
return (
  <div className="min-h-screen">
    {isReading ? renderReadingInterface() : (
      <>
        {currentStep === 'welcome' && renderWelcome()}
        {currentStep === 'profile' && !isGenerating && renderProfileForm()}
        {isGenerating && renderGenerating()}
        {currentStep === 'generated' && generatedBook && renderGeneratedBook()}
      </>
    )}
  </div>
);
