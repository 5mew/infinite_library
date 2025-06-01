import { NextApiRequest, NextApiResponse } from 'next';
import { findUserById } from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.cookies['auth-token'];
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });

  } catch (error: any) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}
