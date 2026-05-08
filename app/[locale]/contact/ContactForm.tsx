'use client';

/**
 * app/[locale]/contact/ContactForm.tsx — Contact form client component.
 * [spec 4] 5-field contact form + Turnstile invisible bot-protection.
 * [design §7.1] RHF + Zod → submitContact Server Action.
 * [design §7.5] @marsidev/react-turnstile, appearance="execute", execution="execute".
 * [design §12.5] aria-invalid + aria-describedby for all field errors [spec 8.8].
 *
 * Form fields:
 *   name (required), email (required), company (optional),
 *   project_type (dropdown, required), message (textarea, required min 10 chars)
 *
 * Error states:
 *   - Per-field: inline aria-invalid + aria-describedby + visible error text
 *   - turnstile: top-level message, form preserved (no reset)
 *   - send/unknown: top-level fallback message, form preserved (no reset)
 *   - success: confirmation message + full form reset
 */

import { zodResolver } from '@hookform/resolvers/zod';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { Turnstile } from '@marsidev/react-turnstile';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { submitContact } from '@/app/actions/contact';
import { type ContactInput, contactSchema, PROJECT_TYPES } from '@/lib/schemas/contact-form';

// [design §7.5] Dev always-pass sitekey — never requires real key for local dev.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA';

type FormStatus = 'idle' | 'submitting' | 'success' | 'turnstile' | 'send' | 'unknown';

