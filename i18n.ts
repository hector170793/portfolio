// [design §1] Root re-export for next-intl request config.
// next-intl looks for i18n.ts at the project root by default.
// This re-exports the getRequestConfig from lib/i18n/request.ts.

export { default } from '@/lib/i18n/request';
