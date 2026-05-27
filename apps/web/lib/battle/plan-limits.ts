import { PLAN_LIMITS, type PlanType } from "@streambattle/shared-types";

export type PlanLimitError =
  | "battles_limit_reached"
  | "duration_limit_exceeded"
  | "feature_not_available";

export interface PlanLimitCheck {
  allowed: boolean;
  error?: PlanLimitError;
  message?: string;
  upgradeRequired?: PlanType;
}

/**
 * Check if a user can create a new battle based on their plan limits.
 */
export function checkCanCreateBattle(
  plan: PlanType,
  battlesThisMonth: number
): PlanLimitCheck {
  const limits = PLAN_LIMITS[plan];

  if (
    limits.maxBattlesPerMonth !== null &&
    battlesThisMonth >= limits.maxBattlesPerMonth
  ) {
    return {
      allowed: false,
      error: "battles_limit_reached",
      message: `Você atingiu o limite de ${limits.maxBattlesPerMonth} batalhas no plano gratuito este mês.`,
      upgradeRequired: "pro",
    };
  }

  return { allowed: true };
}

/**
 * Check if a battle duration is within plan limits.
 */
export function checkBattleDuration(
  plan: PlanType,
  durationSeconds: number
): PlanLimitCheck {
  const limits = PLAN_LIMITS[plan];

  if (durationSeconds > limits.maxDurationSeconds) {
    const maxMinutes = limits.maxDurationSeconds / 60;
    return {
      allowed: false,
      error: "duration_limit_exceeded",
      message: `O plano ${plan} permite batalhas de no máximo ${maxMinutes} minuto${maxMinutes !== 1 ? "s" : ""}.`,
      upgradeRequired: plan === "free" ? "pro" : "business",
    };
  }

  return { allowed: true };
}

/**
 * Check if a plan supports gift multipliers.
 */
export function checkGiftMultiplier(
  plan: PlanType,
  multiplier: number
): PlanLimitCheck {
  const limits = PLAN_LIMITS[plan];

  if (!limits.giftMultiplier && multiplier > 1) {
    return {
      allowed: false,
      error: "feature_not_available",
      message: "Multiplicador de pontos está disponível apenas no plano Pro.",
      upgradeRequired: "pro",
    };
  }

  return { allowed: true };
}

/**
 * Get the number of battles created this month for a user.
 */
export async function getBattlesThisMonth(
  userId: string,
  supabase: any
): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("battles")
    .select("id", { count: "exact", head: true })
    .eq("streamer_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  return count ?? 0;
}
