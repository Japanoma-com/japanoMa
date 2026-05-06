'use client';

import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * HeroIllustration — Ippitsu Sanzan (一筆三山)
 *
 * Three peaks with the same shapes as the separate version,
 * connected into one continuous path so the stroke-dashoffset
 * animation draws them in a single sweep: left → centre → right.
 *
 * The connecting segments through the valleys are part of the stroke
 * but sit at the baseline, creating natural valley lines between peaks.
 */
export function HeroIllustration({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  const a = (c: string) => (reducedMotion ? '' : c);

  // One continuous path: left peak → valley → centre peak → valley → right peak
  // Same peak shapes as the three-separate version, joined at the valleys
  const mountainPath =
    // Left edge rising
    'M-20 580 Q80 575 180 560 Q260 540 320 505 ' +
    // Left peak (tall)
    'Q355 470 375 420 Q390 370 398 330 Q404 300 408 280 ' +
    // Left summit (rounded)
    'Q412 280 416 300 Q422 330 430 370 ' +
    // Valley (barely dips, stays around y380)
    'Q440 390 460 395 C490 400 530 395 560 380 ' +
    // Rise to main peak
    'Q580 362 600 330 Q625 280 645 225 ' +
    'Q660 180 670 155 Q678 138 682 130 ' +
    // Summit, spiral starts immediately
    'Q686 130 690 145 ' +
    // S-curve spiral: drifts right while descending gradually
    // Each swing wider, overall descent is gentle (more horizontal than vertical)
    'C720 190 770 240 760 270 ' +       // swing 1: tight, 40px wide
    'C750 300 720 320 760 350 ' +       // swing 2: 50px wide
    'C800 380 850 400 830 420 ' +       // swing 3: 60px wide
    'C810 440 770 455 825 480 ' +       // swing 4: 70px wide
    'C880 505 940 520 910 535 ' +       // swing 5: 80px wide
    'C880 550 845 560 910 580 ' +       // swing 6: 85px wide
    // Trail off gently to the right
    'C975 600 1030 610 1080 615 ' +
    'Q1130 618 1190 620 Q1240 621 1280 622';

  const washPath = mountainPath + ' L1240 800 L-20 800 Z';

  const distantPath =
    'M30 700 Q200 692 400 685 Q550 675 660 660 ' +
    'Q720 650 780 655 Q900 668 1050 680 Q1150 688 1250 695';

  return (
    <div
      className={className}
      aria-hidden="true"
      // Performance: promote the whole illustration to its own compositing
      // layer so Safari/mobile rasterize the heavy SVG filters once and
      // composite the cached bitmap each frame instead of recomputing the
      // feTurbulence + feDisplacementMap noise on every paint. Without this
      // the draw-stroke animation forces Safari to re-run the filter pipeline
      // for every visible-region change, dropping below 30fps on mobile.
      // contain: paint constrains the repaint region; isolation creates a
      // stacking context so the rest of the page doesn't get pulled into
      // the layer's repaint when something else changes.
      style={{
        transform: 'translateZ(0)',
        contain: 'layout paint',
        willChange: 'contents',
        isolation: 'isolate',
      }}
    >
      <svg
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <filter id="brush" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="turbulence" baseFrequency="0.012" numOctaves="4" seed="5" result="t" />
            <feDisplacementMap in="SourceGraphic" in2="t" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="fine" x="-3%" y="-3%" width="106%" height="106%">
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" seed="9" result="t" />
            <feDisplacementMap in="SourceGraphic" in2="t" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="bleed" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="seal-tex" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="4" seed="14" result="noise" />
            <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
            <feComponentTransfer in="mono" result="thresh">
              <feFuncA type="discrete" tableValues="0 0 0 0.3 0.5 0.7 1 1 1 1" />
            </feComponentTransfer>
            <feComposite in="SourceGraphic" in2="thresh" operator="in" />
          </filter>
          <filter id="seal-bleed" x="-8%" y="-8%" width="116%" height="116%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <radialGradient id="shuinku" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#C0392B" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#E34234" stopOpacity="0.85" />
            <stop offset="85%" stopColor="#E34234" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E34234" stopOpacity="0.25" />
          </radialGradient>
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" result="m" />
            <feBlend in="SourceGraphic" in2="m" mode="multiply" />
          </filter>

          {/* Pressure: thick at peaks, thinner at valleys */}
          <linearGradient id="pressure" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="15%" stopColor="white" stopOpacity="0.7" />
            <stop offset="22%" stopColor="white" stopOpacity="0.85" />
            <stop offset="30%" stopColor="white" stopOpacity="0.5" />
            <stop offset="40%" stopColor="white" stopOpacity="0.8" />
            <stop offset="52%" stopColor="white" stopOpacity="1" />
            <stop offset="58%" stopColor="white" stopOpacity="0.9" />
            <stop offset="68%" stopColor="white" stopOpacity="0.6" />
            <stop offset="78%" stopColor="white" stopOpacity="0.5" />
            <stop offset="88%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0.2" />
          </linearGradient>

          <mask id="draw-mask">
            <path
              className={a('mask-draw')}
              d={mountainPath}
              fill="none"
              stroke="url(#pressure)"
              strokeWidth="80"
              strokeLinecap="round"
              pathLength="1000"
              strokeDasharray="1000"
              strokeDashoffset={reducedMotion ? '0' : '1000'}
            />
          </mask>

          <mask id="snow-mask">
            <path
              className={a('mask-snow')}
              d={mountainPath}
              fill="none"
              stroke="white"
              strokeWidth="60"
              strokeLinecap="round"
              pathLength="1000"
              strokeDasharray="1000"
              strokeDashoffset={reducedMotion ? '0' : '1000'}
            />
          </mask>
        </defs>

        {/* Transparent background — inherits page washi */}

        {/* Ink bleed */}
        <g className={a('anim-bleed')} opacity="0.04">
          <path d={mountainPath} stroke="#1A1816" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#bleed)" />
        </g>

        {/* Mountain stroke. The two brush-filtered paths are combined into a
            single filter group (filter="url(#brush)" applied to the parent g)
            so the expensive feTurbulence + feDisplacementMap pipeline runs
            ONCE per repaint instead of twice. Visually identical because both
            paths use the same filter input shape. */}
        <g mask="url(#draw-mask)" style={{ isolation: 'isolate' }}>
          <g filter="url(#brush)">
            <path d={mountainPath} stroke="#1A1816" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
            <path d={mountainPath} stroke="#1A1816" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
          </g>
          <path d={mountainPath} stroke="#1A1816" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" filter="url(#fine)" />
          <path d={washPath} fill="#1A1816" opacity="0.03" filter="url(#bleed)" />
        </g>

        {/* Snow caps on all three peaks */}
        <g mask="url(#snow-mask)" className={a('anim-snow-cap')}>
          <g filter="url(#fine)" opacity="0.35">
            {/* Left peak */}
            <path d="M400 286 Q404 274 412 278 Q416 271 422 286 Q416 294 406 294Z" fill="#E5E0D8" />
            <path d="M394 302 Q400 292 406 297 Q398 305 394 302Z" fill="#E5E0D8" />
            {/* Main peak */}
            <path d="M674 138 Q678 125 686 129 Q690 122 696 137 Q690 145 680 145Z" fill="#E5E0D8" />
            <path d="M668 155 Q674 145 680 150 Q672 158 668 155Z" fill="#E5E0D8" />
            <path d="M694 153 Q700 143 704 149 Q698 156 694 153Z" fill="#E5E0D8" />
          </g>
        </g>

        {/* Distant ridge */}
        <g className={a('anim-distant')}>
          <path d={distantPath} stroke="#1A1816" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.05" filter="url(#bleed)" />
        </g>

        {/* Valley mist */}
        <g className={a('anim-mist')} opacity="0.04">
          <ellipse cx="495" cy="398" rx="40" ry="4" fill="#F5F0E8" filter="url(#bleed)" />
        </g>

        {/* Hanko seal */}
        <g transform="translate(1120, 740) rotate(-2)">
          <g className={a('anim-stamp')}>
            <circle cx="0" cy="0" r="48" fill="#E34234" opacity="0.06" filter="url(#seal-bleed)" />
            <circle cx="0" cy="0" r="42" stroke="#E34234" strokeWidth="3.5" fill="none" opacity="0.7" filter="url(#seal-tex)" />
            <circle cx="0" cy="0" r="36" stroke="#E34234" strokeWidth="1.2" fill="none" opacity="0.4" filter="url(#seal-tex)" />
            <circle cx="0" cy="0" r="42" fill="url(#shuinku)" opacity="0.08" />
            <g filter="url(#seal-tex)" opacity="0.8">
              <path d="M0 -22 L0 18" stroke="#E34234" strokeWidth="5.5" strokeLinecap="round" fill="none" />
              <path d="M-18 -8 L-18 18" stroke="#E34234" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M18 -8 L18 18" stroke="#E34234" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M-24 18 Q-12 16 0 17 Q12 16 24 18" stroke="#E34234" strokeWidth="5" strokeLinecap="round" fill="none" />
            </g>
            <g fill="#F5F0E8" opacity="0.3">
              <ellipse cx="-28" cy="-25" rx="6" ry="4" transform="rotate(15 -28 -25)" />
              <ellipse cx="30" cy="22" rx="5" ry="3" transform="rotate(-10 30 22)" />
              <ellipse cx="-15" cy="32" rx="7" ry="3" transform="rotate(5 -15 32)" />
              <ellipse cx="22" cy="-30" rx="4" ry="5" transform="rotate(-20 22 -30)" />
            </g>
            <g fill="#F5F0E8" opacity="0.4">
              <circle cx="-10" cy="-18" r="1" /><circle cx="8" cy="25" r="0.8" />
              <circle cx="-22" cy="12" r="0.6" /><circle cx="14" cy="-5" r="0.7" />
              <circle cx="-5" cy="30" r="0.9" />
            </g>
          </g>
        </g>

        {/* Snow */}
        {!reducedMotion && (
          <g className="snow">
            <circle cx="180" cy="150" r="1.3" fill="#C4BDB4" opacity="0.14" />
            <circle cx="500" cy="90" r="1.1" fill="#C4BDB4" opacity="0.11" />
            <circle cx="820" cy="180" r="0.9" fill="#C4BDB4" opacity="0.09" />
            <circle cx="330" cy="320" r="1.2" fill="#C4BDB4" opacity="0.12" />
            <circle cx="950" cy="130" r="1" fill="#C4BDB4" opacity="0.1" />
          </g>
        )}
      </svg>

      <style>{`
        /*
          Performance notes for Safari/mobile:
          - All transforms use translate3d (or scale3d) so the WebKit
            compositor promotes the element to its own GPU layer instead of
            falling back to CPU rasterization. Plain translateY/scale on
            SVG sub-elements doesn't reliably trigger layer promotion in
            Safari, which is the main reason the original animation felt
            jumpy on iOS.
          - will-change: transform on the actively animating groups gives the
            compositor a heads-up so it pre-rasterizes the layer.
          - The stroke-dashoffset animation can't use transform but it's
            running inside the masked group which is inside the GPU-promoted
            wrapper, so the browser caches the filter output between frames
            instead of recomputing feTurbulence on every pixel change.
        */

        @keyframes draw-stroke { to { stroke-dashoffset: 0; } }
        .mask-draw {
          animation: draw-stroke 3.5s cubic-bezier(0.35, 0, 0.15, 1) 0.5s forwards;
          will-change: stroke-dashoffset;
        }
        .mask-snow {
          animation: draw-stroke 3.5s cubic-bezier(0.35, 0, 0.15, 1) 0.8s forwards;
          will-change: stroke-dashoffset;
        }

        @keyframes bleed-in { from { opacity: 0; } to { opacity: 0.04; } }
        .anim-bleed { animation: bleed-in 2s ease 1s both; }

        @keyframes snow-cap-in { from { opacity: 0; } to { opacity: 1; } }
        .anim-snow-cap { animation: snow-cap-in 1.5s ease 3s both; }

        @keyframes distant-in { from { opacity: 0; } to { opacity: 1; } }
        .anim-distant { animation: distant-in 2s ease 3.8s both; }

        @keyframes mist-drift {
          0%, 100% { transform: translate3d(0, 0, 0) scaleX(1); opacity: 0.04; }
          50% { transform: translate3d(0, 0, 0) scaleX(1.15); opacity: 0.02; }
        }
        .anim-mist {
          transform-box: fill-box;
          animation: mist-drift 14s ease-in-out 4.2s infinite;
          opacity: 0;
          animation-fill-mode: both;
          will-change: transform, opacity;
        }

        @keyframes stamp-press {
          0%   { opacity: 0; transform: translate3d(0, 0, 0) scale3d(1.3, 1.3, 1); }
          30%  { opacity: 1; transform: translate3d(0, 0, 0) scale3d(0.96, 0.96, 1); }
          50%  { transform: translate3d(0, 0, 0) scale3d(1.02, 1.02, 1); }
          70%  { transform: translate3d(0, 0, 0) scale3d(0.99, 0.99, 1); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale3d(1, 1, 1); }
        }
        .anim-stamp {
          animation: stamp-press 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) 4.8s both;
          transform-box: fill-box;
          transform-origin: center;
          will-change: transform, opacity;
        }

        @keyframes drift {
          from { transform: translate3d(0, -60px, 0); }
          to   { transform: translate3d(0, 860px, 0); }
        }
        .snow {
          animation: drift 35s linear infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .mask-draw, .mask-snow { stroke-dashoffset: 0 !important; will-change: auto !important; }
          .anim-bleed, .anim-snow-cap, .anim-distant, .anim-stamp { animation-duration: 0.01ms !important; animation-delay: 0ms !important; will-change: auto !important; }
          .anim-mist, .snow { animation: none !important; will-change: auto !important; }
        }
      `}</style>
    </div>
  );
}
