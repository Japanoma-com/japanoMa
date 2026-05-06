import { z } from 'zod';

export const profileSnapshotSchema = z.object({
  types: z.array(z.string().min(1).max(50)).min(1).max(10),
  condition: z.string().min(1).max(50),
  budget: z.string().min(1).max(50),
  summary: z.string().min(1).max(2000),
  score: z.number().int().min(0).max(100),
});

export type ProfileSnapshot = z.infer<typeof profileSnapshotSchema>;

export const leadInputSchema = z.object({
  areaSlug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  prefectureSlug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  profileSnapshot: profileSnapshotSchema,
});

export type LeadInput = z.infer<typeof leadInputSchema>;

export const recordConsentAndCreateLeadInputSchema = leadInputSchema.extend({
  consentTextVersion: z.string().min(1).max(20).regex(/^v\d+$/),
});

export type RecordConsentAndCreateLeadInput = z.infer<
  typeof recordConsentAndCreateLeadInputSchema
>;
