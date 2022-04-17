export type requestPostUser = {
  body: {
    username: string;
    email: string | null;
  };
};

export interface APIGatewayProxyMsgResponse {
  statusCode: number;
  multiValueHeaders?: {}
  headers?: {};
  msg: string;
}


export interface APIGatewayProxyResponse {
  statusCode: number;
  multiValueHeaders?: {}
  headers?: {};
  body: string;
}

export interface APIGatewayPostRequest {
  event?: any;
  body?: any;
}