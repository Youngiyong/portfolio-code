
import { Context, Callback, Handler } from 'aws-lambda';
import { DeplMsgResponse } from '../../../lib/response';
import { verifyAccessToken } from '../../../lib/token';
import { createUserFollow, deleteUserFollow, getUserFollows, getUserFollowers } from '../../../model/userfollow';

/**
 *  유저 팔로우 추가
 */
export const postUserFollowAPI: Handler = async (event: any, context: Context, callback: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const user_id =  verifyAccessToken(event);
  return user_id ? await createUserFollow(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};

/**
 *  팔로우 삭제
 */
 export const deleteUserFollowAPI: Handler = async (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    return user_id ? await deleteUserFollow(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};

/**
 *  팔로우 목록
 */
export const getUserFollowsAPI: Handler = async (event: any, context: Context, callback: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return await getUserFollows(event)
};


/**
 *  팔로워 목록
 */
 export const getUserFollowersAPI: Handler = async (event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await getUserFollowers(event);
  };
