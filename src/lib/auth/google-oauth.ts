// lib/auth/google-oauth.ts
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_CALLBACK_URL!;

export function getGoogleAuthUrl(state?: string): string {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  
  const options = {
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: state || '',
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}
