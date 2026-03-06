import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/validations/auth';

export const getAuthSession = () => getServerSession(authOptions);
