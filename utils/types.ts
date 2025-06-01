export interface UserProfile {
  name: string;
  age: number;             // Changed from string to number to match usage
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

export interface Book {
  id: string;
  title: string;
  author: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
}
