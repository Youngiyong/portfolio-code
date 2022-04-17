import { Callback, Context, Handler } from 'aws-lambda';
import { DeplMsgResponse } from '../../../lib/response';
import { verifyAccessToken } from '../../../lib/token';
import { getPost, findAllPost, deletePostComment, writePostComment, writePost, deletePost, updatePost, writePostLike, deletePostLike, putPostComment } from '../../../model/post';

export const getPostHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await getPost(event)
};


export const findAllPostHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await findAllPost(event)
};

export const writePostHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await writePost(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};


export const deletePostHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await deletePost(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};



export const updatePostHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await updatePost(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};


export const writePostLikeHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await writePostLike(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};


export const deletePostLikeHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await deletePostLike(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};



export const putPostCommentHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await putPostComment(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};



export const writePostCommentHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await writePostComment(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};



export const deletePostCommentHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await deletePostComment(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};