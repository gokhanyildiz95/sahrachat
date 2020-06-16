// import { PubSub, withFilter } from 'apollo-server';

import { RedisPubSub } from 'graphql-redis-subscriptions';

import * as MESSAGE_EVENTS from './message';

export const EVENTS = {
  MESSAGE: MESSAGE_EVENTS,
  THREAD_UPDATED: 'THREAD_UPDATED',
};

export default new RedisPubSub({
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: 6379,
    retry_strategy: options => Math.max(options.attempt * 100, 3000),
  },
});
// export default new PubSub();

