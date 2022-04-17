import { Callback, Context, Handler } from 'aws-lambda';
import { DeplMsgResponse } from '../../../lib/response';
import { verifyAccessToken } from '../../../lib/token';
import { deleteQna, updateQna, postQna, updateQnaViewCount, postQnaLike, deleteQnaLike, deleteQnaComment, HardDeleteQnaComment, putQnaComment, getQna, findAllQna, postQnaComment } from '../../../model/qna';


export const getQnaHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await getQna(event)
};


export const findAllQnaHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await findAllQna(event)
};

export const postQnaHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await postQna(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};


export const deleteQnaHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await deleteQna(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};



export const updateQnaViewCountHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await updateQnaViewCount(event);
};

export const updateQnaHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await updateQna(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};


export const postQnaLikeHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await postQnaLike(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};


export const deleteQnaLikeHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await deleteQnaLike(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};



export const putQnaCommentHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await putQnaComment(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};



export const postQnaCommentHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await postQnaComment(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};



export const deleteQnaCommentHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await deleteQnaComment(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};



export const HardDeleteQnaCommentHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);


    console.log(user_id)
    return user_id ? await HardDeleteQnaComment(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};