interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-gray-900 ${sizeClasses[size]} ${className}`} />
  );
}

export function SpinnerCenter({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <div className="flex justify-center items-center py-12">
      <Spinner size={size} />
    </div>
  );
}
