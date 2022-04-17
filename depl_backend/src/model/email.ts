import { hashPassword, randomEmailCode } from "../lib/hash";
import AWS from 'aws-sdk';
import { DeplResponse, DeplMsgResponse } from "../lib/response";
import { createAuthEmail, EmailParams, sendMail  } from "../lib/sendEmail"
import { sendEmailAuth } from "../routes/v1/auth/login";
import { joinMemberShipAfterEmailAuth } from "./user";
import { getRepository } from "typeorm";
import User from "../entity/User";
import Database from "../database";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

//이메일 코드 인증 확인
export const emailCodeAuth =  async (event: any) => {
    const payload = JSON.parse(event.body)

    const params = {
        TableName: process.env.EMAIL_AUTH,
        Key: { 
            email: payload.email
        }
    }
    let user_temp

    //기존 회원가입(이메일 인증)을 진행한 사용자인지 확인한다.
    await dynamoDb.get(params).promise()
    .then((res) => {
        user_temp = res.Item  
    }).catch((e) => {
        console.error(e)
    });

    if(!user_temp) return DeplMsgResponse(400, "이메일 인증 요청을 다시 진행해주세요.")

    //사용자가 입력한 인증코드와 저장된 인증코드가 같은지 확인한다.
    if(payload.code===user_temp.code && payload.is_type===false){
        return await joinMemberShipAfterEmailAuth(payload, user_temp)
    } else if(payload.code===user_temp.code && payload.is_type===true){
        return DeplMsgResponse(200, "OK")
    }
    else return DeplResponse(400, "이메일 인증코드가 일치하지 않습니다.")

}

export const changePasswordCreateEmailCode = async (event: any) => {
    const connection = new Database();
    await connection.getConnection();
    const userRepo = getRepository(User);
    const body = JSON.parse(event.body)
  
    const user = await userRepo.findOne({
      where: {
        email: body.email,
      },
    });

    if(!user) return DeplMsgResponse(404, "존재하지 않는 사용자입니다.")
    // dynamodb에 email, code, count 정보를 등록한다.   
    body.code = randomEmailCode()
    body.created_at = new Date().toISOString()
    body.updated_at = new Date().toISOString()
    body.auth_count = 1
    
    const params = {
        TableName: process.env.EMAIL_AUTH,
        Item: body
    }
    console.log(params)
    
    await dynamoDb.put(params).promise()
    .then(async (res) => {
        console.log("Success put email code")

        const email =  createAuthEmail(body.is_type, body.code)

        let email_params: EmailParams = {
            to: body.email,
            subject: email.subject,
            body: email.body,
            from: 'browny9532@gmail.com'
        }

    //이메일을 보낸다.
    await sendMail(email_params);

    
    }).catch((e) => {
        console.error(e)
    });

    return DeplMsgResponse(200, "OK")
}

export const createEmailCode  =  async (payload: any) => {
    
    // dynamodb에 email, code, count 정보를 등록한다.   
    payload.code = randomEmailCode()
    payload.created_at = new Date().toISOString()
    payload.updated_at = new Date().toISOString()
    payload.auth_count = 1
    const params = {
        TableName: process.env.EMAIL_AUTH,
        Item: payload
    }
    console.log(params)
    
    await dynamoDb.put(params).promise()
    .then(async (res) => {
        console.log("Success put email code")

        const email =  createAuthEmail(payload.is_type, payload.code)

        let email_params: EmailParams = {
            to: payload.email,
            subject: email.subject,
            body: email.body,
            from: 'browny9532@gmail.com'
        }

    //이메일을 보낸다.
    await sendMail(email_params);

    
    }).catch((e) => {
        console.error(e)
    });

    return DeplMsgResponse(200, "OK")

}

export const updateEmailCode  =  async (event: any) => {

    const payload = JSON.parse(event.body)

    const params = {
        TableName: process.env.EMAIL_AUTH,
        Key: { 
            email: payload.email
        }
    }
    let user_temp

    //기존 회원가입(이메일 인증)을 진행한 사용자인지 확인한다.
    await dynamoDb.get(params).promise()
    .then((res) => {
        user_temp = res.Item  
    }).catch((e) => {
        console.error(e)
    });
    if(!user_temp){
        return DeplMsgResponse(404, "존재하지 않는 사용자입니다.")
    }

    //이메일 인증을 재요청한 사용자라면 이메일 요청 카운트 +1 , email code 재생성, updated_at 수정을 진행한다.
    const now = new Date()
    const updated_at = new Date(user_temp.updated_at)
    //업데이트 시간에 15분을 더한다.
    const add15minute = new Date(updated_at.getTime() + 15*60000);
    console.log(now, user_temp.updated_at, add15minute)

    //이메일 인증 카운트가 3회 이상이고 업데이트 시간에 15분이 지났는지 확인한다.
    if(add15minute>now && user_temp.auth_count>=3){
        return DeplMsgResponse(400, "이메일 인증 최대 횟수(3)을 초과하여 15분뒤에 재 회원가입 진행하시길 바랍니다.")
    }

    //랜덤 코드를 재생성한다.
    const code = randomEmailCode()

    //인증 카운트 +1
    const auth_count = user_temp.auth_count += 1

    const params2 = {
        TableName: process.env.EMAIL_AUTH,
        Key: {
            email : payload.email
        },
        UpdateExpression: "set code = :code, auth_count = :auth_count, updated_at = :updated_at" , 
        ExpressionAttributeValues:{
            ":code": code,
            ":auth_count": auth_count,
            ":updated_at": new Date().toISOString()
        },
        ReturnValues:"UPDATED_NEW"
    }

    //인증코드를 업데이트한다.
    await dynamoDb.update(params2).promise()
    .then(async (res) => {
        console.log("success update email code", res)
        const email =  createAuthEmail(payload.is_type, code)

        let email_params: EmailParams = {
            to: payload.email,
            subject: email.subject,
            body: email.body,
            from: 'browny9532@gmail.com'
        }

        //이메일을 보낸다.
        await sendMail(email_params);

    }).catch((err) => {
        console.error("email is not exist", err)
    });
   
    return DeplMsgResponse(200, "OK")

}

        

export const findCodeByEmail  =  async (payload: any) => {
	
    const params = {
        TableName: process.env.EMAIL_AUTH,
        Key: { 
            email: payload.email,
            auth_count: 1
        }
    }
    console.log("params", params)
    console.log("email", payload.email)
    let user;
    await dynamoDb.get(params).promise()
    .then((res) => {
        user = res.Item  
        console.log("??")   
    }).catch((err) => {
        console.error("email is not exist", err)
    });
    
    if(!user){
       payload.code = randomEmailCode()
       console.log(payload)
       return await createEmailCode(payload)
    }
    
}




