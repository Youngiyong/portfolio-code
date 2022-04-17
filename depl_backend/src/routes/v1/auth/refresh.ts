import { Context, Callback, Handler } from 'aws-lambda';
import { APIGatewayPostRequest } from '../../../model/type'
import { refreshTokenAuthEvent } from "../../../model/auth"
export const run: Handler = async (event: any, context: Context, callback: Callback) => {

	console.log('Function name: ', context.functionName)
	console.log('Remaining time: ', context.getRemainingTimeInMillis())
	
	context.callbackWaitsForEmptyEventLoop = false;
	const request: APIGatewayPostRequest = event
	console.log("event", event)
	console.log("request", request)
	return await refreshTokenAuthEvent(event);
	// -------------------------------------------------------------------
};


