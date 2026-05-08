'use client';

/**
 * MDXContent — client component to render velite MDX function-body output.
 *
 * Velite compiles MDX to a JavaScript function-body string (outputFormat:'function-body').
 * To render it, we evaluate it via new Function() and call the resulting React component.
 *
 * This is a CLIENT component because new Function() is not available in Node.js RSC
 * streaming contexts without careful coordination. Making it a client component also
 * means the MDX runtime (Fragment, jsx, jsxs from React) is available client-side.
 *
 * Usage:
 *   <MDXContent code={entry.body} />
 *
 * Note: The body prop should only contain server-generated velite output — never
 * user-supplied strings. This is safe because velite processes content at build time.
 */

import { useMemo } from 'react';
import * as runtime from 'react/jsx-runtime';

interface MDXContentProps {
  /** Serialized MDX function-body string from velite s.mdx() */
  code: string;
  /** Optional component overrides for MDX elements (merged on top of defaults) */
  components?: Record<string, React.ComponentType<Record<string, unknown>>>;
}

/**
 * Slugify h2 text content for in-page anchor IDs (e.g., "Brief" → "brief",
 * "Key Outcomes" → "key-outcomes"). Used by case study ChapterTOC scroll-spy.
 */
function slugify(input: unknown): string {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Default h2 renderer — auto-generates slug IDs from heading text.
 * Allows ChapterTOC scroll-spy to target chapter anchors without
 * requiring rehype-slug in the velite pipeline.
 */
function H2WithSlug(props: Record<string, unknown>): React.ReactElement {
  const {
    children,
    id: explicitId,
    ...rest
  } = props as {
    children?: React.ReactNode;
    id?: string;
  };
  const id = explicitId ?? slugify(children);
  return (
    <h2 id={id} {...rest}>
      {children}
    </h2>
  );
}

const DEFAULT_COMPONENTS = {
  h2: H2WithSlug as React.ComponentType<Record<string, unknown>>,
};

export function MDXContent({ code, components = {} }: MDXContentProps): React.ReactElement | null {
  const Component = useMemo(() => {
    try {
      const fn = new Function(code);
      const merged = { ...DEFAULT_COMPONENTS, ...components };
      // biome-ignore lint/suspicious/noExplicitAny: MDX runtime function signature
      const result = fn({ ...runtime, components: merged } as any);
      return result?.default ?? null;
    } catch (e) {
      console.error('MDXContent: failed to evaluate MDX body', e);
      return null;
    }
  }, [code, components]);

  if (!Component) return null;
  return <Component />;
}
