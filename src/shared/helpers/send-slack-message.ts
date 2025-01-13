import { UserError } from '../user-error';

export const sendSlackMessage = async ({
  messagePayload,
  slackWebhookUrl,
}: {
  messagePayload: {
    channel: string;
    text: string;
  };
  slackWebhookUrl: string;
}) => {
  try {
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(messagePayload),
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send message to Slack: ${response.statusText}`,
      );
    }
  } catch (error) {
    throw new UserError({
      message: 'Sending message to Slack failed',
      status: 500,
      loggingDetails: {
        title: 'Sending message to Slack failed',
        value: error,
      },
    });
  }
};
