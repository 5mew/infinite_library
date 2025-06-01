import { NextApiRequest, NextApiResponse } from 'next';
import { createUser } from '../../../lib/db';
import { hashPassword, signToken, validateEmail, validatePassword } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await createUser(email, name, hashedPassword);

    // Create JWT token
    const token = signToken({ userId: user.id, email: user.email });

    // Set cookie
    res.setHeader('Set-Cookie', `auth-token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`);

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.message === 'User already exists') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    return res.status(500).json({ error: 'Registration failed' });
  }
}
