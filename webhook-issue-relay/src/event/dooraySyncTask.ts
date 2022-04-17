import { Handler, Context, Callback } from "aws-lambda";
import { IWebhookFromDooray, dooraySyncTask } from "../model/dooray/model"

export const run: Handler = async (event, context: Context, callback: Callback) => {
    console.log('Function name: ', context.functionName)
	console.log('Remaining time: ', context.getRemainingTimeInMillis())

	context.callbackWaitsForEmptyEventLoop = false;

	// -------------------------------------------------------------------

    const doorayWebhook: IWebhookFromDooray = event.body;

	console.log("incomming hook from dooray", doorayWebhook);

    await dooraySyncTask(doorayWebhook))

    console.log("Successful dooraySyncTask!") 

}