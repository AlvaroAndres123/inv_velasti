import { Button } from "./button";
import { ReactNode } from "react";

interface ExportButtonProps {
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
  title?: string;
  disabled?: boolean;
  className?: string;
}

export function ExportButton({
  onClick,
  icon,
  children,
  title,
  disabled,
  className = "",
}: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`ml-2 flex items-center gap-1 ${className}`}
      title={title}
      disabled={disabled}
      type="button"
    >
      {icon}
      {children}
    </Button>
  );
} 