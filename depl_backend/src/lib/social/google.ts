import { google, people_v1 } from 'googleapis';
import People = people_v1.People;

type GetGoogleAccessTokenParams = {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
};

const oauth2Client = new google.auth.OAuth2(
     process.env.GOOGLE_CLIENT_ID,
     process.env.GOOGLE_CLIENT_SECRET,
     process.env.GOOGLE_REDIRECT_PATH
);

export const GoogleRedirectUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['email', 'profile'],
});

export async function getGoogleProfile(
  accessToken: string
): Promise<people_v1.Schema$Person> {
  const people = google.people('v1');
  const profile = await people.people.get({
    access_token: accessToken,
    resourceName: 'people/me',
    personFields: 'names,emailAddresses,photos',
  });
  const { data } = profile;

  return data;
}

export async function getGoogleAccessToken({
  clientId,
  clientSecret,
  code,
  redirectUri,
}: GetGoogleAccessTokenParams) {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
  console.log(oauth2Client)
  const { tokens } = await oauth2Client.getToken(code);
  console.log(tokens)
  if (!tokens.access_token)
    throw new Error('Failed to retrieve google access token');
  return tokens.access_token;
}
