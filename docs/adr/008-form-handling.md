# ADR-008: Form Handling — React Hook Form + Zod

**Status:** Accepted
**Date:** 2026-02-27
**Decision Makers:** Obi (Technical Lead), Sara (PM)

## Context

Japanoma has several form-intensive features:

1. **Preference quizzes** — Multi-step forms with 5 to 8 questions each. Three quiz types: Area Preference, Use Case, Design Style. Each step presents options (radio buttons, image selectors) with progress tracking and back/forward navigation.

2. **Contact/inquiry form** — Email, name, message, optional interest selectors (area, use case), mandatory consent checkbox with disclosure text. Submissions notify the admin and track an event (without PII in the event payload).

3. **Registration/login forms** — Email/password with validation, consent checkbox on registration.

4. **Budget selector** — Single-selection price range picker that triggers an event and optionally filters content.

5. **Admin content editing** — If the CMS (Sanity) handles content editing, the admin forms are limited to date range selectors and export configuration. However, form patterns should be consistent project-wide.

Forms must validate both client-side (instant feedback) and server-side (security), with shared validation schemas.

## Options Considered

### Option A: React Hook Form + Zod
**Pros:**
- Uncontrolled form approach minimizes re-renders (performant for multi-step quizzes)
- Zod schemas provide runtime validation and static TypeScript type inference from the same definition
- Shared Zod schemas between client and server (Next.js API routes) ensure consistent validation
- `useFormContext` enables multi-step form state without prop drilling
- Built-in array fields for dynamic form sections
- Excellent integration with shadcn/ui form components
- Well-documented resolver pattern (`@hookform/resolvers/zod`)
- Small bundle size (~9KB for React Hook Form, ~13KB for Zod)

**Cons:**
- Uncontrolled form pattern has a learning curve for developers used to controlled inputs
- Multi-step wizard pattern requires manual step management (or a thin wrapper)

**Cost:** Free (MIT license).

### Option B: Formik + Yup
**Pros:**
- Controlled form approach is more intuitive for simple forms
- Yup validation is mature and well-documented
- Large community and many examples

**Cons:**
- Controlled inputs cause re-renders on every keystroke (performance issue for complex forms)
- Formik development has slowed; less active maintenance
- Yup does not provide TypeScript type inference from schemas (Zod does)
- Larger bundle size than React Hook Form
- No equivalent to shadcn/ui's Form component integration

**Cost:** Free (MIT license).

### Option C: Next.js Server Actions + Conform
**Pros:**
- Progressive enhancement: forms work without JavaScript
- Server-first validation aligns with Server Components architecture
- Conform provides type-safe form handling for Server Actions

**Cons:**
- Multi-step quiz forms with client-side state (current step, accumulated answers) do not fit the Server Action model
- Client-side validation feedback is delayed (requires round-trip)
- Conform is a newer library with a smaller ecosystem
- Quiz image-comparison interactions require client-side JavaScript regardless

**Cost:** Free.

## Decision

**React Hook Form with Zod validation schemas.**

## Justification

The React Hook Form + Zod combination is the standard pattern for Next.js applications and directly addresses Japanoma's form needs:

1. **Multi-step quizzes benefit from uncontrolled forms.** React Hook Form's `useForm` with `mode: 'onChange'` provides real-time validation without re-rendering the entire form on each interaction. For the Design Style Quiz (image pair comparison with 5+ steps), this prevents layout shifts and keeps animations smooth.

2. **Shared Zod schemas enforce validation on both boundaries.** A single schema like `contactFormSchema` validates the form client-side (instant error messages) and server-side in the API route (security against direct API calls). TypeScript types are inferred automatically:

```typescript
const contactFormSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  message: z.string().min(10).max(2000),
  interests: z.array(z.string()).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required' }) }),
});

type ContactFormData = z.infer<typeof contactFormSchema>;
// Type is automatically { email: string; name: string; message: string; interests?: string[]; consent: true }
```

3. **shadcn/ui Form integration is seamless.** The `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormMessage>` components from shadcn/ui wrap React Hook Form's controller pattern with consistent styling and accessible error announcements.

4. **Quiz wizard pattern.** Multi-step forms use React Hook Form's `useFormContext` to share state across step components:

```typescript
// QuizProvider wraps all steps
<FormProvider {...methods}>
  {currentStep === 0 && <ClimateStep />}
  {currentStep === 1 && <ProximityStep />}
  {currentStep === 2 && <AmenitiesStep />}
  {/* ... */}
</FormProvider>
```

Each step component accesses and validates only its fields, while the parent manages step navigation and final submission.

## Consequences

**Positive:**
- Consistent form patterns across all form types (quizzes, contact, auth, admin)
- Type-safe validation shared between client and server
- Performant multi-step forms with minimal re-renders
- Accessible error handling via shadcn/ui form components
- Zod schemas serve as runtime documentation for API request shapes

**Negative/Trade-offs:**
- Uncontrolled form pattern requires understanding of React Hook Form's ref-based approach
- Multi-step wizard must be implemented as a custom pattern (no built-in wizard component)

**Risks:**
- Complex conditional validation (e.g., "if use case is Investment, require additional questions") needs careful schema composition (mitigated: Zod's `.refine()` and `.superRefine()` handle this)
- File upload in contact forms (if added later) requires additional configuration with React Hook Form
