import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import gsap from 'gsap';

export interface ShapeOverlaysHandle {
  triggerTransition: (onMidpoint?: () => void, onComplete?: () => void) => void;
}

interface ShapeOverlaysTransitionProps {
  onInitialComplete?: () => void;
}

export const ShapeOverlaysTransition = forwardRef<ShapeOverlaysHandle, ShapeOverlaysTransitionProps>(
  ({ onInitialComplete }, ref) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const pathRefs = useRef<(SVGPathElement | null)[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const isBusyRef = useRef(false);

    // Number of Bezier control points along the horizontal axis
    const numPoints = 8;
    // Number of layered wave paths (3 distinct layers for rich depth)
    const numPaths = 3;
    const delayPointsMax = 0.08;
    const delayPerPath = 0.07;
    const duration = 0.38;

    // Store points coordinate states
    const allPointsRef = useRef<number[][]>([]);
    const pointsDelayRef = useRef<number[]>([]);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    // Initialize point matrices
    useEffect(() => {
      allPointsRef.current = [];
      for (let i = 0; i < numPaths; i++) {
        const points: number[] = [];
        for (let j = 0; j < numPoints; j++) {
          points.push(0);
        }
        allPointsRef.current.push(points);
      }
    }, [numPaths, numPoints]);

    // Renders the SVG paths with cubic Bézier segments based on current point values
    const render = useCallback((isClosingPhase: boolean) => {
      const paths = pathRefs.current;
      const allPoints = allPointsRef.current;

      for (let i = 0; i < numPaths; i++) {
        const path = paths[i];
        const points = allPoints[i];
        if (!path || !points) continue;

        let d = '';
        if (isClosingPhase) {
          // When closing/revealing: draw from top down to the wave curve
          d += `M 0 0 V ${points[0]} C`;
        } else {
          // When opening/covering: draw from bottom wave curve up
          d += `M 0 ${points[0]} C`;
        }

        for (let j = 0; j < numPoints - 1; j++) {
          const p = ((j + 1) / (numPoints - 1)) * 100;
          const cp = p - (1 / (numPoints - 1) * 100) / 2;
          d += ` ${cp} ${points[j]} ${cp} ${points[j + 1]} ${p} ${points[j + 1]}`;
        }

        if (isClosingPhase) {
          d += ` V 100 H 0 Z`;
        } else {
          d += ` V 100 H 0 Z`;
        }

        path.setAttribute('d', d);
      }
    }, [numPaths, numPoints]);

    // Custom 2-phase wave transition (Sweep In -> Callback at Full Cover -> Sweep Out)
    const triggerTransition = useCallback((onMidpoint?: () => void, onComplete?: () => void) => {
      if (isBusyRef.current) {
        if (onMidpoint) onMidpoint();
        if (onComplete) onComplete();
        return;
      }

      isBusyRef.current = true;
      setIsAnimating(true);

      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      // Initialize random point delays for organic fluid dispersion
      for (let i = 0; i < numPoints; i++) {
        pointsDelayRef.current[i] = Math.random() * delayPointsMax;
      }

      // Reset starting points: bottom (100)
      for (let i = 0; i < numPaths; i++) {
        for (let j = 0; j < numPoints; j++) {
          allPointsRef.current[i][j] = 100;
        }
      }

      // Phase 1: Waves rise from bottom (100) to top (0) covering the screen
      const tl = gsap.timeline({
        onUpdate: () => render(false),
        defaults: {
          ease: 'power2.inOut',
          duration: duration
        }
      });

      timelineRef.current = tl;

      // Animate paths covering screen
      for (let i = 0; i < numPaths; i++) {
        const points = allPointsRef.current[i];
        const pathDelay = delayPerPath * (numPaths - i - 1);

        for (let j = 0; j < numPoints; j++) {
          const delay = pointsDelayRef.current[j];
          tl.to(
            points,
            {
              [j]: 0,
              duration: duration
            },
            delay + pathDelay
          );
        }
      }

      // At peak coverage (instant handoff to update tab state)
      tl.add(() => {
        if (onMidpoint) {
          onMidpoint();
        }
      });

      // Micro-tick for seamless buffer
      tl.to({}, { duration: 0.01 });

      // Phase 2: Waves sweep down from top to bottom (0 -> 100), revealing the next view
      tl.add(() => {
        // Switch render mode to top-anchored reveal
        for (let i = 0; i < numPoints; i++) {
          pointsDelayRef.current[i] = Math.random() * delayPointsMax;
        }
      });

      const revealTl = gsap.timeline({
        onUpdate: () => render(true),
        defaults: {
          ease: 'power2.out',
          duration: duration
        }
      });

      for (let i = 0; i < numPaths; i++) {
        const points = allPointsRef.current[i];
        const pathDelay = delayPerPath * i;

        for (let j = 0; j < numPoints; j++) {
          const delay = pointsDelayRef.current[j];
          revealTl.to(
            points,
            {
              [j]: 100,
              duration: duration
            },
            delay + pathDelay
          );
        }
      }

      tl.add(revealTl);

      tl.add(() => {
        // Complete transition
        setIsAnimating(false);
        isBusyRef.current = false;
        if (onComplete) {
          onComplete();
        }
      });
    }, [delayPerPath, delayPointsMax, duration, numPaths, numPoints, render]);

    // Expose trigger method to parent
    useImperativeHandle(ref, () => ({
      triggerTransition
    }));

    // Initial site entrance animation on mount
    useEffect(() => {
      // Start with paths completely covering the viewport (top: 0)
      for (let i = 0; i < numPaths; i++) {
        for (let j = 0; j < numPoints; j++) {
          allPointsRef.current[i][j] = 0;
        }
      }
      setIsAnimating(true);
      isBusyRef.current = true;

      // Quick initial reveal so entrance feels instant and vibrant
      const timer = setTimeout(() => {
        for (let i = 0; i < numPoints; i++) {
          pointsDelayRef.current[i] = Math.random() * delayPointsMax;
        }

        const initialTl = gsap.timeline({
          onUpdate: () => render(true),
          defaults: {
            ease: 'power2.out',
            duration: 0.45
          },
          onComplete: () => {
            setIsAnimating(false);
            isBusyRef.current = false;
            if (onInitialComplete) {
              onInitialComplete();
            }
          }
        });

        for (let i = 0; i < numPaths; i++) {
          const points = allPointsRef.current[i];
          const pathDelay = delayPerPath * i;

          for (let j = 0; j < numPoints; j++) {
            const delay = pointsDelayRef.current[j];
            initialTl.to(
              points,
              {
                [j]: 100,
                duration: 0.45
              },
              delay + pathDelay
            );
          }
        }
      }, 35);

      return () => {
        clearTimeout(timer);
        if (timelineRef.current) {
          timelineRef.current.kill();
        }
      };
    }, []);

    return (
      <div
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          pointerEvents: isAnimating ? 'auto' : 'none'
        }}
        id="casa-sandrissima-shape-overlays-container"
        aria-hidden="true"
      >
        <svg
          ref={svgRef}
          className="shape-overlays w-full h-full absolute inset-0"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Layer 1 (Warm Amber Gold to Radiant Emerald - Community energy) */}
            <linearGradient id="sandrissima-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="40%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            {/* Layer 2 (Teal to Fresh Mint - Vitality & Growth) */}
            <linearGradient id="sandrissima-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            {/* Layer 3 (Deep Forest to Vibrant Emerald - Signature brand tone) */}
            <linearGradient id="sandrissima-gradient-3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* 3 morphing organic paths */}
          <path
            ref={(el) => { pathRefs.current[0] = el; }}
            className="shape-overlays__path"
            fill="url(#sandrissima-gradient-1)"
          />
          <path
            ref={(el) => { pathRefs.current[1] = el; }}
            className="shape-overlays__path"
            fill="url(#sandrissima-gradient-2)"
          />
          <path
            ref={(el) => { pathRefs.current[2] = el; }}
            className="shape-overlays__path"
            fill="url(#sandrissima-gradient-3)"
          />
        </svg>
      </div>
    );
  }
);

ShapeOverlaysTransition.displayName = 'ShapeOverlaysTransition';
