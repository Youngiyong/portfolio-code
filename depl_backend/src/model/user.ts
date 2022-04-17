import { getConnection, getRepository } from 'typeorm';
import Database from '../database';
import { APIGatewayProxyMsgResponse, requestPostUser } from './type';
import { SocialProvider } from '../lib/social';
import User from '../entity/User';
import UserProfile from '../entity/UserProfile';
import SocialAccount from '../entity/SocialAccount';
import { generateAccessToken, setTokenCookie } from '../lib/token';
import { APIGatewayProxyResponse } from "../model/type"
import {  DeplResponse, DeplMsgResponse } from "../lib/response" 
import {  decryptPassword, hashPassword } from '../lib/hash';
import { createEmailCode, findCodeByEmail } from './email';

export async function logoutBrowny() {
  const cookies = {
    access_token : "",
    refresh_token : ""
  }

  const response: APIGatewayProxyMsgResponse = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*', // Required for CORS support to work
          'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
        },
        multiValueHeaders: {
          'Set-Cookie': [ cookies.access_token, cookies.refresh_token ] 
        },
        msg: JSON.stringify("Cookie Clear Success")
  }

  return response
  
}

export async function changePassword(event: any){
  const connection = new Database();
  await connection.getConnection();
  const body = JSON.parse(event.body);

  if(body.password !== body.repeat_password){
    return DeplMsgResponse(400, "비밀번호가 같지 않습니다. 다시 확인해주세요.")
  }

  const userRepo = await getRepository(User)
  const user = await userRepo.findOne({
    where: {
      email: body.email,
    },
  });

  if(!user){
    return DeplMsgResponse(404, "존재하지 않는 사용자입니다.")
  }

  user.password = hashPassword(body.password)
  user.updated_at = new Date();
  await userRepo.save(user)

  return DeplMsgResponse(200, "OK")
}

export async function loginBrowny(event: any) {
  const connection = new Database();
  await connection.getConnection();
  const body = JSON.parse(event.body);
  const user = await getRepository(User)
              .createQueryBuilder('user')
              .addSelect("user.password")
              .innerJoinAndSelect('user.profile', 'profile')
              .where('user.email = :email', { email: body.email })
              .getOne();
              
  const decryptPasswd = decryptPassword(user.password, body.password)
  if(!decryptPasswd) return DeplMsgResponse(400, "비밀번호가 일치하지 않습니다.")
  console.log(user)
  const tokens = await user.generateUserToken();
  const cookies = setTokenCookie(tokens)
  const response: APIGatewayProxyResponse = {
        statusCode: 200,
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
    return response
}





export async function joinMemberShipAfterEmailAuth(payload: any, user_temp: any){
    const connection = new Database();
    await connection.getConnection();
    const queryRunner = await getConnection().createQueryRunner();
    await queryRunner.startTransaction();

  try{

    const is_user = await getRepository(User)
                    .createQueryBuilder('user')
                    .where('user.email = :email', { email: payload.email })
                    .getOne();

    if(is_user){
        return DeplMsgResponse(400, "이미 존재하는 사용자라 회원가입 진행이 불가합니다.")
    }
    
      const user = new User();
      user.email = user_temp.email
      user.password = hashPassword(user_temp.password)
      user.is_certified = true
      const userRepo = getRepository(User);

      const userProfileRepo= getRepository(UserProfile);
      await userRepo.save(user);

      const userprofile = new UserProfile();
      userprofile.fk_user_id = user.id
      await userProfileRepo.save(userprofile)

      return DeplResponse(200, "OK")

  } catch (e) {
    throw new Error("Invalid Request Error:"+ e)
  }
}

export async function joinMemberShipBeforeEmailAuth(event: any) {
  const connection = new Database();
  await connection.getConnection();
  const userRepo = getRepository(User);
  const body = JSON.parse(event.body)
  
  if(body.password !== body.repeat_password){
    return DeplMsgResponse(400, "비밀번호가 같지 않습니다. 다시 확인해주세요.")
  }

  const user = await userRepo.findOne({
    where: {
      email: body.email,
    },
  });
  
  if(user){
    return DeplMsgResponse(400, "이메일이 이미 존재합니다. 비밀번호 찾기로 확인해보세요!")
  }

  return await createEmailCode(body)
}

export async function createSocialAccount(params: {
  social_id: number | string;
  provider: SocialProvider;
  name: string;
  email: string;
}) {
  const connection = new Database();
  await connection.getConnection();

  const queryRunner = await getConnection().createQueryRunner();
  await queryRunner.startTransaction();
  try {
    console.log("params", params)
    const userRepository = getRepository(User);
    const user = new User();
    user.email = params.email;
    user.username = params.name;
    await userRepository.save(user);

    const userProfileRepository = getRepository(UserProfile);
    const userprofile = new UserProfile();

    userprofile.fk_user_id = user.id;
    userprofile.name = params.name;
    await userProfileRepository.save(userprofile);

    const socialAccountRepository = getRepository(SocialAccount);
    const socialAccount = new SocialAccount();
    socialAccount.provider = params.provider;
    socialAccount.social_id = params.social_id.toString();
    socialAccount.fk_user_id = user.id;
    socialAccount.access_token = generateAccessToken(user.id);

    await socialAccountRepository.save(socialAccount);
    await queryRunner.commitTransaction();


    const res = await getRepository(User)
                .createQueryBuilder('user')
                .innerJoinAndSelect('user.profile', 'profile')
                .where('user.id = :id', { id: user.id })
                .getOne();

    const tokens = await user.generateUserToken();
    const cookies = setTokenCookie(tokens)
    const response: APIGatewayProxyResponse = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*', // Required for CORS support to work
          'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
        },
        multiValueHeaders: {
          'Set-Cookie': [ cookies.access_token, cookies.refresh_token ] 
        },
        body: JSON.stringify({
          data : {
            id: res.id,
            email: res.email,
            username: res.username,
            profile: {
                id: res.profile.id,
                name: res.profile.name,
                thumbnail: res.profile.thumbnail
            }
          }
        })
    }
    console.log(response)
    return response
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw new Error("Invalid Error Message:"+ err)
  } finally {
    await queryRunner.release();
  }
}

