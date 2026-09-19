import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface DonationRecord {
  id: string;
  donor: string;
  type: string;
  amount: number;
  date: string;
  channel: string;
  payment: string;
  allocation: string;
  campaignId: string | null;
  causeId: string | null;
  destination: string;
  recurringCadence: string | null;
  message: string;
}

export interface DonationsPayload {
  donations: DonationRecord[];
  recurringDonors: number;
}

type Ctx = { supabase: any; userId: string; claims: Record<string, unknown> };

const TYPE_LABEL: Record<string, string> = {
  Patient: "Patient Donation",
  Cause: "Cause Donation",
  Recurring: "Recurring Donation",
};

export const DONATION_TYPE_LABELS = Object.values(TYPE_LABEL);

export const listDonations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DonationsPayload> => {
    const supabase = (context as unknown as Ctx).supabase;
    const [{ data: donations, error }, { data: campaigns }, { data: causes }, { data: plans }] =
      await Promise.all([
        supabase
          .from("donations")
          .select(
            "id, donor_name, is_anonymous, amount, donation_type, payment_status, allocation_status, payment_method, campaign_id, cause_id, recurring_plan_id, message, created_at",
          )
          .order("created_at", { ascending: false }),
        supabase.from("campaigns").select("id, title"),
        supabase.from("causes").select("id, name"),
        supabase.from("recurring_plans").select("id, status, frequency"),
      ]);
    if (error) throw new Error(error.message);

    const campaignTitle = new Map<string, string>(
      (campaigns ?? []).map((c: any) => [c.id as string, c.title as string]),
    );
    const causeName = new Map<string, string>(
      (causes ?? []).map((c: any) => [c.id as string, c.name as string]),
    );
    const planFrequency = new Map<string, string>(
      (plans ?? []).map((p: any) => [p.id as string, p.frequency as string]),
    );

    return {
      donations: (donations ?? []).map(
        (d: any): DonationRecord => ({
          id: d.id,
          donor: d.is_anonymous ? "Anonymous donor" : (d.donor_name ?? "Donor"),
          type: TYPE_LABEL[d.donation_type as string] ?? d.donation_type,
          amount: Number(d.amount ?? 0),
          date: d.created_at,
          channel: d.payment_method ?? "Online",
          payment: d.payment_status,
          allocation: d.allocation_status,
          campaignId: d.campaign_id ?? null,
          causeId: d.cause_id ?? null,
          destination: d.campaign_id
            ? (campaignTitle.get(d.campaign_id) ?? "Campaign")
            : d.cause_id
              ? (causeName.get(d.cause_id) ?? "Cause")
              : "—",
          recurringCadence: d.recurring_plan_id
            ? (planFrequency.get(d.recurring_plan_id) ?? null)
            : null,
          message: d.message ?? "",
        }),
      ),
      recurringDonors: (plans ?? []).filter((p: any) => p.status === "Active").length,
    };
  });
