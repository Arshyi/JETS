import { getAuthContext } from "@/lib/supabase/session";

export type AdminGateState =
  | {
      isAllowed: true;
      status: "allowed";
      userEmail: string;
    }
  | {
      description: string;
      isAllowed: false;
      status: "forbidden" | "setup-required" | "signed-out";
      title: string;
    };

function getConfiguredAdminEmails() {
  return (process.env.JETS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminGate(): Promise<AdminGateState> {
  const auth = await getAuthContext();

  if (!auth.isConfigured) {
    return {
      description:
        "Add Supabase environment variables before admin ingestion tools can verify a signed-in user.",
      isAllowed: false,
      status: "setup-required",
      title: "Supabase setup required"
    };
  }

  if (!auth.user) {
    return {
      description:
        "Sign in with an admin email to run dry-run ingestion checks and review persisted run logs.",
      isAllowed: false,
      status: "signed-out",
      title: "Admin sign in required"
    };
  }

  const adminEmails = getConfiguredAdminEmails();

  if (adminEmails.length === 0) {
    return {
      description:
        "Set JETS_ADMIN_EMAILS to a comma-separated list of admin account emails before enabling this page.",
      isAllowed: false,
      status: "setup-required",
      title: "Admin allowlist required"
    };
  }

  const userEmail = auth.user.email?.toLowerCase();

  if (!userEmail || !adminEmails.includes(userEmail)) {
    return {
      description:
        "This account is signed in, but it is not listed in JETS_ADMIN_EMAILS.",
      isAllowed: false,
      status: "forbidden",
      title: "Admin access required"
    };
  }

  return {
    isAllowed: true,
    status: "allowed",
    userEmail
  };
}
