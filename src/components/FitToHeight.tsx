import { useLayoutEffect, useRef, useState } from "react";

interface Props {
  maxHeight: number;
  children: React.ReactNode;
}

/**
 * Measures inner content and shrinks (scale-down) to fit within maxHeight.
 * Width is compensated so layout fills the container after scaling.
 */
export default function FitToHeight({ maxHeight, children }: Props) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => {
      // Reset scale to measure natural height
      el.style.transform = "scale(1)";
      el.style.width = "100%";
      const naturalHeight = el.scrollHeight;
      const next = naturalHeight > maxHeight ? maxHeight / naturalHeight : 1;
      setScale(next);
      el.style.transform = `scale(${next})`;
      el.style.width = next < 1 ? `${100 / next}%` : "100%";
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxHeight, children]);

  return (
    <div style={{ height: maxHeight, overflow: "hidden", width: "100%" }}>
      <div
        ref={innerRef}
        style={{
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          width: scale < 1 ? `${100 / scale}%` : "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
