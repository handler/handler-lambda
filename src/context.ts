export interface Context {
  functionName: string;
  functionVersion: string;
  invokeid: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  awsRequestId: string;
  callbackWaitsForEmptyEventLoop: boolean;
  logGroupName: string;
  logStreamName: string;
  identity: {
    cognito_identity_id: string;
    cognito_identity_pool_id: string;
  };
  clientContext: {
    client: {
      installation_id: string;
      app_title: string;
      app_version_name: string;
      app_version_code: string;
      app_package_name: string;
    };
    Custom: any;
    env: {
      platform_version: string;
      platform: string;
      make: string;
      model: string;
      locale: string;
    };
  };
}
