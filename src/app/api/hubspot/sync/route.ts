import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncClosedWonDeals } from "@/lib/hubspot";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const accessToken = body.accessToken as string;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Hubspot access token required" },
      { status: 400 }
    );
  }

  const result = await syncClosedWonDeals(accessToken);

  return NextResponse.json(result);
}
