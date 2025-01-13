import { sendSlackMessage } from '../../../shared/helpers/send-slack-message';
import { type Feedback } from '../schemas';

export const sendFeedbackViaSlack = async (
  feedback: Feedback,
  { slackWebhookUrl }: { slackWebhookUrl: string },
): Promise<void> => {
  const formatMessage = (feedback: Feedback): string => {
    const category = 'category' in feedback ? feedback.category : undefined;
    const stackTrace =
      'stackTrace' in feedback ? (feedback.stackTrace ?? undefined) : undefined;
    const rating =
      'rating' in feedback ? (feedback.rating ?? undefined) : undefined;

    return [
      `New feedback received:`,
      `*Type*: ${feedback.type}`,
      `*Name*: ${feedback.name ?? '(Anonymous)'}`,
      `*Email*: ${feedback.email ?? '(Anonymous)'}`,
      rating && `*Rating*: ${rating.toString()}`,
      category && `*Category*: ${category}`,
      `*OS*: ${feedback.operatingSystem}`,
      `*Device*: ${feedback.device}`,
      `*App Version*: ${feedback.appVersion}`,
      feedback.message && `*Message*: ${feedback.message}`,
      stackTrace && `*Stack Trace*: \n\`\`\`${stackTrace}\`\`\``,
    ]
      .filter(Boolean)
      .join('\n');
  };

  const messagePayload = {
    channel: '#sonuby-in-app-feedback',
    text: formatMessage(feedback),
  };

  await sendSlackMessage({ messagePayload, slackWebhookUrl });
};
