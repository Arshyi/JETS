import { NextResponse, type NextRequest } from "next/server";

import { getSafeAuthRedirectPath } from "@/lib/supabase/auth-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeAuthRedirectPath(requestUrl.searchParams.get("next"));
  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("next", next);

  if (!code) {
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(loginUrl);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
