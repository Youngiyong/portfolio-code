import * as jwt from 'jsonwebtoken';
import { DeplMsgResponse } from './response';

export function setTokenCookie(
    tokens: { accessToken: string; refreshToken: string }
  ) {
    var date = new Date();
    date.setTime(date.getTime() + (10*60*60*1000));
    var access_token_expires = "; expires=" + date.toUTCString();
    var access_token = "access_token" + "=" + (tokens.accessToken || "")  + access_token_expires + "; path=/;";

    date.setTime(date.getTime() + (29*24*60*60*1000));
    var refresh_token_expires = "; expires=" + date.toUTCString();
    var refresh_token = "refresh_token" + "=" + (tokens.refreshToken || "")  + refresh_token_expires + "; path=/;";
    
    return { "access_token" : access_token, "refresh_token": refresh_token }

  }

export const verifyRefreshToken = (token: string) => {
  return new Promise(
    (resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
            if(error) reject(error);
            resolve(decoded);
        });
    }
  );
}
export const generateAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY as string, {
    subject: 'access_token',
    expiresIn: '180m',
  });
};

export const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY as string, {
    subject: 'refresh_token',
    expiresIn: '29d',
  });
};

export const splitByDelimiter = (data: string, delim: string) => {
  const pos = data ? data.indexOf(delim) : -1;
  return pos > 0 ? [data.substr(0, pos), data.substr(pos + 1)] : ['', ''];
};

export const decodeBase64 = (input: string) =>
  Buffer.from(input, 'base64').toString('utf8');


export const verifyAccessToken = (event: string) => {
  const [type, token] = splitByDelimiter(event.multiValueHeaders.Authorization[0], ' ');
  const user = jwt.verify(token, process.env.JWT_SECRET_KEY as string);

  return user.sub==="access_token" ? user.id : undefined
}