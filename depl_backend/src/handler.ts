import { Handler, Context } from 'aws-lambda';

interface HelloResponse {
  statusCode: number;
  headers: {};
  body: string;
}

const hello: Handler = async (event: any, context: Context) => {
  const response: HelloResponse = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
      'Set-Cookie': 'test.com',
    },
    body: JSON.stringify({
      message: 'Hello World999999999!',
    }),
  };
  console.log(response)
  return response;
};

export { hello };
