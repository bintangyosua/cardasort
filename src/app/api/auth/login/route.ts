import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate credentials from environment variables
    const validEmail = process.env.EMAIL;
    const validPassword = process.env.PASSWORD;

    if (!validEmail || !validPassword) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (email === validEmail && password === validPassword) {
      // Create session
      await createSession(email);

      return NextResponse.json({
        success: true,
        message: 'Login successful'
      });
    }

    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
