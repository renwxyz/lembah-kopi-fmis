"use client";

import { useEffect } from "react";

/**
 * Animasi muncul sekali (fade + geser naik ringan) untuk elemen ber-atribut data-reveal.
 * Hanya elemen yang masih di bawah layar yang disembunyikan, dan hanya setelah hidrasi,
 * sehingga tanpa JavaScript atau saat prefers-reduced-motion semua konten tetap terlihat.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    ).filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.9);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el) => {
      el.classList.add("reveal-init");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
