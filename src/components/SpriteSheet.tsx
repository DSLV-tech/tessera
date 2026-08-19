/**
 * Sprite sheet SVG (symbol + use): pedine e marcatori disegnati una volta e
 * riusati su ogni casella. Restano vettoriali e nitidi a ogni scala, e vivono
 * nel bundle single-file. Montato una sola volta nell'app.
 */
export function SpriteSheet(): React.JSX.Element {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <defs>
        {/* Pedina — gemma di ossidiana lucidata */}
        <radialGradient id="spr-stone-body" cx="36%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#6b4d34" />
          <stop offset="42%" stopColor="#3d2a1b" />
          <stop offset="100%" stopColor="#140d07" />
        </radialGradient>
        <radialGradient id="spr-stone-hi" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff3dd" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff3dd" stopOpacity="0" />
        </radialGradient>
        <symbol id="spr-stone" viewBox="0 0 100 100">
          <ellipse cx="50" cy="56" rx="44" ry="42" fill="#000" opacity="0.35" />
          <circle cx="50" cy="50" r="45" fill="url(#spr-stone-body)" />
          <path
            d="M50 6a44 44 0 0 1 40 62 45 45 0 1 0-80 0A44 44 0 0 1 50 6z"
            fill="#c79a5f"
            opacity="0.22"
          />
          <ellipse cx="38" cy="34" rx="17" ry="12" fill="url(#spr-stone-hi)" transform="rotate(-28 38 34)" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="#000" strokeOpacity="0.4" strokeWidth="2" />
        </symbol>

        {/* Città (ponti) — gemma sfaccettata blu */}
        <linearGradient id="spr-city-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a9c6ec" />
          <stop offset="55%" stopColor="#6f97cc" />
          <stop offset="100%" stopColor="#3a5f95" />
        </linearGradient>
        <symbol id="spr-city" viewBox="0 0 100 100">
          <path d="M50 8 L86 40 L50 94 L14 40 Z" fill="url(#spr-city-g)" stroke="#20365a" strokeWidth="4" strokeLinejoin="round" />
          <path d="M50 8 L86 40 L50 52 L14 40 Z" fill="#ffffff" opacity="0.28" />
          <path d="M50 52 L86 40 L50 94 Z" fill="#000000" opacity="0.14" />
        </symbol>

        {/* Marea (assedio) — goccia d'acqua */}
        <radialGradient id="spr-drop-g" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#7fd8c4" />
          <stop offset="55%" stopColor="#2f8f78" />
          <stop offset="100%" stopColor="#123a30" />
        </radialGradient>
        <symbol id="spr-drop" viewBox="0 0 100 100">
          <path
            d="M50 10 C70 40 82 54 82 66 a32 32 0 1 1-64 0 C18 54 30 40 50 10 Z"
            fill="url(#spr-drop-g)"
            stroke="#0c2a22"
            strokeWidth="3"
          />
          <ellipse cx="40" cy="52" rx="8" ry="12" fill="#ffffff" opacity="0.4" transform="rotate(-20 40 52)" />
        </symbol>
      </defs>
    </svg>
  );
}
