"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";

/**
 * "Try it" — routes to /demo, which creates a throwaway session and drops
 * the user straight into a live match. No signup form.
 *
 * Kept as a component (not an inline button) so the styling and copy are
 * consistent across the landing page.
 */
export function TryItButton({
  variant = "primary",
  size = "lg",
}: {
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
}) {
  return (
    <Link href="/demo">
      <Button variant={variant} size={size}>
        Try it now — no signup
        <ArrowRight size={16} />
      </Button>
    </Link>
  );
}
