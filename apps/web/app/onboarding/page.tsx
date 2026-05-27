import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingSteps } from "@/components/onboarding/OnboardingSteps";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, tiktok_username, display_name")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_completed) redirect("/dashboard");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <OnboardingSteps
      userId={user.id}
      appUrl={appUrl}
      initialTiktok={profile?.tiktok_username ?? ""}
    />
  );
}
