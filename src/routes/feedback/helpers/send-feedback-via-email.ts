import { UserError } from '../../../shared/user-error';
import { FeedbackType, type Feedback } from '../schemas';

export const getFeedbackSubject = (feedback: Feedback): string => {
  switch (feedback.type) {
    case FeedbackType.Praise: {
      return `🙏 New Praise`;
    }
    case FeedbackType.Improvement: {
      return `🔧 New Improvement Request`;
    }
    case FeedbackType.Feature: {
      return `🥠 New Feature Request`;
    }
    case FeedbackType.Bug: {
      return `🐞 New Bug Report`;
    }
    default: {
      feedback satisfies never;
      return '🤷‍♂️ New Feedback';
    }
  }
};

export const getBrevoParamsFromFeedback = (feedback: Feedback) => {
  const params = {
    type: feedback.type,
    name: 'name' in feedback ? (feedback.name ?? undefined) : undefined,
    category:
      feedback.type === FeedbackType.Feature ||
      feedback.type === FeedbackType.Improvement ||
      feedback.type === FeedbackType.Bug
        ? feedback.category
        : undefined,
    message:
      'message' in feedback ? (feedback.message ?? undefined) : undefined,
    operatingSystem: feedback.operatingSystem,
    device: feedback.device,
    appVersion: feedback.appVersion,
    rating: 'rating' in feedback ? (feedback.rating ?? undefined) : undefined,
    paymentProviderUserId: feedback.paymentProviderUserId,
  } as const satisfies Record<string, string | number | undefined | null>;

  if (feedback.type === FeedbackType.Bug) {
    return { ...params, stackTrace: feedback.stackTrace } as const;
  }

  return params;
};

export const sendFeedbackViaEmail = async (
  feedback: Feedback,
  {
    brevoApiKey,
  }: {
    brevoApiKey: string;
  },
) => {
  try {
    const params = getBrevoParamsFromFeedback(feedback);
    const subject = getFeedbackSubject(feedback);
    const { name, email } = feedback;
    const replyTo = email && name ? { email, name } : undefined;

    const payload = {
      sender: {
        name: 'Sonuby In-App Feedback',
        email: 'noreply@sonuby.com',
      },
      to: [
        {
          name: 'Sonuby',
          email: 'mail@sonuby.com',
        },
      ],
      subject,
      replyTo,
      templateId: 6,
      params,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok || response.status !== 201) {
      throw new Error(
        `${response.statusText}: ${await response.text()} (${response.status.toString()})`,
      );
    }
  } catch (error) {
    throw new UserError({
      message: 'Failed to send feedback via email',
      status: 500,
      cause: error,
      loggingDetails: {
        title: 'Failed to send feedback via email',
        value: String(error),
      },
    });
  }
};
