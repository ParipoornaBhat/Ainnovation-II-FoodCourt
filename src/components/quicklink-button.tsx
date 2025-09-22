"use client";

import { api } from "@/trpc/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function QuickLinkButton() {
  const { data: links } = api.quickLink.getActive.useQuery();

  if (!links || links.length === 0) return null; // hide if no active links

  return (
    <div className="relative">
      <Link href="/quicklink">
        <Button
          className="
            absolute top-2 right-2 z-50
            bg-yellow-500 text-white
            hover:bg-yellow-600
            dark:bg-yellow-400 dark:text-black
            dark:hover:bg-yellow-500
            shadow-lg rounded-lg
          "
        >
          🔗 Quick Links
        </Button>
      </Link>
    </div>
  );
}
