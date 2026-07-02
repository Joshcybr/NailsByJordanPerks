import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Matches the payload the dashboard's rotating QR encodes: NBJ-CHECKIN:<token-uuid>
const CODE_PATTERN = /^NBJ-CHECKIN:([0-9a-fA-F-]{36})$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code: string | undefined = body?.code;
    const pin: string | undefined = body?.pin;

    // 1. Staff PIN check — required on every request, not just at the UI gate
    if (!pin || pin !== process.env.STAFF_CHECKIN_PIN) {
      return NextResponse.json({ error: "Incorrect staff PIN." }, { status: 401 });
    }

    // 2. Validate the scanned/typed code shape
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "No code provided." }, { status: 400 });
    }
    const match = code.trim().match(CODE_PATTERN);
    if (!match) {
      return NextResponse.json(
        { error: "That doesn't look like a NailPerks check-in code." },
        { status: 400 }
      );
    }
    const token = match[1];

    // 3. Look up the token first, so we can give a specific error
    //    (expired vs. already used vs. not found) before trying to claim it.
    const { data: tokenRow, error: tokenFetchError } = await supabaseAdmin
      .from("checkin_tokens")
      .select("token, client_id, expires_at, used")
      .eq("token", token)
      .single();

    if (tokenFetchError || !tokenRow) {
      return NextResponse.json({ error: "Code not found. Ask the client to refresh their QR." }, { status: 404 });
    }
    if (tokenRow.used) {
      return NextResponse.json({ error: "This code has already been used." }, { status: 409 });
    }
    if (new Date(tokenRow.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "This code has expired. Ask the client to refresh their QR." }, { status: 410 });
    }

    // 4. Atomically claim the token — the WHERE used = false clause means
    //    that if two scans race for the same token, only one UPDATE
    //    actually matches a row. The loser gets back an empty result here
    //    and is rejected, instead of both silently succeeding.
    const { data: claimed, error: claimError } = await supabaseAdmin
      .from("checkin_tokens")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("token", token)
      .eq("used", false)
      .select("client_id")
      .single();

    if (claimError || !claimed) {
      return NextResponse.json({ error: "This code was just used by another scan." }, { status: 409 });
    }

    // 5. Increment the client's visit count
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, visits")
      .eq("id", claimed.client_id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "No matching client profile found." }, { status: 404 });
    }

    const newVisits = existing.visits + 1;
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ visits: newVisits })
      .eq("id", claimed.client_id)
      .select("id, full_name, visits")
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: "Couldn't update the visit count. Try again." }, { status: 500 });
    }

    return NextResponse.json({ profile: updated });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}