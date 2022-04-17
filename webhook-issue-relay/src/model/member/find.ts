import { IWebhookFromClickup } from "../clickup/model";

const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const findMyroMemberById  =  async (clickupWebhook: IWebhookFromClickup) => {
	const userId = clickupWebhook.history_items[0].user.id
	let apiKey
    const params = {
        TableName: process.env.MYROMEMBER_TABLE,
        Key: { 
            id: userId.toString() 
        }
    }

    await dynamoDb.get(params).promise()
    .then(res => {
        apiKey = res.Item.key
        console.log("dynamoDB member find successful!")
    }).catch(error => {
        console.log("dynamoDB member find error", error)
    });

    return apiKey
}

