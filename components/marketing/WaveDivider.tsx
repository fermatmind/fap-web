import { cn } from "@/lib/utils";

export function WaveDivider({
  className,
  fill = "#ffffff",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <div className={cn("fm-wave-cut overflow-hidden", className)}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="relative block h-[52px] w-full md:h-[74px] lg:h-[82px]"
      >
        <path
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,121.32,192.38,110.15,236.4,102.2,279.79,79.16,321.39,56.44Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
