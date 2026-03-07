"use client";

import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export default function SignInButton() {
  return (
    <button
      onClick={() => signIn("hubspot", { callbackUrl: "/dashboard" })}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
    >
      <LogIn className="h-5 w-5" />
      Sign in with Hubspot
    </button>
  );
}
