import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Extend NextAuth v5 types inline
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      mfaPending?: boolean;
    };
  }
}

// NextAuth v5 beta: JWT fields are typed via the Session augmentation above.
// The JWT object itself is internal to v5 — we propagate custom fields through
// the jwt/session callbacks rather than augmenting the JWT interface directly.

const db = getDb();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db) as ReturnType<typeof DrizzleAdapter>,
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours — stolen tokens expire rather than living forever
  },
  pages: {
    signIn: '/sign-in',
    signOut: '/sign-out',
    error: '/auth/error',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.hashedPassword);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          // Signal to the JWT callback that MFA challenge is required.
          // OAuth users (Google) skip MFA — they authenticated via Google's own 2FA.
          mfaEnabled: user.mfaEnabled === true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // mfaPending = true until the /auth/mfa-verify challenge is passed
        token.mfaPending = (user as unknown as Record<string, unknown>).mfaEnabled === true;
        // Stamp token issuance time on fresh sign-in
        token.tokenIat = Math.floor(Date.now() / 1000);
      }

      // Rotate token timestamp every hour so clients must re-verify.
      // Using tokenIat (not iat) because NextAuth v5 manages the iat JWT field internally.
      const tokenAge = Math.floor(Date.now() / 1000) - ((token.tokenIat as number) ?? 0);
      if (tokenAge > 3600) {
        token.tokenIat = Math.floor(Date.now() / 1000);
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).mfaPending = token.mfaPending ?? false;
      }
      return session;
    },
  },
});
