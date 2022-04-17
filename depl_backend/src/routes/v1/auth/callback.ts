import { Context, Callback, Handler } from 'aws-lambda';
import { callbackAuthEvent } from "../../../model/auth"
export const run: Handler = async (event: any, context: Context, callback: Callback) => {

	console.log('Function name: ', context.functionName)
	console.log('Remaining time: ', context.getRemainingTimeInMillis())
	
	context.callbackWaitsForEmptyEventLoop = false;
	console.log("event",event);

	const provider  = event.pathParameters.provider
	return await callbackAuthEvent(event, provider);


	// -------------------------------------------------------------------
};


