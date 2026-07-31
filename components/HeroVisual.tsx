/**
 * Decorative hero motif — echoes the brand mark (gold corner brackets framing a
 * serif "A") at editorial scale. Flat surfaces only: no gradients, shadows, or
 * glow, per the design system. Purely decorative, so it's hidden from a11y tree.
 */
export default function HeroVisual() {
  return (
    <div className="relative aspect-square w-full max-w-sm mx-auto" aria-hidden="true">
      <svg
        viewBox="0 0 340 340"
        fill="none"
        className="w-full h-full text-gold"
        role="presentation"
      >
        {/* faint concentric hairline frames for depth */}
        <rect x="8" y="8" width="324" height="324" rx="16" stroke="currentColor" strokeOpacity="0.08" />
        <rect x="40" y="40" width="260" height="260" rx="10" stroke="currentColor" strokeOpacity="0.14" />

        {/* clay accent tick — small nod to the secondary accent */}
        <line x1="170" y1="12" x2="170" y2="34" stroke="var(--color-clay)" strokeOpacity="0.5" strokeWidth="2" />

        {/* gold corner brackets (the logo-mark motif) */}
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.85">
          <path d="M40 84 V40 H84" />
          <path d="M256 40 H300 V84" />
          <path d="M300 256 V300 H256" />
          <path d="M84 300 H40 V256" />
        </g>

        {/* serif A */}
        <text
          x="170"
          y="228"
          textAnchor="middle"
          className="font-heading"
          fontSize="180"
          fontWeight="500"
          fill="currentColor"
          fillOpacity="0.9"
        >
          A
        </text>
      </svg>
    </div>
  );
}
