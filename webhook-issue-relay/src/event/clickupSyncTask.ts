import { Handler, Context, Callback } from "aws-lambda";
import { IWebhookFromClickup, clickupSyncTask } from "../model/clickup/model"

export const run: Handler = async (event, context: Context, callback: Callback) => {
    console.log('Function name: ', context.functionName)
	console.log('Remaining time: ', context.getRemainingTimeInMillis())

	context.callbackWaitsForEmptyEventLoop = false;

	// -------------------------------------------------------------------

    const clickupWebhook: IWebhookFromClickup = event.body;

	console.log("incomming hook from clickup", clickupWebhook);

	await clickupSyncTask(clickupWebhook)

    console.log("Successful clickupSyncTask!") 
}