import { app } from '../app';
import { createRouter } from '../shared/helpers/create-router';

const indexRouter = createRouter();

import { showRoutes } from 'hono/dev';

indexRouter.get('/', (c) => {
  if (c.env.ENVIRONMENT === 'development') {
    showRoutes(app);
  }

  return c.json({
    message: 'Sonuby Backend',
    environment: c.env.ENVIRONMENT,
    currentAppVersion: c.env.CURRENT_APP_VERSION,
  });
});

export { indexRouter };
