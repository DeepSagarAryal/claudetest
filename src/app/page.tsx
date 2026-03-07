import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LogIn } from "lucide-react";
import SignInButton from "@/components/sign-in-button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">RevTrack</h1>
          <p className="mt-2 text-gray-600">
            Commission tracking for Hubspot deals
          </p>
        </div>

        <div className="space-y-4">
          <SignInButton />
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Sign in with your Hubspot account to view your commissions.</p>
        </div>
      </div>
    </div>
  );
}
