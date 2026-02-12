//app/components/UserSync.tsx

"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export function UserSync() {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) return;

    fetch("/api/auth/sync", {
      method: "POST",
    }).catch(() => {});
  }, [isLoaded, isSignedIn]);

  return null;
}
