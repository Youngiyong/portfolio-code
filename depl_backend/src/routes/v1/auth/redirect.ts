import { Context, Callback, Handler } from 'aws-lambda';
import { generateSocialLoginLink } from '../../../lib/social/index'
export const run: Handler = async (event: any, context: Context, callback: Callback) => {

	context.callbackWaitsForEmptyEventLoop = false;
	const provider  = event.pathParameters.provider
	console.log(provider)
    return await generateSocialLoginLink(provider)
	// -------------------------------------------------------------------
};


