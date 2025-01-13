import { z } from 'zod';

export const FeedbackType = {
  Praise: 'praise',
  Feature: 'feature-request',
  Improvement: 'improvement-request',
  Bug: 'bug-report',
} as const;
export type FeedbackType = (typeof FeedbackType)[keyof typeof FeedbackType];

const TechnicalInfoSchema = z.object({
  operatingSystem: z.string(),
  device: z.string(),
  appVersion: z.string(),
  paymentProviderUserId: z.string().optional(),
});

const CommonFeedbackFields = z.object({
  rating: z.number().optional().default(0),
  email: z.string().email(),
  name: z.string().min(2),
  message: z.string().default(''),
});

const PraiseFeedbackSchema = CommonFeedbackFields.extend({
  type: z.literal(FeedbackType.Praise),
});

const FeatureFeedbackSchema = CommonFeedbackFields.extend({
  type: z.literal(FeedbackType.Feature),
  category: z.string(),
});

const ImprovementFeedbackSchema = CommonFeedbackFields.extend({
  type: z.literal(FeedbackType.Improvement),
  category: z.string(),
});

const BugFeedbackSchema = TechnicalInfoSchema.extend({
  type: z.literal(FeedbackType.Bug),
  category: z.string(),
  stackTrace: z.string().nullable(),

  rating: z.number().nullable(),
  email: z.string().email().nullable(),
  name: z.string().min(2).nullable(),
  message: z.string().nullable(),
});

export const FeedbackSchema = z.discriminatedUnion('type', [
  TechnicalInfoSchema.merge(PraiseFeedbackSchema),
  TechnicalInfoSchema.merge(ImprovementFeedbackSchema),
  TechnicalInfoSchema.merge(FeatureFeedbackSchema),
  TechnicalInfoSchema.merge(BugFeedbackSchema),
]);

export type Feedback = z.infer<typeof FeedbackSchema>;
