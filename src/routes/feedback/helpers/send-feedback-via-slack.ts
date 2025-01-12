import { FeedbackType, type Feedback } from '../schema';

export const sendFeedbackViaSlack = async (feedback: Feedback) => {
  const slackMessage = {
    channel: '#sonuby-in-app-feedback',
    text: `New feedback received:\n\n*Type*: ${feedback.type}`,
  };

  const { name, email, rating, message } = feedback;
  const category = 'category' in feedback ? feedback.category : undefined;

  slackMessage.text += `\n*Name*: ${name ?? 'Anonymous'}`;
  slackMessage.text += `\n*Email*: ${email ?? 'Anonymous'}`;
  slackMessage.text += `\n*Rating*: ${rating?.toString() ?? '(Not provided)'}`;

  if (category) {
    slackMessage.text += `\n*Category*: ${category}`;
  }

  slackMessage.text += `\n*OS*: ${feedback.operatingSystem}`;
  slackMessage.text += `\n*Device*: ${feedback.device}`;
  slackMessage.text += `\n*App Version*: ${feedback.appVersion}`;

  if (message) {
    slackMessage.text += `\n*Message*: ${message}`;
  }

  if (feedback.type === FeedbackType.Bug) {
    slackMessage.text += `\n*Stack Trace*: \n\`\`\`${feedback.stackTrace ?? ''}\`\`\``;
  }

  //TODO: Implement sending the slack message
  await new Promise((r) => setTimeout(r, 1000));
};
