import { HTMLAttributes } from "react";

export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["rounded-lg border border-border bg-bg-surface", className].join(" ")}
      {...rest}
    />
  );
}

export function CardHeader({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={["flex items-center justify-between border-b border-border px-5 py-3.5", className].join(" ")} {...rest} />;
}

export function CardBody({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={["px-5 py-4", className].join(" ")} {...rest} />;
}
