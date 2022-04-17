import { Callback, Context, Handler } from 'aws-lambda';
import { DeplMsgResponse } from '../../../lib/response';
import { verifyAccessToken } from '../../../lib/token';
import { getTag, getTags, putTag, postTag, deleteTag } from '../../../model/tag';

export const postTagHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await postTag(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};


export const deleteTagHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await deleteTag(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};


export const putTagHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const user_id =  verifyAccessToken(event);
    console.log(user_id)
    return user_id ? await putTag(event, user_id): DeplMsgResponse(400, 'Invalid Access token Request');
};



export const getTagHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await getTag(event);
};


export const getTagsHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await getTags();
};