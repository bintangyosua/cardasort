import { config } from '@/config/env';
import { SessionOptions } from 'iron-session';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  access_token?: string;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profilePicture?: string;
  };
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false
};

// Deteksi environment untuk konfigurasi cookie yang tepat
const isProduction = config.NODE_ENV === 'production';
const useHTTPS = config.USE_HTTPS === 'true';
const isVPSWithHTTP = isProduction && !useHTTPS;

export const sessionOptions: SessionOptions = {
  password: config.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security_purposes',
  cookieName: 'cardasort-session',
  cookieOptions: {
    // Hanya secure jika production dan menggunakan HTTPS
    secure: isProduction && useHTTPS,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    // Sesuaikan sameSite berdasarkan environment
    sameSite: isVPSWithHTTP ? 'lax' : isProduction ? 'none' : 'lax',
    path: '/',
    // Tidak set domain untuk fleksibilitas IP address
    ...(isVPSWithHTTP && {
      domain: undefined
    })
  }
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function createSession(email: string) {
  const session = await getSession();
  session.isLoggedIn = true;
  session.user = {
    id: 1,
    email,
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  };
  await session.save();
}

export async function destroySession() {
  const session = await getSession();
  session.destroy();
}
