import { getGoogleAccessToken, getGoogleProfile } from '../lib/social/google';
import { getSocialAccount } from '../model/user';
import { SocialProvider, socialRedirectLink } from '../lib/social';
import { getGithubAccessToken, getGithubProfile } from '../lib/social/github';
import {
  getFacebookAccessToken,
  getFacebookProfile,
} from '../lib/social/facebook';
import { getKakaoAccessToken, getKakaoProfile } from '../lib/social/kakao';
import { APIGatewayPostRequest, APIGatewayProxyResponse } from './type';
import { setTokenCookie, verifyRefreshToken } from '../lib/token';
import { getConnection, getRepository } from 'typeorm';
import Database from '../database';
import User from '../entity/User';

export async function githubLoginEvent(event: any) {
  // 로그인 성공한 토큰 코드를 얻어온다

  const code = event.queryStringParameters.code;
  if (!code) {
    return;
  }
  console.log(code)
  try {
    // 깃허브 엑세스 토큰을 얻어온다.
    const accessToken = await getGithubAccessToken({
      code,
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    });
    const profile = await getGithubProfile(accessToken);
    const socialAccount = await getSocialAccount({
      social_id: profile.id,
      provider: 'github',
      name: profile.login,
      email: profile.email
    });
    return socialAccount;
  } catch (e) {
    throw new Error("githubLoginError:"+ e)
  }
}

export async function googleLoginEvent(event: any) {
  // 로그인 성공한 토큰 코드를 얻어온다
  const code = event.queryStringParameters.code;
  console.log("code", code)
  if (!code) {
    return;
  }

  try {
    // 구글 엑세스 토큰을 얻어온다.
    const accessToken = await getGoogleAccessToken({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_REDIRECT_PATH!,
    });
    console.log("accessToken", accessToken)
    // 엑세스 토큰을 가지고 프로필 정보를 얻어온다.
    const profile = await getGoogleProfile(accessToken);
    console.log("profile", profile)
    // 기존 가입된 소셜정보가 있는지 확인한다. return user_id, jwt access token, refresh token return
    const socialAccount = await getSocialAccount({
      name: profile.names![0].displayName || 'emptyname',
      social_id: profile.names[0].metadata.source.id,
      provider: 'google',
      email: profile.emailAddresses![0].value 
    });
    console.log(socialAccount)
    return socialAccount;
  } catch (e) {
    throw new Error("googleLoginError:"+ e)
  }
}

export async function facebookLoginEvent(event: any) {
  // 로그인 성공한 토큰 코드를 얻어온다
  const code = event.queryStringParameters.code;
  if (!code) {
    return;
  }
  console.log('facebook Login!');

  try {
    // Access Token
    const accessToken = await getFacebookAccessToken({
      code,
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      redirectUri: process.env.FACEBOOK_REDIRECT_PATH!,
    });

    // Get Profile
    const profile = await getFacebookProfile(accessToken);

    // Get Social
    return await getSocialAccount({
      social_id: profile.uid,
      name: profile.name,
      provider: 'facebook',
      email: profile.email
    });
  } catch (e) {
    throw new Error("facebookLoginError:"+ e)
  }
}

async function kakaoLoginEvent(event: any) {
  // 로그인 성공한 토큰 코드를 얻어온다
  const code = event.queryStringParameters.code;
  if (!code) {
    return;
  }

  try {
    // Access Token
    const accessToken = await getKakaoAccessToken({
      code,
      clientId: process.env.KAKAO_CLIENT_ID!,
      redirectUri: process.env.KAKAO_REDIRECT_PATH!,
    });

    // Get Profile
    const profile = await getKakaoProfile(accessToken);

    // Get Social
    return await getSocialAccount({
      social_id: profile.id,
      name: profile.kakao_account.profile.nickname,
      provider: 'kakao',
      email: profile.kakao_account.email
    });
  } catch (e) {
    throw new Error("kakaoLoginError:"+ e)
  }
}

export async function callbackAuthEvent(event: any, provider: SocialProvider) {
  console.log("provider")
  switch (provider) {
    case 'google':
      return await googleLoginEvent(event);
    case 'github':
      return await githubLoginEvent(event);
    case 'facebook':
      return await facebookLoginEvent(event);
    case 'kakao':
      return await kakaoLoginEvent(event);
  }
}

export async function refreshTokenAuthEvent(event: APIGatewayPostRequest) {
  console.log(event.body)
  //token post body
  const data = JSON.parse(event.body)
  
  try{

    //refresh_token verify check
    let token = await verifyRefreshToken(data.refresh_token)

    const connection = new Database();
    await connection.getConnection();

    //refresh_token에 있는 id값으로 유저 정보를 얻어온다.
    const user = await getRepository(User)
                      .createQueryBuilder('user')
                      .innerJoinAndSelect('user.profile', 'profile')
                      .where('user.id = :id', { id: token.id })
                      .getOne();

    if(!user)
      throw new Error("User is not exist")
 
    //access_token, refresh_token 쿠키에 저장한다.
    const tokens = await user.generateUserToken();
    const cookies = setTokenCookie(tokens)
    console.log(cookies.access_token)

    const response: APIGatewayProxyResponse = {
          statusCode: 200,
          // cookies: [ cookies.access_token, cookies.refresh_token ],
          headers: {
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
            'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
          },
          multiValueHeaders: {
            'Set-Cookie': [ cookies.access_token, cookies.refresh_token ] 
          },
          body: JSON.stringify({ 
            data : {
              id: user.id,
              email: user.email,
              username: user.username,
              profile: {
                  id: user.profile.id,
                  name: user.profile.name,
                  thumbnail: user.profile.thumbnail
              }
            }
          })
      }
      
      console.log(response)
      return response;
    } catch (err) {
      throw new Error("Invalid Error:"+ err)
    }
}