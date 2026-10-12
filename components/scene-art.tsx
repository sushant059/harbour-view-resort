/* Illustrative before/after scenes, shown only until real job photos are uploaded.
   Each scene is labelled "Illustrative" so nobody mistakes it for a past job. */

const DIRT = "#8A7461";

function Room({ clean, id, children, floor = true }: { clean: boolean; id: string; children?: React.ReactNode; floor?: boolean }) {
  const wall = clean ? "#F4F8FD" : "#E6E1D8";
  return (
    <svg viewBox="0 0 640 480" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <pattern id={`grime-${id}`} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="4" r="1.6" fill={DIRT} opacity=".35" />
          <circle cx="12" cy="13" r="1.2" fill={DIRT} opacity=".3" />
        </pattern>
        <linearGradient id={`light-${id}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" fill={wall} />
      {/* Window with a Top End palm */}
      <rect x="420" y="40" width="160" height="130" rx="10" fill={clean ? "#BFE3FB" : "#C9CED2"} stroke="#ffffff" strokeWidth="10" />
      <path d="M500 170 C496 130 502 110 512 92" stroke={clean ? "#7A5B3A" : "#857565"} strokeWidth="6" fill="none" />
      <g fill={clean ? "#3BA935" : "#7E8C6F"}>
        <path d="M512 92c-20-12-44-8-58 6 20-4 38 0 58-6Z" />
        <path d="M512 92c18-14 42-12 56 2-20-4-38-2-56-2Z" />
        <path d="M512 92c-4-18 6-36 22-44-6 16-10 30-22 44Z" />
        <path d="M512 92c-14 6-26 22-26 40 8-14 16-26 26-40Z" />
      </g>
      <path d="M500 40v130M420 105h160" stroke="#ffffff" strokeWidth="6" />
      {floor && (
        <>
          <path d="M0 260 H640 V480 H0 Z" fill={clean ? "#C9D9EA" : "#A99C8C"} />
          <path d="M0 260 H640" stroke={clean ? "#B4C8DE" : "#9A8D7D"} strokeWidth="8" />
          {!clean && <path d="M0 260 H640 V480 H0 Z" fill={`url(#grime-${id})`} />}
          {clean && <path d="M40 300 H600 V340 H40Z M40 380 H600 V420 H40Z" fill="#ffffff" opacity=".22" />}
        </>
      )}
      {children}
      {!clean && <rect width="640" height="480" fill="#7A6A55" opacity=".08" />}
      {clean && (
        <>
          <path d="M0 0 L640 0 L0 480Z" fill={`url(#light-${id})`} opacity=".35" />
          <g fill="#2E9BEA">
            <path d="M120 80l8 18 18 8-18 8-8 18-8-18-18-8 18-8Z" />
            <path d="M175 140l5 11 11 5-11 5-5 11-5-11-11-5 11-5Z" />
            <path d="M600 230l6 13 13 6-13 6-6 13-6-13-13-6 13-6Z" />
          </g>
        </>
      )}
    </svg>
  );
}

function Stains({ items }: { items: [number, number, number, number][] }) {
  return (
    <g>
      {items.map(([cx, cy, rx, ry], index) => (
        <ellipse key={index} cx={cx} cy={cy} rx={rx} ry={ry} fill={DIRT} opacity={0.45 + (index % 3) * 0.12} />
      ))}
    </g>
  );
}

function Sofa({ clean, fabric }: { clean: boolean; fabric: string }) {
  const base = clean ? fabric : "#A7988A";
  const cushion = clean ? "#ffffff" : "#C4B6A6";
  return (
    <g>
      <rect x="110" y="190" width="420" height="130" rx="34" fill={base} />
      <rect x="90" y="220" width="60" height="120" rx="24" fill={base} />
      <rect x="490" y="220" width="60" height="120" rx="24" fill={base} />
      <rect x="150" y="250" width="160" height="60" rx="18" fill={cushion} opacity=".55" />
      <rect x="330" y="250" width="160" height="60" rx="18" fill={cushion} opacity=".55" />
      <rect x="120" y="340" width="16" height="30" fill="#5A4636" />
      <rect x="504" y="340" width="16" height="30" fill="#5A4636" />
    </g>
  );
}

