import { IRequestMyroCompnayCreateTask } from "../task/model";

const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const dayjs = require('dayjs')
export const create  =  async (request: IRequestMyroCompnayCreateTask) => {

    request.created_at = dayjs(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"})).format('YYYY-MM-DD HH:mm:ss')
    console.log(request)
    const params = {
        TableName: process.env.MYROTASK_TABLE,
        Item: request
    }

    await dynamoDb.put(params).promise()
    console.log("dynamoDB task create successful!")
}

