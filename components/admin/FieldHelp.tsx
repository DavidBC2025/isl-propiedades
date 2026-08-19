import type { ReactNode } from "react";

type FieldHelpProps = {
  id: string;
  label: string;
  help: string;
  children: ReactNode;
};

export function FieldHelp({ id, label, help, children }: FieldHelpProps) {
  const helpId = `${id}-ayuda`;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-isl-black">{label}</label>
      <p id={helpId} className="text-sm text-isl-black/60">{help}</p>
      <div>{children}</div>
    </div>
  );
}

export const fieldClassName = "min-h-11 w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 py-2 text-base text-isl-black";
