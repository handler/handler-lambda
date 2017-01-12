export type Event = any;

export interface RouterEvent {
  name: string;
  body: any;
  path: string;
};

export interface ProxyEvent {
  resource: string;
  path: string;
  httpMethod: string;
  headers: any;
  queryStringParameters: {
    name: string;
  };
  pathParameters: any;
  stageVariables: {
    stageVariableName: string;
  };
  requestContext: {
    accountId: string;
    resourceId: string;
    stage: string;
    requestId: string;
    identity: {
      cognitoIdentityPoolId: string;
      accountId: string;
      cognitoIdentityId: string;
      caller: string;
      apiKey: string;
      sourceIp: string;
      cognitoAuthenticationType: string;
      cognitoAuthenticationProvider: string;
      userArn: string;
      userAgent: string;
      user: string;
    };
  };
  body: string;
  isBase64Encoded: boolean;
}
