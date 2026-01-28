//app/hooks/useUserAccessLevel.ts

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import type { UserAccessLevel } from "@/app/types/access";

export function useUserAccessLevel(): UserAccessLevel {
  const { userId } = useAuth();
  const [level, setLevel] = useState<UserAccessLevel>("GUEST");

  useEffect(() => {
    if (!userId) {
      setLevel("GUEST");
      return;
    }

    fetch("/api/me/access")
      .then((r) => r.json())
      .then((d) => {
        setLevel(d.access_level ?? "MEMBER");
      })
      .catch(() => setLevel("MEMBER"));
  }, [userId]);

  return level;
}