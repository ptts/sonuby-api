import type { LogEvent } from '../user-error';
import { sendSlackMessage } from './send-slack-message';

export const safeSendLogEventToSlack = async (
  logEvent: LogEvent,
  { slackWebhookUrl }: { slackWebhookUrl: string },
) => {
  try {
    await sendSlackMessage({
      messagePayload: {
        channel: '#sonuby-backend-errors',
        text: `New error received:\n\n*Message*: ${logEvent.title}\n*Details*: ${JSON.stringify(logEvent.value, null, 2)}`,
      },
      slackWebhookUrl,
    });
  } catch (error) {
    // eslint-disable-next-line no-restricted-syntax
    console.error(JSON.stringify(error, null, 2));
  }
};
