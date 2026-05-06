import { z } from 'zod';

const quizContextSchema = z.object({
  purpose: z.string().optional(),
  skiSeason: z.string().optional(),
  familyComposition: z.string().optional(),
  propertyTypes: z.array(z.string()).optional(),
  condition: z.string().optional(),
  budget: z.string().optional(),
  priority: z.string().optional(),
}).optional();

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  consent: z.literal(true, 'You must agree to the privacy policy'),
  source: z.enum(['direct', 'area_detail', 'quiz', 'content']).optional(),
  sourceContext: z.object({
    areaSlugs: z.array(z.string()).optional(),
    quizSessionId: z.string().optional(),
    quizContext: quizContextSchema,
  }).strict().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type QuizContextSnapshot = NonNullable<NonNullable<ContactFormData['sourceContext']>['quizContext']>;
