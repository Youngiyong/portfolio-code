const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const updateTaskId  =  async (taskId: string, postId: string) => {
    
    const params = {
        TableName: process.env.MYROTASK_TABLE,
        Key: {
            id : postId.toString()
        },
        UpdateExpression: "set taskId = :taskId",
        ExpressionAttributeValues:{
            ":taskId":taskId
        },
        ReturnValues:"UPDATED_NEW"
    }

    console.log("Updating the item...");

    await dynamoDb.update(params).promise()
   
}

export const updateTaskStatus  =  async (taskStatus: string, postId: string) => {
    const params = {
        TableName: process.env.MYROTASK_TABLE,
        Key: {
            id : postId.toString()
        },
        UpdateExpression: "set taskStatus = :taskStatus",
        ExpressionAttributeValues:{
            ":taskStatus":taskStatus
        },
        ReturnValues:"UPDATED_NEW"
    }
    console.log(postId, taskStatus, params)

    console.log("Updating the item...");

    await dynamoDb.update(params).promise()
   
}