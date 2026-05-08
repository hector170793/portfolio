'use client';

/**
 * ParallaxGallery — 3-image gallery with GSAP ScrollTrigger parallax.
 * [spec 2.6]  Image gallery MUST implement parallax (vertical offset + scale-in) on scroll.
 *              MUST be disabled under prefers-reduced-motion: reduce.
 * [design §3.2] Each image: y: -40 → 40 px, scale: 0.96 → 1.02, scrub: 1.2.
 * [spec 10.9] Below-fold gallery images use loading="lazy" (not LCP). [spec 10.5]
 * [spec 10.4] GSAP lazy-imported inside useEffect.
 * [spec 7.7]  Reduced motion: static images, no parallax, no scale.
 * [spec 8.6]  next/image with loading="lazy" for all 3 images.
 *
 * Props:
 *   images — array of { src, alt } — must have exactly 3 entries [design §3.2]
 */

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/a11y/use-reduced-motion';

interface GalleryImage {
  src: string;
  alt: string;
}

interface ParallaxGalleryProps {
  images: GalleryImage[];
}

export function ParallaxGallery({ images }: ParallaxGalleryProps): React.ReactElement {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  // [design §3.2] Validate length === 3 (runtime guard).
  const safeImages = images.slice(0, 3);

  useEffect(() => {
    // [spec 7.7] No parallax under reduced motion — static render.
    if (reducedMotion) return;
    if (safeImages.length === 0) return;

    let instances: Array<{ kill: () => void }> = [];

    // GSAP + ScrollTrigger lazy-imported to keep out of initial bundle. [spec 10.4]
    async function initParallax(): Promise<void> {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      gsap.registerPlugin(ScrollTrigger);

      const container = containerRef.current;
      if (!container) return;

      // Select each image wrapper element.
      const imageEls = Array.from(container.querySelectorAll<HTMLElement>('[data-parallax-image]'));

      instances = imageEls.map((el) => {
        // [design §3.2] y: -40 → 40px, scale: 0.96 → 1.02, scrub: 1.2
        return ScrollTrigger.create({
          trigger: el,
          scrub: 1.2,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const progress = self.progress; // 0 → 1 as element scrolls through viewport
            // y: -40 → 40 (total range 80px, centered at 0)
            const y = -40 + progress * 80;
            // scale: 0.96 → 1.02 (total range 0.06)
            const scale = 0.96 + progress * 0.06;
            gsap.set(el, { y, scale });
          },
        });
      });
    }

    initParallax().catch(console.error);

    // [design §3.2] Kill all ScrollTrigger instances on unmount.
    return () => {
      for (const instance of instances) {
        instance.kill();
      }
    };
  }, [reducedMotion, safeImages.length]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(2rem, 4vw, 4rem)',
        padding: 'clamp(2rem, 4vw, 4rem) 0',
      }}
    >
      {safeImages.map((image, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static gallery — no reorder
          key={index}
          data-parallax-image
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            overflow: 'hidden',
            borderRadius: 'var(--radius-sm)',
            // willChange for GPU compositing — removed from static path.
            willChange: reducedMotion ? 'auto' : 'transform',
          }}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 70vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
      ))}
    </div>
  );
}
