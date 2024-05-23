import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

interface ExtendedJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
}

async function refreshAccessToken(token: ExtendedJWT): Promise<ExtendedJWT> {
  try {
    console.log('Refreshing access token');
    const url = 'https://oauth2.googleapis.com/token';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams([
        ['client_id', process.env.GOOGLE_CLIENT_ID ?? ''],
        ['client_secret', process.env.GOOGLE_CLIENT_SECRET ?? ''],
        ['refresh_token', token.refreshToken!],
        ['grant_type', 'refresh_token']
      ])
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw new Error(refreshedTokens.error);
    }

    console.log('Refreshed Tokens:', refreshedTokens);

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken
    };
  } catch (error) {
    console.error('RefreshAccessTokenError:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError'
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          scope: [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      const extendedToken = token as ExtendedJWT;

      if (account) {
        extendedToken.accessToken = account.access_token;
        extendedToken.refreshToken = account.refresh_token;
        extendedToken.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;
      }

      if (extendedToken.accessTokenExpires && Date.now() < extendedToken.accessTokenExpires) {
        return extendedToken;
      }

      return await refreshAccessToken(extendedToken);
    },
    async session({ session, token }) {
      console.log('Session callback - Token:', token);
      const extendedToken = token as ExtendedJWT;
      session.accessToken = extendedToken.accessToken;
      return session;
    }
  },
  secret: process.env.SECRET,
  debug: true
};

export default NextAuth(authOptions);
