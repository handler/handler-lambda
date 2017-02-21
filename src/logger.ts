import { DEBUG } from 'handler.js';

export function debug(value: any, title?: string) {
  if (DEBUG) {
    log(value, title);
  }
}

export function log(value: any, title?: string) {
  let result = JSON.stringify(value, null, 2);
  if (title) {
    result = `${title}: ${result}`;
  }
  console.log(result);
}
