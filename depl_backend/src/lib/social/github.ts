import axios from 'axios';
import { Octokit } from '@octokit/rest';

export const GithubRedirectUrl = 
    `https://github.com/login/oauth/authorize?scope=user:email&client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_PATH}`;
 

type GetGithubAccessTokenParams = {
  code: string;
  clientId: string;
  clientSecret: string;
};
type GithubOAuthResult = {
  access_token: string;
  token_type: string;
  scope: string;
};

export async function getGithubAccessToken({
  code,
  clientId,
  clientSecret
}: GetGithubAccessTokenParams) {
  const response = await axios.post<GithubOAuthResult>(
    'https://github.com/login/oauth/access_token',
    {
      code,
      client_id: clientId,
      client_secret: clientSecret
    },
    {
      headers: {
        accept: 'application/json'
      }
    }
  );
  return response.data.access_token;
}

export async function getGithubProfile(accessToken: string) {
  const octokit = new Octokit({
    auth: `Bearer ${accessToken}`
  });
  const { data } = await octokit.users.getAuthenticated();
  console.log("github data", data)
  return data;
}
