import { GoogleRedirectUrl } from './google';
import { GithubRedirectUrl } from './github';
import { FacebookRedirectUrl } from './facebook';
import { KakaoRedirectUrl } from './kakao';
import { APIGatewayProxyResponse } from '../../model/type';
export type SocialProvider = 'facebook' | 'github' | 'google' | 'kakao';

export const socialRedirectLink = {
  google: GoogleRedirectUrl,
  github: GithubRedirectUrl,
  facebook: FacebookRedirectUrl,
  kakao: KakaoRedirectUrl,
};

export function generateSocialLoginLink(provider: SocialProvider) {
  for (const [key, value] of Object.entries(socialRedirectLink)) {
      console.log(key, value)
    if (key === provider) {
        const response: APIGatewayProxyResponse = {
            statusCode: 200,
            body: JSON.stringify({
                data: {
                    link: value
                }
            })
        }
        return response
    }
  }
}