export function ContactForm() {
  const t = useTranslations('contact');
  const [status, setStatus] = useState<FormStatus>('idle');

  // Ref to Turnstile widget — used to programmatically execute + reset.
  const turnstileRef = useRef<TurnstileInstance>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      project_type: undefined,
      message: '',
      turnstileToken: '',
    },
  });

  const onSubmit = useCallback(
    async (data: ContactInput) => {
      setStatus('submitting');

      // [design §7.5] Refresh token before submit to ensure freshness.
      // The token was already set via onSuccess; we use whatever is currently stored.
      try {
        const result = await submitContact(data);

        if (result.ok) {
          setStatus('success');
          reset();
          // Reset the Turnstile widget so a fresh token is ready if the user submits again.
          turnstileRef.current?.reset();
        } else if (result.error === 'turnstile') {
          setStatus('turnstile');
          // Reset widget so user can get a fresh token and retry.
          turnstileRef.current?.reset();
          setValue('turnstileToken', '');
        } else if (result.error === 'send') {
          setStatus('send');
        } else {
          setStatus('unknown');
        }
      } catch {
        setStatus('unknown');
      }
    },
    [reset, setValue],
  );

  // ── Success state ────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-[var(--radius-sm)] border border-[var(--border)] p-6 text-[var(--foreground)]"
      >
        {t('success')}
      </div>
    );
  }

  const isSubmitting = status === 'submitting';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label={t('title')}
      className="flex flex-col gap-5"
    >
      {/* ── Top-level error banners (preserved form state) ──────────────────── */}
      {(status === 'turnstile' || status === 'send' || status === 'unknown') && (
        <div role="alert" aria-live="assertive" className="text-sm text-[var(--accent-text)]">
          {status === 'turnstile'
            ? t('errors.turnstile')
            : status === 'send'
              ? t('errors.send')
              : t('errors.unknown')}
        </div>
      )}

      {/* ── Name ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-name" className="text-sm font-medium text-[var(--foreground)]">
          {t('fields.name.label')}
        </label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          placeholder={t('fields.name.placeholder')}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          {...register('name')}
          disabled={isSubmitting}
          className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] disabled:opacity-60"
        />
        {errors.name && (
          <p id="contact-name-error" role="alert" className="text-xs text-[var(--accent-text)]">
            {errors.name.message ?? t('fields.name.errorRequired')}
          </p>
        )}
      </div>

      {/* ── Email ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-email" className="text-sm font-medium text-[var(--foreground)]">
          {t('fields.email.label')}
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          placeholder={t('fields.email.placeholder')}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          {...register('email')}
          disabled={isSubmitting}
          className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] disabled:opacity-60"
        />
        {errors.email && (
          <p id="contact-email-error" role="alert" className="text-xs text-[var(--accent-text)]">
            {errors.email.message ?? t('fields.email.errorInvalid')}
          </p>
        )}
      </div>

      {/* ── Company (optional) ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-company" className="text-sm font-medium text-[var(--foreground)]">
          {t('fields.company.label')}
        </label>
        <input
          id="contact-company"
          type="text"
          autoComplete="organization"
          placeholder={t('fields.company.placeholder')}
          aria-invalid={errors.company ? 'true' : 'false'}
          aria-describedby={errors.company ? 'contact-company-error' : undefined}
          {...register('company')}
          disabled={isSubmitting}
          className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] disabled:opacity-60"
        />
        {errors.company && (
          <p id="contact-company-error" role="alert" className="text-xs text-[var(--accent-text)]">
            {errors.company.message}
          </p>
        )}
      </div>

      {/* ── Project type (dropdown) ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="contact-project-type"
          className="text-sm font-medium text-[var(--foreground)]"
        >
          {t('fields.projectType.label')}
        </label>
        <select
          id="contact-project-type"
          aria-invalid={errors.project_type ? 'true' : 'false'}
          aria-describedby={errors.project_type ? 'contact-project-type-error' : undefined}
          {...register('project_type')}
          disabled={isSubmitting}
          defaultValue=""
          className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] disabled:opacity-60"
        >
          <option value="" disabled>
            {t('fields.projectType.placeholder')}
          </option>
          {PROJECT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1).replace('-', '-')}
            </option>
          ))}
        </select>
        {errors.project_type && (
          <p
            id="contact-project-type-error"
            role="alert"
            className="text-xs text-[var(--accent-text)]"
          >
            {errors.project_type.message ?? t('fields.projectType.errorRequired')}
          </p>
        )}
      </div>

      {/* ── Message ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-message" className="text-sm font-medium text-[var(--foreground)]">
          {t('fields.message.label')}
        </label>
        <textarea
          id="contact-message"
          rows={6}
          placeholder={t('fields.message.placeholder')}
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          {...register('message')}
          disabled={isSubmitting}
          className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] disabled:opacity-60 resize-y"
        />
        {errors.message && (
          <p id="contact-message-error" role="alert" className="text-xs text-[var(--accent-text)]">
            {errors.message.message ?? t('fields.message.errorInvalid')}
          </p>
        )}
      </div>

      {/* ── Turnstile invisible widget ───────────────────────────────────────── */}
      {/*
        [design §7.5] appearance="execute" + execution="execute" = invisible mode.
        Widget is not visible to the user. onSuccess fires once the token is ready.
        We store it in the RHF form state via setValue('turnstileToken', token).
      */}
      <Turnstile
        ref={turnstileRef}
        siteKey={TURNSTILE_SITE_KEY}
        options={{
          // [design §7.5] Invisible mode: appearance="execute" + execution="execute".
          // Widget is not visible; token is fetched automatically on render.
          appearance: 'execute',
          execution: 'execute',
        }}
        onSuccess={(token) => {
          setValue('turnstileToken', token, { shouldValidate: false });
        }}
        onExpire={() => {
          setValue('turnstileToken', '', { shouldValidate: false });
        }}
        onError={() => {
          setValue('turnstileToken', '', { shouldValidate: false });
        }}
      />

      {/* ── Submit button ────────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent-base)] px-6 py-3 text-sm font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Spinner />
            <span>{t('submitLoading')}</span>
          </>
        ) : (
          t('submit')
        )}
      </button>
    </form>
  );
}

/** Minimal inline spinner — no extra dep. aria-hidden; parent provides accessible label. */
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
