// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    /*
     * Clerk가 인증 정보를 주입해야 하는 경로들
     * app router 기준
     */
    "/((?!_next|.*\\..*).*)",
  ],
};
