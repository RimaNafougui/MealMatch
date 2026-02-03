"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-background border-t p-4 text-center text-sm text-foreground">
      <div>© 2026 MealMatch. All rights reserved.</div>
      <div className="flex justify-center gap-4 mt-2">
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/privacy">Privacy</Link>
      </div>
    </footer>
  );
}
