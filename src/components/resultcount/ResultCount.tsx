import { toComma } from "@/utils/number";

export interface ResultCountProps {
  label: string;
  count: number;
}

// Figma SearchCountText — "{label} 총 N건", 숫자만 primary.
const ResultCount = ({ label, count }: ResultCountProps) => {
  return (
    <div className="caption text-text-primary flex items-center gap-4">
      <span>{label}</span>
      <span>
        총 <span className="text-primary">{toComma(count)}</span>건
      </span>
    </div>
  );
};

export default ResultCount;
