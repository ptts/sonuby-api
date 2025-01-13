import { app } from './app';

/**
 * Cloudflare Worker entrypoint
 */
export default {
  fetch: app.fetch,
};
