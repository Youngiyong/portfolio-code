import AWS from 'aws-sdk';
import sanitize from 'sanitize-html';
import { SendEmailRequest } from 'aws-sdk/clients/ses';

const ses = new AWS.SES({ region: 'ap-northeast-2' });

export type EmailParams = {
  to: string | string[];
  subject: string;
  body: string;
  from: string;
};

export const createAuthEmail = (registered: boolean, code: string) => {
  const keywords = registered
    ? {
        type: 'change-password',
        text: '패스워드찾기'
      }
    : {
        type: 'register',
        text: '회원가입'
      };

  const subject = `Depl ${keywords.text}`;
  const body = `<a href="http://brwony.example.ocom"><img src="https://s3.ap-northeast-2.amazonaws.com/cdn.browny.io/common/email-logo.png" style="display: block; width: 128px; margin: 0 auto;"/></a>
  <div style="max-width: 100%; width: 400px; margin: 0 auto; padding: 1rem; text-align: justify; background: #f8f9fa; border: 1px solid #dee2e6; box-sizing: border-box; border-radius: 4px; color: #868e96; margin-top: 0.5rem; box-sizing: border-box;">
    <b style="black">안녕하세요! </b>이메일 인증코드: ${code}을 회원가입 인증코드란에 입력해주세요. 만약에 실수로 요청하셨거나, 본인이 요청하지 않았다면, 이 메일을 무시하세요.
  </div>`;
  
  return {
    subject,
    body
  };
};

export const sendMail  =  async ({ to, subject, body, from }: EmailParams) => {
  const params: SendEmailRequest = {
    Destination: {
      ToAddresses: typeof to === 'string' ? [to] : to
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: body
        },
        Text: {
          Charset: 'UTF-8',
          Data: sanitize(body, { allowedTags: [] })
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: from
  };
  
  return await ses.sendEmail(params).promise()
        .then(res => {
          console.log(res)
        }).catch(err => {
          console.log(err)
  })

}

// export default sendMail;
