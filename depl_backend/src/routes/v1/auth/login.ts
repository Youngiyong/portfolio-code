import { Context, Callback, Handler } from 'aws-lambda';
import { emailCodeAuth, updateEmailCode, createEmailCode, changePasswordCreateEmailCode } from '../../../model/email';
import { joinMemberShipBeforeEmailAuth, loginBrowny, logoutBrowny, changePassword } from '../../../model/user'


/**
 *  회원가입 진행 -> 이메일 중복 여부 및 패스워드 검사 -> 인증코드 발급
 */
export const joinMemberShip: Handler = async (event: any, context: Context, callback: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return await joinMemberShipBeforeEmailAuth(event)
};

/**
 *  회원가입시 이메일 인증 여부 확인
 */
export const sendEmailAuth: Handler = async (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await emailCodeAuth(event)
};

/*
*  회원가입시 이메일 인증코드 재 요청
*/
export const updateSendEmailAuth: Handler = async (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await updateEmailCode(event)
}

/**
 *  이메일 인증 후 비밀번호 변경 
 */
export const changePasswdByEmail: Handler = async (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await changePassword(event)
};

/**
 *  비밀번호 변경 이메일 인증 코드 발송
 */
 export const changePasswordSendEmail: Handler = async (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await changePasswordCreateEmailCode(event)
};


/**
 *  로그인
 */
export const loginByEmailAndPassword: Handler = async (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await loginBrowny(event)
};


/**
 *  로그아웃
 */
export const logout: Handler = async (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await logoutBrowny()
};