export function SceneArt({ scene, clean, alt, label = true }: { scene: string; clean: boolean; alt: string; label?: boolean }) {
  const key = /couch|sofa/.test(scene)
    ? "couch"
    : /uphol|chair/.test(scene)
      ? "chair"
      : /mattress/.test(scene)
        ? "mattress"
        : /rug/.test(scene)
          ? "rug"
          : /(^|-)pet(-|$)/.test(scene)
            ? "pet"
            : /bond|lease/.test(scene)
              ? "bond"
              : /office/.test(scene)
                ? "office"
                : /emergency|flood/.test(scene)
                  ? "emergency"
                  : "carpet";
  const id = `${key}-${clean ? "a" : "b"}`;
  return (
    <div className="relative h-full w-full bg-mist" aria-label={alt} role="img">
      {key === "carpet" && (
        <Room clean={clean} id={id}>
          {!clean && <Stains items={[[160, 360, 70, 22], [330, 420, 46, 14], [470, 330, 30, 10], [250, 300, 120, 10]]} />}
          {!clean && <path d="M60 470 C200 380 320 360 640 300" stroke={DIRT} strokeWidth="60" opacity=".25" fill="none" />}
        </Room>
      )}
      {key === "couch" && (
        <Room clean={clean} id={id}>
          <Sofa clean={clean} fabric="#5B8FC7" />
          {!clean && <Stains items={[[220, 270, 34, 12], [400, 282, 22, 9], [120, 260, 16, 26]]} />}
        </Room>
      )}
      {key === "chair" && (
        <Room clean={clean} id={id}>
          <g>
            <rect x="230" y="150" width="180" height="160" rx="30" fill={clean ? "#3BA935" : "#8F9580"} />
            <rect x="210" y="270" width="220" height="70" rx="24" fill={clean ? "#58BC52" : "#9AA08A"} />
            <rect x="230" y="340" width="14" height="60" fill="#5A4636" />
            <rect x="396" y="340" width="14" height="60" fill="#5A4636" />
          </g>
          {!clean && <Stains items={[[300, 300, 30, 10], [350, 210, 18, 22]]} />}
        </Room>
      )}
      {key === "mattress" && (
        <Room clean={clean} id={id}>
          <rect x="80" y="210" width="480" height="170" rx="26" fill={clean ? "#ffffff" : "#EADBB8"} stroke={clean ? "#D6ECFC" : "#CDBB94"} strokeWidth="8" />
          <path d="M100 260 H540 M100 310 H540" stroke={clean ? "#D6ECFC" : "#D8C59C"} strokeWidth="5" strokeDasharray="14 10" />
          {!clean && <Stains items={[[240, 290, 70, 28], [420, 330, 40, 16]]} />}
          <rect x="70" y="380" width="500" height="34" rx="10" fill={clean ? "#0B2F5E" : "#5E5A55"} />
        </Room>
      )}
      {key === "rug" && (
        <Room clean={clean} id={id}>
          <rect x="90" y="290" width="460" height="160" rx="10" fill={clean ? "#0067B1" : "#6F7178"} />
          <rect x="120" y="312" width="400" height="116" fill="none" stroke={clean ? "#FFB547" : "#968B7C"} strokeWidth="10" />
          <path d="M320 330 l50 40 -50 40 -50 -40Z" fill={clean ? "#3BA935" : "#837C70"} />
          {!clean && <Stains items={[[200, 380, 40, 14], [430, 350, 28, 10]]} />}
        </Room>
      )}
      {key === "pet" && (
        <Room clean={clean} id={id}>
          {!clean && <Stains items={[[230, 380, 64, 22], [360, 420, 34, 12]]} />}
          <g fill={clean ? "#E0B07C" : "#B39272"}>
            <ellipse cx="500" cy="380" rx="56" ry="30" />
            <circle cx="548" cy="344" r="24" />
            <path d="M538 322l-6-22 16 12Z M560 322l6-22-16 12Z" />
          </g>
          <circle cx="556" cy="342" r="3.5" fill="#0C1B2F" />
        </Room>
      )}
      {key === "bond" && (
        <Room clean={clean} id={id}>
          <rect x="60" y="120" width="80" height="140" rx="6" fill={clean ? "#ffffff" : "#D4CCBF"} stroke="#B9B0A3" strokeWidth="4" />
          <circle cx="126" cy="196" r="5" fill="#8A7461" />
          {!clean && <Stains items={[[230, 360, 60, 18], [420, 410, 44, 14], [520, 320, 22, 8]]} />}
          {!clean && <rect x="300" y="190" width="40" height="30" fill={DIRT} opacity=".35" />}
          <g transform="translate(300 300)">
            <rect width="90" height="56" rx="8" fill={clean ? "#3BA935" : "#7E7363"} />
            <path d="M20 28h50M45 12v32" stroke="#ffffff" strokeWidth="6" opacity={clean ? 1 : 0} />
          </g>
        </Room>
      )}
      {key === "office" && (
        <Room clean={clean} id={id}>
          <rect x="70" y="200" width="260" height="16" fill={clean ? "#0B2F5E" : "#5E5A55"} />
          <rect x="84" y="216" width="12" height="90" fill="#3D4A5C" />
          <rect x="304" y="216" width="12" height="90" fill="#3D4A5C" />
          <rect x="150" y="150" width="90" height="50" rx="6" fill={clean ? "#2E9BEA" : "#7B8794"} />
          <rect x="380" y="220" width="80" height="90" rx="14" fill={clean ? "#0067B1" : "#6E7883"} />
          <rect x="414" y="310" width="12" height="50" fill="#3D4A5C" />
          {!clean && <path d="M0 400 C200 360 420 380 640 350" stroke={DIRT} strokeWidth="40" opacity=".3" fill="none" />}
        </Room>
      )}
      {key === "emergency" && (
        <Room clean={clean} id={id}>
          {!clean && <path d="M0 330 C140 290 220 420 360 350 C460 300 540 410 640 340 V480 H0Z" fill="#6FA9CF" opacity=".75" />}
          {!clean && <path d="M80 380 q20 -10 40 0 M300 420 q20 -10 40 0 M480 400 q20 -10 40 0" stroke="#ffffff" strokeWidth="4" fill="none" opacity=".7" />}
        </Room>
      )}
      {label && <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate">Illustrative</span>}
    </div>
  );
}
