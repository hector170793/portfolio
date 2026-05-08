'use client';

/**
 * components/Newsletter/SignupForm.tsx — Newsletter signup form.
 * [spec 3.4] Appears at end of every journal post AND in the site footer.
 * [spec 3.4] Copy: "Get notified about new writing" — MUST NOT use "newsletter" in CTA.
 * [design §8] RHF + Zod resolver → subscribeNewsletter Server Action.
 * [design §12.5] aria-invalid + aria-describedby for field errors [spec 8.8].
 *
 * Props:
 *   variant?: 'default' | 'footer'  — footer variant uses compact single-line layout.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { subscribeNewsletter } from '@/app/actions/newsletter';
import { type NewsletterInput, newsletterSchema } from '@/lib/schemas/newsletter';

type FormState = 'idle' | 'submitting' | 'success' | 'duplicate' | 'error';

interface SignupFormProps {
  /** Footer variant: single-line compact layout (email + button only). */
  variant?: 'default' | 'footer';
}

export function SignupForm({ variant = 'default' }: SignupFormProps) {
  const t = useTranslations('journal.signup');
  const [formState, setFormState] = useState<FormState>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = useCallback(
    async (data: NewsletterInput) => {
      setFormState('submitting');
      try {
        const result = await subscribeNewsletter(data);
        if (result.ok) {
          setFormState('success');
          reset();
        } else if (result.error === 'duplicate') {
          setFormState('duplicate');
        } else {
          setFormState('error');
        }
      } catch {
        setFormState('error');
      }
    },
    [reset],
  );

  // ── Result states ──────────────────────────────────────────────────────────

  if (formState === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-[var(--radius-sm)] border border-[var(--border)] p-4 text-sm text-[var(--foreground)]"
      >
        {t('confirm')}
      </div>
    );
  }

  if (formState === 'duplicate') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-[var(--radius-sm)] border border-[var(--border)] p-4 text-sm text-[var(--muted-foreground)]"
      >
        {t('duplicate')}
      </div>
    );
  }

  // ── Footer variant — compact single-line ───────────────────────────────────

  if (variant === 'footer') {
    return (
      <section aria-labelledby="signup-footer-heading">
        <h3
          id="signup-footer-heading"
          className="mb-3 text-sm font-semibold text-[var(--foreground)]"
        >
          {/* [spec 3.4] MUST NOT say "newsletter" — uses "Get notified about new writing" */}
          {t('title')}
        </h3>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label={t('title')}
          className="flex gap-2"
        >
          <div className="flex-1">
            <label htmlFor="footer-email" className="sr-only">
              {t('placeholder.email')}
            </label>
            <input
              id="footer-email"
              type="email"
              autoComplete="email"
              placeholder={t('placeholder.email')}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'footer-email-error' : undefined}
              {...register('email')}
              disabled={formState === 'submitting'}
              className="w-full rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] disabled:opacity-60"
            />
            {errors.email && (
              <p
                id="footer-email-error"
                role="alert"
                className="mt-1 text-xs text-[var(--accent-text)]"
              >
                {errors.email.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={formState === 'submitting'}
            className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--accent-base)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {formState === 'submitting' ? (
              <span className="inline-flex items-center gap-1.5">
                <Spinner />
                <span className="sr-only">{t('cta')}</span>
              </span>
            ) : (
              t('cta')
            )}
          </button>
        </form>
        {formState === 'error' && (
          <p role="alert" className="mt-2 text-xs text-[var(--accent-text)]">
            {t('error')}
          </p>
        )}
      </section>
    );
  }

  // ── Default variant — full form with optional name ─────────────────────────

  return (
    <section aria-labelledby="signup-heading" className="mt-12 space-y-6">
      <h2 id="signup-heading" className="font-display text-[var(--fs-h3)] text-[var(--foreground)]">
        {/* [spec 3.4] MUST NOT say "newsletter" — uses "Get notified about new writing" */}
        {t('title')}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {/* Email field */}
        <div className="flex flex-col gap-1">
          <label htmlFor="signup-email" className="text-sm font-medium text-[var(--foreground)]">
            {t('placeholder.email')}
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder={t('placeholder.email')}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'signup-email-error' : undefined}
            {...register('email')}
            disabled={formState === 'submitting'}
            className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] disabled:opacity-60"
          />
          {errors.email && (
            <p id="signup-email-error" role="alert" className="text-xs text-[var(--accent-text)]">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Name field (optional) */}
        <div className="flex flex-col gap-1">
          <label htmlFor="signup-name" className="text-sm font-medium text-[var(--foreground)]">
            {t('placeholder.name')}
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="given-name"
            placeholder={t('placeholder.name')}
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'signup-name-error' : undefined}
            {...register('name')}
            disabled={formState === 'submitting'}
            className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] disabled:opacity-60"
          />
          {errors.name && (
            <p id="signup-name-error" role="alert" className="text-xs text-[var(--accent-text)]">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Server-level error */}
        {formState === 'error' && (
          <p role="alert" className="text-sm text-[var(--accent-text)]">
            {t('error')}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={formState === 'submitting'}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent-base)] px-6 py-3 text-sm font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {formState === 'submitting' ? (
            <>
              <Spinner />
              <span>{t('cta')}</span>
            </>
          ) : (
            t('cta')
          )}
        </button>
      </form>
    </section>
  );
}

/** Minimal inline spinner — no extra dep. aria-hidden; label comes from parent. */
function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
