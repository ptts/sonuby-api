import { createRouter } from '../shared/helpers/create-router';

const indexRouter = createRouter();

indexRouter.get('/', (c) => {
  return c.json({
    message: 'Sonuby Backend',
    environment: c.env.ENVIRONMENT,
    currentAppVersion: c.env.CURRENT_APP_VERSION,
  });
});

export { indexRouter };
