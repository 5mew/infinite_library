import { v4 as uuidv4 } from 'uuid';
import { User, UserWithPassword } from './auth';

// In-memory storage (replace with real database in production)
const users: UserWithPassword[] = [];
const userBooks: Record<string, any[]> = {};

export async function createUser(email: string, name: string, hashedPassword: string): Promise<User> {
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const user: UserWithPassword = {
    id: uuidv4(),
    email,
    name,
    password: hashedPassword,
    createdAt: new Date(),
    preferences: {}
  };

  users.push(user);
  userBooks[user.id] = [];

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
  return users.find(u => u.email === email) || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const user = users.find(u => u.id === id);
  if (!user) return null;

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateUserPreferences(userId: string, preferences: any): Promise<void> {
  const user = users.find(u => u.id === userId);
  if (user) {
    user.preferences = { ...user.preferences, ...preferences };
  }
}

export async function saveUserBook(userId: string, book: any): Promise<void> {
  if (!userBooks[userId]) {
    userBooks[userId] = [];
  }
  userBooks[userId].push({
    ...book,
    id: uuidv4(),
    createdAt: new Date()
  });
}

export async function getUserBooks(userId: string): Promise<any[]> {
  return userBooks[userId] || [];
}

// Database initialization
export function initializeDatabase() {
  console.log('Database initialized (in-memory)');
  // In production, this would connect to a real database
}
