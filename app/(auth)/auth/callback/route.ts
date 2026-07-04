import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { getSafeAuthRedirectPath } from "@/lib/supabase/auth-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailOtpTypes = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email"
] as const;

function getSafeEmailOtpType(value: string | null): EmailOtpType | null {
  if (!value) {
    return null;
  }

  return emailOtpTypes.includes(value as (typeof emailOtpTypes)[number])
    ? (value as EmailOtpType)
    : null;
}

function getCallbackNextPath(requestUrl: URL) {
  const next = requestUrl.searchParams.get("next");

  if (next) {
    return getSafeAuthRedirectPath(next);
  }

  const redirectTo =
    requestUrl.searchParams.get("redirect_to") ??
    requestUrl.searchParams.get("redirectTo");

  if (!redirectTo) {
    return "/account";
  }

  try {
    const redirectUrl = new URL(redirectTo, requestUrl.origin);

    if (redirectUrl.origin !== requestUrl.origin) {
      return "/account";
    }

    return getSafeAuthRedirectPath(
      redirectUrl.searchParams.get("next") ??
        `${redirectUrl.pathname}${redirectUrl.search}`
    );
  } catch {
    return "/account";
  }
}

function getLoginRedirectUrl(
  requestUrl: URL,
  next: string,
  status: "success" | "error",
  message: string
) {
  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("next", next);
  loginUrl.searchParams.set("authStatus", status);
  loginUrl.searchParams.set("authMessage", message);

  return loginUrl;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = getSafeEmailOtpType(requestUrl.searchParams.get("type"));
  const next = getCallbackNextPath(requestUrl);

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(
      getLoginRedirectUrl(requestUrl, next, "error", "auth-not-configured")
    );
  }

  if (requestUrl.searchParams.has("error")) {
    return NextResponse.redirect(
      getLoginRedirectUrl(requestUrl, next, "error", "confirmation-invalid")
    );
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        getLoginRedirectUrl(requestUrl, next, "error", "confirmation-invalid")
      );
    }

    if (!data.session) {
      return NextResponse.redirect(
        getLoginRedirectUrl(requestUrl, next, "success", "email-confirmed")
      );
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type
    });

    if (error) {
      return NextResponse.redirect(
        getLoginRedirectUrl(requestUrl, next, "error", "confirmation-invalid")
      );
    }

    if (!data.session) {
      return NextResponse.redirect(
        getLoginRedirectUrl(requestUrl, next, "success", "email-confirmed")
      );
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  return NextResponse.redirect(
    getLoginRedirectUrl(requestUrl, next, "error", "confirmation-missing")
  );
}
