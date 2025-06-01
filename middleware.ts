import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';



export async function middleware(req: NextRequest) {
const token = req.cookies.get('auth-token')?.value;
if (!token) {
return new NextResponse(
JSON.stringify({ message: 'Unauthorized' }),
{ status: 401, headers: { 'Content-Type': 'application/json' } }
);
}
try {
const decoded = verify(token, process.env.JWT_SECRET!);
req.headers.set('x-user-id', (decoded as { userId: string }).userId);
req.headers.set('x-user-email', (decoded as { email: string }).email);
return NextResponse.next();
} catch (error) {
return new NextResponse(
JSON.stringify({ message: 'Invalid token' }),
{ status: 401, headers: { 'Content-Type': 'application/json' } }
);
}
}

export const config = {
matcher: ['/api/generateBook', '/api/generateFullBook'],
};

// pages/api/generateBook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { generateEnhancedBook } from '../../utils/bookGenerator';
import { findUserById, saveUserBook } from '../../utils/userLibrary';
import type { UserProfile, Book } from '../../utils/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
if (req.method !== 'POST') {
res.setHeader('Allow', 'POST');
return res.status(405).json({ message: 'Method Not Allowed' });
}

const userId = req.headers['x-user-id'] as string;
if (!userId) {
return res.status(401).json({ message: 'Unauthorized' });
}

const {
name,
age,
interests,
readingLevel,
preferredGenre,
personalityTraits,
currentMood,
personalChallenges,
} = req.body as UserProfile;

if (!name || !preferredGenre || (interests && interests.length === 0)) {
return res
.status(400)
.json({ message: 'Name, preferred genre, and at least one interest are required.' });
}

const user = await findUserById(userId);
if (!user) {
return res.status(401).json({ message: 'Unauthorized' });
}

try {
const book = await generateEnhancedBook(req.body as UserProfile);
await saveUserBook(userId, book as Book);
return res.status(200).json(book);
} catch (error: any) {
return res.status(500).json({ message: error.message || 'Error generating book.' });
}
}
