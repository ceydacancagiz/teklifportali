import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface Props {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

/**
 * Number input that preserves user typing exactly (trailing dots, decimals,
 * leading zeros) and only commits a numeric value on change.
 * Avoids the issue where typing "1000.50" gets normalized to "1000.5"
 * mid-typing or where a trailing "." disappears.
 */
export default function PriceInput({ value, onChange, className }: Props) {
  const [text, setText] = useState<string>(() => (value === 0 ? "" : String(value)));

  // Sync from outside when value changes externally and doesn't match parsed text
  useEffect(() => {
    const parsed = parseFloat(text.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed !== value) {
      setText(value === 0 ? "" : String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        // Allow digits, one separator (.,) — keep raw for display
        if (!/^-?\d*[.,]?\d*$/.test(raw)) return;
        setText(raw);
        const normalized = raw.replace(",", ".");
        const parsed = parseFloat(normalized);
        onChange(Number.isFinite(parsed) ? parsed : 0);
      }}
      onBlur={() => {
        const normalized = text.replace(",", ".");
        const parsed = parseFloat(normalized);
        if (Number.isFinite(parsed)) {
          setText(String(parsed));
          onChange(parsed);
        } else {
          setText("");
          onChange(0);
        }
      }}
      className={className}
    />
  );
}
