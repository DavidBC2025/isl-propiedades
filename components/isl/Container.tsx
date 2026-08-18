import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={["mx-auto max-w-7xl px-6 md:px-12 lg:px-16", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
