import { Hono } from 'hono';
import type { AppEnv } from '../../types';

export const createRouter = () => new Hono<AppEnv>({ strict: false });
