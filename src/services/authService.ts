import { authClient, signIn } from '@/lib/auth-client';
import { User } from '../types';

// Mock User Data for Preview Mode
const MOCK_USER: User = {
  id: 'user_123456',
  name: 'Demo User',
  email: 'demo@snippetvault.com',
  image: 'https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff'
};

export const login = async (provider: 'google' | 'github'): Promise<User> => {
  await signIn.social({ provider });
  return MOCK_USER;
};

export const logout = async (): Promise<void> => {
  await authClient.signOut();
};