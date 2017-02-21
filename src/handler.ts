import { Callback } from './callback';
import { Context } from './context';
import { Event } from './event';

export type Handler = (event: Event, context: Context, callback: Callback) => any;
