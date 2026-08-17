import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  auditSeed,
  campaigns as campaignSeed,
  causes as causeSeed,
  donations as donationSeed,
  donationSeries,
  hospitals as hospitalSeed,
  patients as patientSeed,
  recurringDonors,
  transfers as transferSeed,
  type AuditEntry,
  type Campaign,
  type CampaignStatus,
  type Cause,
  type Donation,
  type Hospital,
  type Patient,
  type Service,
  type Transfer,
  type TransferStatus,
} from "@/data/fundezer";
import { nowStamp, today } from "@/lib/format";

export const CURRENT_ADMIN = {
  name: "Ada Nwankwo",
  role: "Super Admin",
  email: "ada.nwankwo@fundezer.ng",
  initials: "AN",
};

export const TRANSFER_FLOW: TransferStatus[] = [
  "Accepted",
  "Patient Notified",
  "Transfer Scheduled",
  "Treatment Commenced",
  "Completed",
];

interface CauseDraft {
  name: string;
  description: string;
  image: string;
  status: "Active" | "Inactive";
  fundingTarget: number;
}

interface PortalValue {
  hospitals: Hospital[];
  patients: Patient[];
  causes: Cause[];
  campaigns: Campaign[];
  donations: Donation[];
  transfers: Transfer[];
  audit: AuditEntry[];
  series: typeof donationSeries;
  recurringDonors: number;
  hospital: (id?: string) => Hospital | undefined;
  patient: (id?: string) => Patient | undefined;
  cause: (id?: string) => Cause | undefined;
  campaign: (id?: string) => Campaign | undefined;
  transfer: (id?: string) => Transfer | undefined;
  createCause: (draft: CauseDraft) => void;
  updateCause: (id: string, draft: CauseDraft) => void;
  setCauseStatus: (id: string, status: "Active" | "Inactive") => void;
  setCampaignStatus: (id: string, status: CampaignStatus) => void;
  approveTransfer: (id: string, receivingHospitalId: string) => void;
  rejectTransfer: (id: string, note: string) => void;
  requestInfo: (id: string, note: string) => void;
  reviewTransfer: (id: string) => void;
  respondReceivingHospital: (id: string, accepted: boolean, note?: string) => void;
  advanceTransfer: (id: string, next: TransferStatus) => void;
  matchingHospitals: (
    service: Service,
    excludeId: string,
  ) => { hospital: Hospital; status: string; recommended: boolean }[];
}

const PortalContext = createContext<PortalValue | null>(null);

let seq = 100;
const nextId = (prefix: string) => `${prefix}-${++seq}`;

