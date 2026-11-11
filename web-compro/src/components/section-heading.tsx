interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  /** Warna teks untuk latar gelap */
  tone?: "light" | "dark";
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "light",
}: SectionHeadingProps) {
  const isCenter = align === "center";
  return (
    <div
      className={`mb-12 max-w-2xl ${isCenter ? "mx-auto text-center" : "text-left"}`}
    >
      {eyebrow && (
        <span
          className={`text-[13px] font-semibold uppercase tracking-[0.14em] ${
            tone === "dark" ? "text-sage-300" : "text-text-muted"
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`mt-2 font-heading text-[1.75rem] font-bold leading-[1.15] sm:text-3xl lg:text-[40px] text-balance ${
          tone === "dark" ? "text-surface" : "text-coffee-900"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-lg ${
            tone === "dark" ? "text-surface/80" : "text-text-muted"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
