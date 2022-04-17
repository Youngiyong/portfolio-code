import { Context, Callback, Handler } from 'aws-lambda';
import { DeplMsgResponse } from '../../../lib/response';
import { verifyAccessToken } from '../../../lib/token';
import { updateProfileThumnail, updateProfile } from '../../../model/user';

/**
 *  프로필 이미지 삭제
 */
export const deleteProfileImage: Handler = async (event: any, context: Context, callback: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const uploadPath = null;
  const user_id = verifyAccessToken(event);
  return user_id ? await updateProfileThumnail(user_id, uploadPath) : DeplMsgResponse(400, 'Invalid Access token Request');
};


/**
 *  프로필 수정
 */
export const putProfile: Handler = async (event: any, context: Context, callback: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const body = event.body
  const user_id = verifyAccessToken(event);
  return user_id ? await updateProfile(user_id, body) : DeplMsgResponse(400, 'Invalid Access token Request');
};

