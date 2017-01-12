import { Callback } from './Callback';
import { env } from './env';

export class ProxyResponse {
  constructor(private callback: Callback) {}

  json(result: any, statusCode = 200) {
    this.callback(null, {
      body: JSON.stringify(result),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      statusCode,
    });
  }

  jsonError(err: Error, statusCode = 500) {
    const isProd = env.nodeEnv === 'production';
    const errorMessage = isProd ? 'internal server error' : err.message;
    this.callback(null, {
      body: JSON.stringify({
        error: {
          code: statusCode,
          message: errorMessage,
        },
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      statusCode,
    });
  }

  send(result: string, statusCode = 200) {
    this.callback(null, {
      body: result,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/html',
      },
      statusCode,
    });
  }
}
