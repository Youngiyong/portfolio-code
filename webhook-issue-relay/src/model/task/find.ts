const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const findMyroTaskById  =  async (postId: String) => {
	
    const params = {
        TableName: process.env.MYROTASK_TABLE,
        Key: { 
            id: postId
        }
    }
    let task;

    console.log("postId: ",postId)

    await dynamoDb.get(params).promise()
    .then(res => {
        task = res.Item
        console.log("dynamoDB task find successful!")       
    }).catch(error => {
        console.error("dynamoDB task find error", error);
    });

    return task
}

