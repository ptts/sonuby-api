import { zValidator } from '@hono/zod-validator';
import { firebaseAuthMiddleware } from '../../middlewares/firebase-auth';
import { createRouter } from '../../shared/helpers/create-router';
import { UserError } from '../../shared/user-error';
import { sendFeedbackViaEmail } from './helpers/send-feedback-via-email';
import { sendFeedbackViaSlack } from './helpers/send-feedback-via-slack';
import { FeedbackSchema } from './schemas';

const feedbackRouter = createRouter();

feedbackRouter.post(
  '/v1/feedback',
  firebaseAuthMiddleware,
  zValidator('json', FeedbackSchema),
  async (c) => {
    const feedback = c.req.valid('json');

    try {
      await sendFeedbackViaEmail(feedback, {
        brevoApiKey: c.env.BREVO_API_KEY,
      });
    } catch (emailError) {
      try {
        await sendFeedbackViaSlack(feedback);
      } catch (slackError) {
        throw new UserError({
          message: 'Feedback not received',
          status: 500,
          cause: [emailError, slackError],
        });
      }
    }

    return c.json({ message: 'Feedback received' });
  },
);

export { feedbackRouter };
