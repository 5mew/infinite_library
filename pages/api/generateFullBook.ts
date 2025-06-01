import { NextApiRequest, NextApiResponse } from 'next';
import { generateFullBookContent } from '../../utils/bookGenerator';
import { findUserById } from '../../utils/userLibrary';
import type { UserProfile, Book, Chapter } from '../../utils/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
if (req.method !== 'POST') {
res.setHeader('Allow', 'POST');
return res.status(405).json({ message: 'Method Not Allowed' });
}

const userId = req.headers['x-user-id'] as string;
if (!userId) {
return res.status(401).json({ message: 'Unauthorized' });
}

const user = await findUserById(userId);
if (!user) {
return res.status(401).json({ message: 'Unauthorized' });
}

const { bookSummary, userProfile } = req.body as {
bookSummary: Partial;
userProfile: UserProfile;
};

if (!bookSummary || !userProfile) {
return res.status(400).json({ message: 'Book summary and user profile are required.' });
}

try {
const chapters: Chapter[] = await generateFullBookContent(bookSummary, userProfile);
return res.status(200).json({ chapters });
} catch (error: any) {
return res.status(500).json({ message: error.message || 'Error generating full book.' });
}
}
