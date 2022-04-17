import axios from 'axios';
import qs from 'qs';

export const FacebookRedirectUrl = `https://www.facebook.com/v4.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_PATH}&scope=email,public_profile`;

type GetFacebookAccessTokenParams = {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
};

type FacebookTokenResult = {
  access_token: string;
  token_type: string;
  expires_in: string;
};

export interface FacebookProfile {
  id: string;
  name: string;
  email: string | null;
  picture: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
}

export async function getFacebookAccessToken({
  clientId,
  clientSecret,
  code,
  redirectUri,
}: GetFacebookAccessTokenParams) {
  const query = qs.stringify({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const response = await axios.get<FacebookTokenResult>(
    `https://graph.facebook.com/v4.0/oauth/access_token?${query}`
  );

  return response.data.access_token;
}

export async function getFacebookProfile(token: string) {
  const response = await axios.get<FacebookProfile>(
    'https://graph.facebook.com/v4.0/me?fields=id,name,email,picture',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const facebookProfile = response.data;
  return {
    uid: facebookProfile.id,
    name: facebookProfile.name,
    username: '',
    email: facebookProfile.email,
    thumbnail: facebookProfile.picture.data.url,
  };
}
