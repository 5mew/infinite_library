import React, { useState, useEffect } from 'react';
import { Book, User, Logo } from 'lucide-react'; // Example icon imports
import AuthModal from './AuthModal';
import type { UserProfile, Book as BookType, Chapter } from '../utils/types';
import { useAuth } from '../hooks/useAuth';

enum Step {
Welcome = 'welcome',
Profile = 'profile',
Generating = 'generating',
Generated = 'generated',
}

const InfiniteLibrary: React.FC = () => {
const { user, requireAuth, logout } = useAuth();
const [currentStep, setCurrentStep] = useState(Step.Welcome);
const [isAuthModalOpen, setAuthModalOpen] = useState(false);
const [userProfile, setUserProfile] = useState({
name: user?.name || '',
age: user?.age || '',
interests: [],
readingLevel: 'casual',
preferredGenre: '',
personalityTraits: [],
currentMood: '',
personalChallenges: [],
});
const [genres, setGenres] = useState<string[]>(['Fantasy', 'Sci-Fi', 'Thriller', 'Romance']);
const [interestsOptions] = useState<string[]>(['Magic', 'Science', 'Mystery', 'Adventure']);
const [personalityOptions] = useState<string[]>(['Curious', 'Bold', 'Analytical', 'Empathetic']);
const [isGenerating, setIsGenerating] = useState(false);
const [generationProgress, setGenerationProgress] = useState(0);
const [generationError, setGenerationError] = useState<string | null>(null);
const [currentBook, setCurrentBook] = useState<BookType | null>(null);
const [bookContent, setBookContent] = useState<Chapter[]>([]);
const [isReading, setIsReading] = useState(false);

useEffect(() => {
let timer: NodeJS.Timeout;
if (isGenerating) {
timer = setInterval(() => {
setGenerationProgress((prev) => Math.min(prev + 10, 100));
}, 300);
}
return () => clearInterval(timer);
}, [isGenerating]);

const openAuthModal = () => setAuthModalOpen(true);
const closeAuthModal = () => setAuthModalOpen(false);

const handleStart = () => {
requireAuth(() => setCurrentStep(Step.Profile), openAuthModal);
};

const handleLogout = () => {
logout();
setCurrentStep(Step.Welcome);
setCurrentBook(null);
};

const generatePersonalizedBook = async () => {
if (!user) {
return openAuthModal();
}
setGenerationError(null);
setIsGenerating(true);
setGenerationProgress(0);
setCurrentStep(Step.Generating);
try {
const response = await fetch('/api/generateBook', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
credentials: 'include',
body: JSON.stringify(userProfile),
});
if (!response.ok) {
const errorData = await response.json();
throw new Error(errorData.message || 'Failed to generate book.');
}
const book: BookType = await response.json();
setCurrentBook(book);
setCurrentStep(Step.Generated);
} catch (err: any) {
setGenerationError(err.message);
setCurrentStep(Step.Profile);
} finally {
setIsGenerating(false);
setGenerationProgress(100);
}
};

const fetchFullBook = async () => {
if (!user || !currentBook) {
return;
}
setIsReading(true);
try {
const response = await fetch('/api/generateFullBook', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
credentials: 'include',
body: JSON.stringify({ bookSummary: currentBook, userProfile }),
});
if (!response.ok) {
throw new Error('Failed to fetch full book content.');
}
const data = await response.json();
setBookContent(data.chapters || []);
} catch (err) {
console.error(err);
}
};

const renderWelcome = () => (

Infinite Library

 Create Book

{user && (

Logout

)}

);

const renderProfileForm = () => (

Tell us about yourself

Name
<input
type="text"
value={userProfile.name}
onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
className="w-full border p-2 rounded"
/>

Age
<input
type="text"
value={userProfile.age}
onChange={(e) => setUserProfile({ ...userProfile, age: e.target.value })}
className="w-full border p-2 rounded"
/>

Interests (comma separated)
<input
type="text"
value={userProfile.interests.join(',')}
onChange={(e) =>
setUserProfile({
...userProfile,
interests: e.target.value.split(',').map((s) => s.trim()),
})
}
className="w-full border p-2 rounded"
/>

Preferred Genre
<select
value={userProfile.preferredGenre}
onChange={(e) => setUserProfile({ ...userProfile, preferredGenre: e.target.value })}
className="w-full border p-2 rounded"
>
Select a genre
{genres.map((g) => (
{g}
))}



Reading Level
<select
value={userProfile.readingLevel}
onChange={(e) => setUserProfile({ ...userProfile, readingLevel: e.target.value })}
className="w-full border p-2 rounded"
>
Casual
Intermediate
Advanced



Personality Traits (comma separated)
<input
type="text"
value={userProfile.personalityTraits.join(',')}
onChange={(e) =>
setUserProfile({
...userProfile,
personalityTraits: e.target.value.split(',').map((s) => s.trim()),
})
}
className="w-full border p-2 rounded"
/>

Current Mood
<input
type="text"
value={userProfile.currentMood}
onChange={(e) => setUserProfile({ ...userProfile, currentMood: e.target.value })}
className="w-full border p-2 rounded"
/>

Personal Challenges (comma separated)
<input
type="text"
value={userProfile.personalChallenges.join(',')}
onChange={(e) =>
setUserProfile({
...userProfile,
personalChallenges: e.target.value.split(',').map((s) => s.trim()),
})
}
className="w-full border p-2 rounded"
/>

{generationError && (
{generationError}
)}

Generate Book

<button
className="ml-4 text-gray-600"
onClick={() => setCurrentStep(Step.Welcome)}
disabled={isGenerating}
>
Back

);

const renderGenerating = () => (

Generating Your Book...

<div
className="h-2 bg-purple-600 rounded"
style={{ width: ${generationProgress}% }}
/>

{generationProgress}%

);

const renderGeneratedBook = () => (

{currentBook && (
<>
{currentBook.title}
{currentBook.author}

Genre: {currentBook.genre} – Estimated Length: {currentBook.estimatedLength}

{currentBook.premise}

Read Full Book

<button
className="bg-purple-600 text-white px-6 py-3 rounded-lg"
onClick={() => setCurrentStep(Step.Welcome)}
>
Go to Library

</>
)}

);

const renderReadingInterface = () => (

<button
className="mb-6 text-gray-600"
onClick={() => setIsReading(false)}
>
Back

{bookContent.map((chapter, idx) => (

{chapter.title}
{chapter.content}

))}

);

switch (currentStep) {
case Step.Welcome:
return renderWelcome();
case Step.Profile:
return renderProfileForm();
case Step.Generating:
return renderGenerating();
case Step.Generated:
return renderGeneratedBook();
default:
return renderWelcome();
}
};

export default InfiniteLibrary;
