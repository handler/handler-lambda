import { FunctionContext, FunctionHandler, FunctionResponse, FunctionRouter,
         HTTPContext, HTTPHandler, HTTPRequest, HTTPResponse, HTTPRouter } from 'handlr';

import { Callback } from './Callback';
import { Context } from './Context';
import { Event, ProxyEvent, RouterEvent } from './Event';
import { Handler } from './Handler';
import * as logger from './logger';

function _toProxyResult(res: HTTPResponse): {} {
  let body: string;
  if (res.contentType === 'application/json') {
    body = JSON.stringify(res.body);
  } else {
    body = res.body;
  }
  return {
    body,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': res.contentType,
    },
    statusCode: res.statusCode,
  };
}

export function fromFunctionHandler(handler: FunctionHandler): Handler {
  return async(event: Event, context: Context, callback: Callback) => {
    try {
      logger.log(event, 'Event');
      const ctx = new FunctionContext({
        body: event,
        context,
      });
      const res = await handler(ctx);
      logger.log(res, 'Result');
      callback(null, res);
    } catch (err) {
      logger.log(err.message, 'Error');
      callback(err);
    }
  };
}

export function fromFunctionRouter(router: FunctionRouter): Handler {
  return async(event: RouterEvent, context: Context, callback: Callback) => {
    try {
      logger.log(event, 'Event');
      const ctx = new FunctionContext({
        body: event.body,
        context,
      });
      for (const middleware of router.middlewares) {
        const handler = middleware as FunctionHandler;
        const res = await handler(ctx);
        logger.log(res, 'Result');
        callback(null, res);
      }
      const match = router.matchRoute(event.path);
      if (!match) {
        throw new Error('route not matched');
      }
      const res = await match.handler(ctx);
      logger.log(res, 'Result');
      callback(null, res);
    } catch (err) {
      logger.log(err.message, 'Error');
      callback(err);
    }
  };
}

export function fromHTTPHandler(handler: HTTPHandler): Handler {
  const router = new HTTPRouter();
  router.all('*', handler);
  return fromHTTPRouter(router);
}

export function fromHTTPRouter(router: HTTPRouter): Handler {
  return async(event: ProxyEvent, context: Context, callback: Callback) => {
    try {
      logger.log(event, 'Event');
      const req: HTTPRequest = {
        body: JSON.parse(event.body),
        headers: event.headers || {},
        method: event.httpMethod,
        params: event.pathParameters || {},
        query: event.queryStringParameters || {},
      };
      const ctx = new HTTPContext({
        context,
        req,
      });
      for (const middleware of router.middlewares) {
        const handler = middleware as HTTPHandler;
        const res = await handler(ctx);
        if (res) {
          const result = _toProxyResult(res);
          logger.log(result, 'Result');
          return callback(null, result);
        }
      }
      const match = router.matchRoute(event.httpMethod, event.path);
      if (!match) {
        throw new Error('route not matched');
      }
      const res = await match.handler(ctx);
      const result = _toProxyResult(res);
      logger.log(result, 'Result');
      callback(null, result);
    } catch (err) {
      logger.log(err.message, 'Error');
      callback(err);
    }
  };
}
