/* Flat illustrations of the Spotless NT team in branded uniform.
   They use the real logo mark on the shirt so the look carries through until
   real team photos are uploaded in admin. */

type Look = { skin: string; hair: string; style: "short" | "bun" | "cap" };

const LOOKS: Look[] = [
  { skin: "#C68A5E", hair: "#1E1A18", style: "cap" },
  { skin: "#F0C9A4", hair: "#7A4B2A", style: "bun" },
  { skin: "#8D5A3B", hair: "#141212", style: "short" },
];

function Head({ look }: { look: Look }) {
  return (
    <g>
      <rect x="186" y="150" width="28" height="34" rx="10" fill={look.skin} />
      <circle cx="200" cy="118" r="44" fill={look.skin} />
      <circle cx="157" cy="122" r="9" fill={look.skin} />
      <circle cx="243" cy="122" r="9" fill={look.skin} />
      {look.style === "short" && <path d="M156 112c0-30 20-46 44-46s44 16 44 46c-8-14-24-22-44-22s-36 8-44 22Z" fill={look.hair} />}
      {look.style === "bun" && (
        <g fill={look.hair}>
          <circle cx="200" cy="66" r="18" />
          <path d="M155 118c-2-34 20-50 45-50s47 16 45 50c-10-18-26-28-45-28s-35 10-45 28Z" />
        </g>
      )}
      {look.style === "cap" && (
        <g>
          <path d="M156 108c0-28 20-44 44-44s44 16 44 44Z" fill="#0B2F5E" />
          <path d="M236 104h40c4 0 4 8 0 8h-40Z" fill="#0B2F5E" />
          <circle cx="200" cy="86" r="9" fill="#ffffff" />
          <path d="M200 79l1.6 5.4L207 86l-5.4 1.6L200 93l-1.6-5.4L193 86l5.4-1.6Z" fill="#2E9BEA" />
        </g>
      )}
      <circle cx="184" cy="122" r="4" fill="#0C1B2F" />
      <circle cx="216" cy="122" r="4" fill="#0C1B2F" />
      <path d="M186 140c8 8 20 8 28 0" stroke="#0C1B2F" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Polo({ id }: { id: string }) {
  return (
    <g>
      <path d="M112 236c0-30 22-52 52-56l36 14 36-14c30 4 52 26 52 56v170H112Z" fill="#0B2F5E" />
      <path d="M164 180l36 30 36-30-12-4-24 18-24-18Z" fill="#0067B1" />
      <path d="M200 210v52" stroke="#16407A" strokeWidth="4" />
      <circle cx="200" cy="226" r="3.5" fill="#D6ECFC" />
      <circle cx="200" cy="246" r="3.5" fill="#D6ECFC" />
      <circle cx="244" cy="252" r="23" fill="#ffffff" />
      <clipPath id={`badge-${id}`}><circle cx="244" cy="252" r="20" /></clipPath>
      <image href="/hvr-mark.png" x="224" y="232" width="40" height="40" clipPath={`url(#badge-${id})`} />
      <path d="M112 300h176" stroke="#3BA935" strokeWidth="6" opacity=".9" />
    </g>
  );
}

export function Technician({ variant = 0, className, title }: { variant?: number; className?: string; title?: string }) {
  const look = LOOKS[variant % LOOKS.length];
  const id = `tech-${variant}`;
  return (
    <svg viewBox="0 0 400 480" className={className} role="img" aria-label={title || "Spotless NT technician in a branded uniform"}>
      <circle cx="200" cy="250" r="190" fill="#D6ECFC" />
      <path d="M40 330c80-60 240-60 320 0" stroke="#3BA935" strokeWidth="10" fill="none" strokeLinecap="round" opacity=".7" />
      <Polo id={id} />
      <path d="M112 240c-24 30-30 80-20 120" stroke="#0B2F5E" strokeWidth="34" strokeLinecap="round" fill="none" />
      <path d="M92 352c4 22 20 34 44 30" stroke={look.skin} strokeWidth="24" strokeLinecap="round" fill="none" />
      <path d="M288 240c24 30 28 70 10 104" stroke="#0B2F5E" strokeWidth="34" strokeLinecap="round" fill="none" />
      <path d="M298 340c-12 18-30 30-52 34" stroke={look.skin} strokeWidth="24" strokeLinecap="round" fill="none" />
      <path d="M150 380 330 470" stroke="#9FB3C8" strokeWidth="10" strokeLinecap="round" />
      <rect x="300" y="452" width="80" height="22" rx="8" fill="#0067B1" transform="rotate(26 340 463)" />
      <circle cx="140" cy="378" r="14" fill={look.skin} />
      <circle cx="250" cy="374" r="14" fill={look.skin} />
      <Head look={look} />
      <g fill="#2E9BEA">
        <path d="M330 90l6 14 14 6-14 6-6 14-6-14-14-6 14-6Z" />
        <path d="M360 150l4 8 8 4-8 4-4 8-4-8-8-4 8-4Z" />
        <path d="M60 120l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" />
      </g>
    </svg>
  );
}

/** The uniform: front and back of the team shirt. */
export function UniformMockup({ phone, className }: { phone: string; className?: string }) {
  const shirt = "M60 40 110 18c10 18 30 28 50 28s40-10 50-28l50 22 40 70-46 24-14-26v232H80V108l-14 26-46-24Z";
  return (
    <svg viewBox="0 0 700 380" className={className} role="img" aria-label="Spotless NT team shirt, front and back">
      <g>
        <path d={shirt} fill="#0B2F5E" />
        <path d="M110 18c10 18 30 28 50 28s40-10 50-28l-12-4c-8 14-22 20-38 20s-30-6-38-20Z" fill="#0067B1" />
        <circle cx="218" cy="112" r="24" fill="#ffffff" />
        <clipPath id="front-badge"><circle cx="218" cy="112" r="21" /></clipPath>
        <image href="/hvr-mark.png" x="197" y="91" width="42" height="42" clipPath="url(#front-badge)" />
        <path d="M80 300h160" stroke="#3BA935" strokeWidth="6" />
        <text x="160" y="370" textAnchor="middle" fontSize="16" fontWeight="700" fill="#4A5D75" fontFamily="var(--font-body), sans-serif">FRONT</text>
      </g>
      <g transform="translate(360 0)">
        <path d={shirt} fill="#0B2F5E" />
        <path d="M118 22c12 12 26 16 42 16s30-4 42-16" stroke="#0067B1" strokeWidth="8" fill="none" />
        <circle cx="160" cy="130" r="54" fill="#ffffff" />
        <clipPath id="back-badge"><circle cx="160" cy="130" r="50" /></clipPath>
        <image href="/hvr-mark.png" x="110" y="80" width="100" height="100" clipPath="url(#back-badge)" />
        <text x="160" y="220" textAnchor="middle" fontSize="28" fontWeight="800" fill="#ffffff" fontFamily="var(--font-display), sans-serif">SPOTLESS NT</text>
        <text x="160" y="244" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="3" fill="#D6ECFC" fontFamily="var(--font-body), sans-serif">CLEANING SERVICES</text>
        <text x="160" y="280" textAnchor="middle" fontSize="15" fontWeight="700" fill="#3BA935" fontFamily="var(--font-body), sans-serif">{phone}</text>
        <text x="160" y="370" textAnchor="middle" fontSize="16" fontWeight="700" fill="#4A5D75" fontFamily="var(--font-body), sans-serif">BACK</text>
      </g>
    </svg>
  );
}