export function PortalProvider({ children }: { children: ReactNode }) {
  const [hospitals] = useState<Hospital[]>(hospitalSeed);
  const [patients, setPatients] = useState<Patient[]>(patientSeed);
  const [causes, setCauses] = useState<Cause[]>(causeSeed);
  const [campaigns, setCampaigns] = useState<Campaign[]>(campaignSeed);
  const [donations] = useState<Donation[]>(donationSeed);
  const [transfers, setTransfers] = useState<Transfer[]>(transferSeed);
  const [audit, setAudit] = useState<AuditEntry[]>(auditSeed);

  const log = useCallback(
    (
      action: string,
      recordType: string,
      record: string,
      description: string,
      user = CURRENT_ADMIN.name,
      role = CURRENT_ADMIN.role,
    ) => {
      setAudit((prev) => [
        {
          id: nextId("AUD"),
          at: nowStamp(),
          user,
          role,
          action,
          recordType,
          record,
          description,
        },
        ...prev,
      ]);
    },
    [],
  );

  const patchTransfer = useCallback(
    (id: string, status: TransferStatus, by: string, note?: string, extra?: Partial<Transfer>) => {
      setTransfers((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                ...extra,
                status,
                timeline: [...t.timeline, { status, at: nowStamp(), by, note }],
              }
            : t,
        ),
      );
    },
    [],
  );

  const value = useMemo<PortalValue>(() => {
    const byId = <T extends { id: string }>(list: T[]) => (id?: string) =>
      list.find((item) => item.id === id);

    return {
      hospitals,
      patients,
      causes,
      campaigns,
      donations,
      transfers,
      audit,
      series: donationSeries,
      recurringDonors,
      hospital: byId(hospitals),
      patient: byId(patients),
      cause: byId(causes),
      campaign: byId(campaigns),
      transfer: byId(transfers),

      createCause: (draft) => {
        const id = nextId("CAU");
        setCauses((prev) => [
          {
            id,
            name: draft.name,
            description: draft.description,
            image: draft.image,
            status: draft.status,
            fundingTarget: draft.fundingTarget,
            pool: 0,
            totalDonations: 0,
            patientsSupported: 0,
            lastUpdated: today(),
          },
          ...prev,
        ]);
        log("Cause Created", "Cause", id, `New cause "${draft.name}" created as ${draft.status}.`);
        toast.success("Cause created", { description: `${draft.name} has been added.` });
      },

      updateCause: (id, draft) => {
        setCauses((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...draft, lastUpdated: today() } : c)),
        );
        log("Cause Updated", "Cause", id, `Cause "${draft.name}" details updated.`);
        toast.success("Cause updated", { description: `${draft.name} has been saved.` });
      },

      setCauseStatus: (id, status) => {
        const target = causes.find((c) => c.id === id);
        setCauses((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status, lastUpdated: today() } : c)),
        );
        log(
          status === "Active" ? "Cause Activated" : "Cause Deactivated",
          "Cause",
          id,
          `${target?.name ?? id} set to ${status}.`,
        );
        toast.success(status === "Active" ? "Cause activated" : "Cause deactivated", {
          description: `${target?.name ?? id} is now ${status.toLowerCase()}.`,
        });
      },

      setCampaignStatus: (id, status) => {
        setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
        log("Campaign Status Changed", "Campaign", id, `Campaign status changed to ${status}.`);
        toast.success("Campaign updated", { description: `${id} is now ${status}.` });
      },

      reviewTransfer: (id) => {
        patchTransfer(id, "Under Review", `Admin — ${CURRENT_ADMIN.name}`);
        log("Transfer Reviewed", "Transfer", id, "Transfer request moved to Under Review.");
        toast.success("Transfer under review", { description: `${id} marked as Under Review.` });
      },

      approveTransfer: (id, receivingHospitalId) => {
        const receiving = hospitals.find((h) => h.id === receivingHospitalId);
        patchTransfer(
          id,
          "Receiving Hospital Pending",
          `Admin — ${CURRENT_ADMIN.name}`,
          `Approved to ${receiving?.name ?? receivingHospitalId}`,
          { receivingHospitalId },
        );
        log(
          "Transfer Approved",
          "Transfer",
          id,
          `Transfer approved by admin to ${receiving?.name ?? receivingHospitalId}; awaiting receiving hospital acceptance.`,
        );
        toast.success("Transfer approved", {
          description: `Awaiting acceptance from ${receiving?.name ?? "receiving hospital"}.`,
        });
      },

      rejectTransfer: (id, note) => {
        patchTransfer(id, "Rejected", `Admin — ${CURRENT_ADMIN.name}`, note);
        log("Transfer Rejected", "Transfer", id, note || "Transfer request rejected by admin.");
        toast.success("Transfer rejected", { description: `${id} has been rejected.` });
      },

      requestInfo: (id, note) => {
        patchTransfer(id, "Under Review", `Admin — ${CURRENT_ADMIN.name}`, `Info requested: ${note}`);
        log("Transfer Information Requested", "Transfer", id, `Additional information requested: ${note}`);
        toast.success("Information requested", {
          description: "The requesting hospital has been notified in the prototype.",
        });
      },

      respondReceivingHospital: (id, accepted, note) => {
        const t = transfers.find((x) => x.id === id);
        const receiving = hospitals.find((h) => h.id === t?.receivingHospitalId);
        if (accepted) {
          patchTransfer(id, "Accepted", receiving?.name ?? "Receiving Hospital", note);
          log(
            "Patient Transfer Accepted",
            "Transfer",
            id,
            `${receiving?.name ?? "Receiving hospital"} accepted the transfer.`,
            receiving?.name ?? "Receiving Hospital Desk",
            "Hospital",
          );
          toast.success("Transfer accepted", {
            description: `${receiving?.name ?? "Receiving hospital"} accepted the patient.`,
          });
        } else {
          patchTransfer(id, "Rejected", receiving?.name ?? "Receiving Hospital", note);
          log(
            "Patient Transfer Declined",
            "Transfer",
            id,
            `${receiving?.name ?? "Receiving hospital"} declined the transfer.`,
            receiving?.name ?? "Receiving Hospital Desk",
            "Hospital",
          );
          toast.success("Transfer declined", { description: `${id} marked as Rejected.` });
        }
      },

      advanceTransfer: (id, next) => {
        const t = transfers.find((x) => x.id === id);
        const receiving = hospitals.find((h) => h.id === t?.receivingHospitalId);
        const by =
          next === "Treatment Commenced" || next === "Completed"
            ? (receiving?.name ?? "Receiving Hospital")
            : `Admin — ${CURRENT_ADMIN.name}`;
        patchTransfer(id, next, by);
        log(`Transfer ${next}`, "Transfer", id, `Transfer progressed to ${next}.`);
        if (next === "Completed" && t) {
          setPatients((prev) =>
            prev.map((p) =>
              p.id === t.patientId
                ? {
                    ...p,
                    hospitalId: t.receivingHospitalId ?? p.hospitalId,
                    status: "Transferred",
                    lastUpdated: today(),
                    hospitalHistory: [
                      ...p.hospitalHistory.map((h) => (h.to ? h : { ...h, to: today() })),
                      {
                        hospitalId: t.receivingHospitalId ?? p.hospitalId,
                        from: today(),
                        to: null,
                        reason: `Transfer ${t.id} — ${t.requiredService}`,
                      },
                    ],
                  }
                : p,
            ),
          );
        }
        toast.success(`Transfer ${next.toLowerCase()}`, { description: `${id} updated.` });
      },

      matchingHospitals: (service, excludeId) => {
        const candidates = hospitals
          .filter((h) => h.id !== excludeId && h.verification !== "Suspended")
          .map((h) => ({ hospital: h, status: h.capabilities[service], recommended: false }));
        const order: Record<string, number> = {
          Available: 0,
          "Temporarily Unavailable": 1,
          "Not Available": 2,
        };
        candidates.sort((a, b) => {
          const s = order[a.status] - order[b.status];
          if (s !== 0) return s;
          if (a.hospital.status !== b.hospital.status) return a.hospital.status === "Active" ? -1 : 1;
          return b.hospital.beds - a.hospital.beds;
        });
        const first = candidates.find(
          (c) => c.status === "Available" && c.hospital.status === "Active",
        );
        if (first) first.recommended = true;
        return candidates;
      },
    };
  }, [audit, campaigns, causes, donations, hospitals, log, patchTransfer, patients, transfers]);

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be used inside PortalProvider");
  return ctx;
}
