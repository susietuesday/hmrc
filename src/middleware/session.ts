import session from 'express-session';
import Redis from 'ioredis';
import connectRedis from 'connect-redis';

import type { Application } from 'express';
import { log } from '../utils/utils';
import { REDIS_URL, ENV, SESSION_SECRET} from '../config/config';

// Redis client
const redisClient = new Redis(REDIS_URL!);
redisClient.on('connect', () => log.info('✅ Redis connected'));
redisClient.on('error', (err) => log.error('Redis error', err));

const RedisStore = connectRedis(session);

export function setupSession(app: Application) {
  const FOUR_HOURS = 4 * 60 * 60; // expiry in seconds
  const isDev = ENV === 'development';

  app.use(session({
    store: new RedisStore({ client: redisClient, ttl: FOUR_HOURS }),
    secret: SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: !isDev,
      maxAge: FOUR_HOURS * 1000,
      sameSite: !isDev ? 'strict' : 'lax'
    }
  }));
}