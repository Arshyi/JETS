type HeaderReader = {
  get(name: string): string | null;
};

function toAbsoluteOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const candidate = value.startsWith("http") ? value : `https://${value}`;

  try {
    return new URL(candidate).origin;
  } catch {
    return null;
  }
}

function isLocalHost(host: string) {
  const normalizedHost = host.replace(/^\[/, "").replace(/\]$/, "");
  const hostname = normalizedHost.split(":")[0];

  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function getRequestOrigin(requestHeaders: HeaderReader | null | undefined) {
  const host =
    requestHeaders?.get("x-forwarded-host") ?? requestHeaders?.get("host");

  if (!host) {
    return null;
  }

  const forwardedProto = requestHeaders?.get("x-forwarded-proto");
  const protocol = forwardedProto ?? (isLocalHost(host) ? "http" : "https");

  return toAbsoluteOrigin(`${protocol}://${host}`);
}

function getConfiguredOrigin() {
  return (
    toAbsoluteOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    toAbsoluteOrigin(process.env.NEXT_PUBLIC_VERCEL_URL) ??
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : null)
  );
}

export function getSafeAuthRedirectPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }

  return value;
}

export function buildAuthCallbackUrl(
  requestHeaders: HeaderReader | null | undefined,
  nextPath: string | null | undefined = "/account"
) {
  const origin = getRequestOrigin(requestHeaders) ?? getConfiguredOrigin();
  const callbackUrl = new URL("/auth/callback", origin ?? "http://localhost:3000");
  callbackUrl.searchParams.set("next", getSafeAuthRedirectPath(nextPath));

  return callbackUrl.toString();
}
