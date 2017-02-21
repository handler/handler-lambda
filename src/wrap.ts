import { FunctionHandler, FunctionRequest, FunctionRouter,
         HTTPContext, HTTPHandler, HTTPResponse, HTTPRouter } from 'handler.js';

import { Callback } from './callback';
import { Context } from './context';
import { Event, ProxyEvent, RouterEvent } from './event';
import { Handler } from './handler';
import * as logger from './logger';

function _sendError(cb: Callback, err: Error) {
  logger.log(err.message, 'Error');
  cb(err);
}

function _sendResult(cb: Callback, result: any) {
  logger.log(result, 'Result');
  cb(null, result);
}

function _toProxyResult(res: HTTPResponse) {
  let body: string;
  if (res.type === 'application/json') {
    body = JSON.stringify(res.body);
  } else {
    body = res.body;
  }
  return {
    body,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': res.type,
    },
    statusCode: res.status,
  };
}

export function fromFunctionHandler(handler: FunctionHandler): Handler {
  return async (event: Event, context: Context, callback: Callback) => {
    try {
      logger.log(event, 'Event');
      const req = new FunctionRequest({
        body: event,
        context,
      });
      const res = await handler(req);
      logger.log(res, 'Result');
      callback(null, res);
    } catch (err) {
      _sendError(callback, err);
    }
  };
}

export function fromFunctionRouter(router: FunctionRouter): Handler {
  return async (event: RouterEvent, context: Context, callback: Callback) => {
    try {
      logger.log(event, 'Event');
      const req = new FunctionRequest({
        body: event.body,
        context,
        path: event.path,
      });
      for (const middleware of router.middlewares) {
        const handler = middleware as FunctionHandler;
        const res = await handler(req);
        logger.log(res, 'Result');
        callback(null, res);
      }
      const match = router.matchRoute(req.path);
      if (!match) {
        throw new Error('route not matched');
      }
      const res = await match.handler(req);
      logger.log(res, 'Result');
      callback(null, res);
    } catch (err) {
      _sendError(callback, err);
    }
  };
}

export function fromHTTPHandler(handler: HTTPHandler): Handler {
  const router = new HTTPRouter();
  router.all('*', handler);
  return fromHTTPRouter(router);
}

export function fromHTTPRouter(router: HTTPRouter): Handler {
  return async (event: ProxyEvent, context: Context, callback: Callback) => {
    try {
      logger.log(event, 'Event');
      const rewritePath = router._rewritePath(event.path);
      if (rewritePath) {
        return _sendResult(callback, {
          headers: {
            Location: rewritePath,
          },
          statusCode: 302,
        });
      }
      const ctx = new HTTPContext({
        body: JSON.parse(event.body),
        context,
        headers: event.headers || {},
        method: event.httpMethod,
        params: event.pathParameters || {},
        path: event.path,
        query: event.queryStringParameters || {},
      });
      for (const middleware of router.middlewares) {
        const handler = middleware as HTTPHandler;
        await handler(ctx);
      }
      const match = router.matchRoute(ctx.req.method, ctx.req.path);
      if (!match) {
        const res = new HTTPResponse({context: ctx});
        res.body = 'Not Found';
        res.status = 404;
        return _sendResult(callback, _toProxyResult(res));
      }
      await match.handler(ctx);
      _sendResult(callback, _toProxyResult(ctx.res));
    } catch (err) {
      _sendError(callback, err);
    }
  };
}
