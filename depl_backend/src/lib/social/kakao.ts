import axios from 'axios';
import * as qs from 'querystring';

export const KakaoRedirectUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_PATH}`;

type GetKaKaoAccessTokenParams = {
  clientId: string;
  code: string;
  redirectUri: string;
};

type KakaoTokenResult = {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
};

type KakaoProfile = {
  id: number;
  kakao_account: {
    profile_needs_agreement: boolean;
    profile: {
      nickname: string;
      thumbnail_image_url: string;
      profile_image_url: string;
    };
    email: string;
  };
};

export async function getKakaoAccessToken({
  clientId,
  code,
  redirectUri,
}: GetKaKaoAccessTokenParams) {
  const response = await axios.post<KakaoTokenResult>(
    `https://kauth.kakao.com/oauth/token`,
    qs.stringify({
      code,
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}

export async function getKakaoProfile(token: string) {
  const response = await axios.get<KakaoProfile>(
    'https://kapi.kakao.com/v2/user/me',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const kakaoProfile = response.data;
  console.log(kakaoProfile);
  return kakaoProfile;
}
