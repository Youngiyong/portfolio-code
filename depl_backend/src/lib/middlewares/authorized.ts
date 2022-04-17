import { Context, Callback, Handler } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { splitByDelimiter } from '../token';

export const run: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const [type, token] = splitByDelimiter(event.authorizationToken, ' ');
  const allow =
    type === 'Bearer' &&
    !!jwt.verify(token, process.env.JWT_SECRET_KEY as string);

  // arn:aws:execute-api:REGION:ACCOUNT_ID:API_ID/STAGE/METHOD/FUNCTION_NAME
  const [, , , region, accountId, apiId, stage] = event.methodArn.split(/[:/]/);
  const scopedMethodArn =
    ['arn', 'aws', 'execute-api', region, accountId, apiId].join(':') +
    '/' +
    [stage, /* method= */ '*', /* function= */ '*'].join('/');

  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: allow ? 'Allow' : 'Deny',
          Resource: scopedMethodArn,
        },
      ],
    },
  };
};
