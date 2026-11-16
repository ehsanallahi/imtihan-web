"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Reveals every [data-reveal] element as it scrolls into view (styles in globals.css).
 * Mounted once in the layout; re-scans when the page changes.
 */
export function ScrollReveals() {
  const pathname = usePathname();

  useEffect(() => {
    const hidden = document.querySelectorAll("[data-reveal]:not([data-shown])");
    if (!("IntersectionObserver" in window)) {
      hidden.forEach((el) => (el.dataset.shown = "1"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.dataset.shown = "1";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    hidden.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

/** The hero's 3D stage: whatever is inside tilts toward the mouse. Touch is ignored. */
export function TiltStage({ className, children }) {
  const ref = useRef(null);

  function onPointerMove(event) {
    if (event.pointerType !== "mouse") return;
    const box = ref.current.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    ref.current.style.setProperty("--tilt-y", `${x * 18}deg`);
    ref.current.style.setProperty("--tilt-x", `${-y * 12}deg`);
  }

  function onPointerLeave() {
    ref.current.style.removeProperty("--tilt-y");
    ref.current.style.removeProperty("--tilt-x");
  }

  return (
    <div ref={ref} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className={className}>
      {children}
    </div>
  );
}
