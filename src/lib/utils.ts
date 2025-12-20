import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fast smooth scroll to a target position or element
 * @param target - Y position in pixels, Element, or selector string
 * @param duration - Animation duration in ms (default: 400ms for fast scroll)
 * @param offset - Offset from top in pixels (default: 0)
 */
export function smoothScrollTo(
  target: number | Element | string,
  duration: number = 400,
  offset: number = 0
) {
  let targetY: number;

  if (typeof target === 'number') {
    targetY = target;
  } else if (typeof target === 'string') {
    const element = document.querySelector(target);
    if (!element) return;
    targetY = element.getBoundingClientRect().top + window.scrollY - offset;
  } else {
    targetY = target.getBoundingClientRect().top + window.scrollY - offset;
  }

  const startY = window.scrollY;
  const difference = targetY - startY;
  const startTime = performance.now();

  // Easing function for smooth deceleration
  const easeOutQuad = (t: number): number => t * (2 - t);

  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuad(progress);

    window.scrollTo(0, startY + difference * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

/**
 * Scroll an element into view with fast smooth scrolling
 * @param element - Element to scroll into view
 * @param duration - Animation duration in ms (default: 400ms)
 * @param offset - Offset from top in pixels (default: 80 for nav height)
 */
export function scrollIntoViewFast(
  element: Element | null,
  duration: number = 400,
  offset: number = 80
) {
  if (!element) return;
  smoothScrollTo(element, duration, offset);
}
