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

    let emailError: unknown;
    try {
      await sendFeedbackViaEmail(feedback, {
        brevoApiKey: c.env.BREVO_API_KEY,
      });
    } catch (error) {
      emailError = error;
    }

    let slackError: unknown;
    if (emailError) {
      try {
        await sendFeedbackViaSlack(feedback);
      } catch (error) {
        slackError = error;
      }
    }

    const success = !emailError && !slackError;
    if (!success) {
      throw new UserError({
        status: 500,
        message: 'Failed to send feedback',
        cause: { emailError, slackError },
      });
    }

    return c.json({ message: 'Feedback received' });
  },
);

export { feedbackRouter };