export async function getSocialAccount(params: {
  social_id: number | string;
  provider: SocialProvider;
  name: string;
  email: string;
}) {
  const connection = new Database();
  await connection.getConnection();
  const socialAccountRepo = getRepository(SocialAccount);
  const socialAccount = await socialAccountRepo.findOne({
    where: {
      social_id: params.social_id.toString(),
      provider: params.provider,
    },
  });

  if (!socialAccount) {
    return await createSocialAccount(params);
  }

  const user = await getRepository(User)
                    .createQueryBuilder('user')
                    .innerJoinAndSelect('user.profile', 'profile')
                    .where('user.id = :id', { id: socialAccount.fk_user_id })
                    .getOne();

  if(!user){
    throw new Error("user_id is not exist User Table")
  }

  // TODO 여기서의 user 가 반드시 존재한다면, user!. 로 변경 요망! 이후 ts-ignore 제거
  // @ts-ignore
  const tokens = await user.generateUserToken();
  const cookies = setTokenCookie(tokens)
  console.log(cookies.access_token)
  const response: APIGatewayProxyResponse = {
      statusCode: 200,
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

  return response
}

export async function updateProfile(user_id: string, body: any){
  const connection = new Database();
  await connection.getConnection();
  
  const userRepo = getRepository(UserProfile);
  const userProfile = await userRepo.findOne({
    where: {
      fk_user_id: user_id
    },
  })
  if(userProfile){
    for (const [key, value] of Object.entries(JSON.parse(body))) {
      userProfile[key] = value;
    }
    userProfile.updated_at = new Date();
    await userRepo.save(userProfile)

    return DeplResponse(200, userProfile)
  } else {
    throw new Error("user is not exist")
  }
}

export async function updateProfileThumnail(user_id: string, uploadPath: string| null){
  const connection = new Database();
  await connection.getConnection();
  
  const userRepo = getRepository(UserProfile);
  console.log(user_id, uploadPath)
  const userProfile = await userRepo.findOne({
    where: {
      fk_user_id: user_id
    },
  })
  
  if(userProfile){
    userProfile.thumbnail = uploadPath
    userProfile.updated_at = new Date();
    await userRepo.save(userProfile);
    return DeplResponse(200, userProfile)
  } else {
    throw new Error("user is not exist")
  }
}

//수정 필요
export async function createUser(payload: requestPostUser) {
  const connection = new Database();
  await connection.getConnection();

  const queryRunner = await getConnection().createQueryRunner();
  await queryRunner.startTransaction();
  try {
    const userRepository = getRepository(User);
    const user = new User();
    user.email = payload.body.email;
    user.username = payload.body.username;
    await userRepository.save(user);

    const userProfileRepository = getRepository(UserProfile);
    const userprofile = new UserProfile();

    userprofile.fk_user_id = user.id;
    await userProfileRepository.save(userprofile);
    await queryRunner.commitTransaction();

    return user;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw new Error("Invalid Error Message:"+ err)
  } finally {
    await queryRunner.release();
  }
}
