import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import {
  ConfirmDialog,
  DetailDrawer,
  DrawerSection,
  EmptyState,
  Field,
  FieldGrid,
  FilterBar,
  FilterSelect,
  PageHeader,
  SearchInput,
  SectionCard,
  StatusBadge,
  TableShell,
  Td,
  Th,
  Tr,
} from "@/components/admin/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { usePortal, TRANSFER_FLOW } from "@/store/portal";
import { dateTime, shortDate } from "@/lib/format";
import type { TransferStatus } from "@/data/fundezer";

export const Route = createFileRoute("/_authenticated/transfers")({
  head: () => ({
    meta: [
      { title: "Hospital Transfers — FundEzer Admin Portal" },
      {
        name: "description",
        content:
          "Review, approve and track patient transfer requests between partner hospitals, from submission to treatment completion.",
      },
      { property: "og:title", content: "Hospital Transfers — FundEzer Admin Portal" },
      {
        property: "og:description",
        content: "Review, approve and track patient transfers between partner hospitals.",
      },
    ],
  }),
  component: TransfersPage,
});

const OPEN_STATUSES = ["Submitted", "Under Review", "Receiving Hospital Pending"];

function TransfersPage() {
  const {
    transfers,
    patient,
    hospital,
    matchingHospitals,
    reviewTransfer,
    approveTransfer,
    rejectTransfer,
    requestInfo,
    respondReceivingHospital,
    advanceTransfer,
  } = usePortal();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [urgency, setUrgency] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [choice, setChoice] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | "approve" | "reject" | "info" | "decline">(null);

  const rows = useMemo(
    () =>
      transfers.filter((t) => {
        const q = query.trim().toLowerCase();
        const p = patient(t.patientId);
        const matchQ =
          !q ||
          [t.id, t.requiredService, p?.displayName ?? "", t.reason].some((v) =>
            v.toLowerCase().includes(q),
          );
        return (
          matchQ &&
          (status === "all" ||
            (status === "open" ? OPEN_STATUSES.includes(t.status) : t.status === status)) &&
          (urgency === "all" || t.urgency === urgency)
        );
      }),
    [transfers, query, status, urgency, patient],
  );

  const active = transfers.find((t) => t.id === selected) ?? null;
  const candidates = active ? matchingHospitals(active.requiredService, active.fromHospitalId) : [];
  const receiving = active?.receivingHospitalId ? hospital(active.receivingHospitalId) : undefined;
  const stageIndex = active ? TRANSFER_FLOW.indexOf(active.status) : -1;
  const nextStage: TransferStatus | null =
    stageIndex >= 0 && stageIndex < TRANSFER_FLOW.length - 1
      ? (TRANSFER_FLOW[stageIndex + 1] as TransferStatus)
      : null;

  const close = () => {
    setSelected(null);
    setNote("");
    setChoice(null);
  };

  const footer = active ? (
    <>
      {active.status === "Submitted" ? (
        <Button variant="outline" onClick={() => reviewTransfer(active.id)}>
          Move to review
        </Button>
      ) : null}
      {["Submitted", "Under Review"].includes(active.status) ? (
        <>
          <Button
            variant="outline"
            onClick={() => setConfirm("info")}
            disabled={note.trim().length < 5}
          >
            Request info
          </Button>
          <Button variant="ghost" onClick={() => setConfirm("reject")}>
            Reject
          </Button>
          <Button
            onClick={() => setConfirm("approve")}
            disabled={!(choice ?? active.recommendedHospitalId)}
          >
            Approve transfer
          </Button>
        </>
      ) : null}
      {active.status === "Receiving Hospital Pending" ? (
        <>
          <Button variant="ghost" onClick={() => setConfirm("decline")}>
            <X className="size-4" /> Hospital declines
          </Button>
          <Button
            onClick={() => {
              respondReceivingHospital(active.id, true, note || undefined);
              setNote("");
            }}
          >
            <Check className="size-4" /> Hospital accepts
          </Button>
        </>
      ) : null}
      {nextStage ? (
        <Button onClick={() => advanceTransfer(active.id, nextStage)}>Mark {nextStage}</Button>
      ) : null}
    </>
  ) : null;

  return (
    <>
      <PageHeader
        title="Hospital Transfers"
        description="Route patients to facilities with the capability to treat them."
      />

      <SectionCard bodyClassName="p-0">
        <FilterBar>
          <SearchInput value={query} onChange={setQuery} placeholder="Search transfers" />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "open", label: "Awaiting action" },
              ...[
                "Submitted",
                "Under Review",
                "Receiving Hospital Pending",
                "Accepted",
                "Patient Notified",
                "Transfer Scheduled",
                "Treatment Commenced",
                "Completed",
                "Rejected",
                "Cancelled",
              ].map((v) => ({ value: v, label: v })),
            ]}
          />
          <FilterSelect
            label="Urgency"
            value={urgency}
            onChange={setUrgency}
            options={["Routine", "Urgent", "Critical"].map((v) => ({ value: v, label: v }))}
          />
          <span className="num ml-auto text-xs text-muted-foreground">
            {rows.length} of {transfers.length}
          </span>
        </FilterBar>

        {rows.length === 0 ? (
          <EmptyState
            searching
            title="No transfer requests match"
            description="Adjust the status or urgency filter to see more requests."
          />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Request</Th>
                <Th>Patient</Th>
                <Th>From</Th>
                <Th>Service</Th>
                <Th>Urgency</Th>
                <Th>Status</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <Tr
                  key={t.id}
                  onClick={() => {
                    setSelected(t.id);
                    setNote("");
                    setChoice(t.recommendedHospitalId);
                  }}
                >
                  <Td className="num font-medium">{t.id}</Td>
                  <Td className="max-w-[14rem] truncate">{patient(t.patientId)?.displayName}</Td>
                  <Td className="max-w-[16rem] truncate text-muted-foreground">
                    {hospital(t.fromHospitalId)?.name}
                  </Td>
                  <Td>{t.requiredService}</Td>
                  <Td>
                    <StatusBadge status={t.urgency} />
                  </Td>
                  <Td>
                    <StatusBadge status={t.status} />
                  </Td>
                  <Td className="num text-muted-foreground">{shortDate(t.date)}</Td>
                </Tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </SectionCard>

      <DetailDrawer
        open={!!active}
        onOpenChange={(o) => !o && close()}
        title={active ? `Transfer ${active.id}` : ""}
        subtitle={
          active ? `${patient(active.patientId)?.displayName} · ${active.requiredService}` : ""
        }
        footer={footer}
      >
        {active ? (
          <>
            <DrawerSection title="Request details">
              <FieldGrid>
                <Field label="Patient" value={patient(active.patientId)?.displayName ?? "—"} />
                <Field label="Campaign" value={<span className="num">{active.campaignId}</span>} />
                <Field label="From hospital" value={hospital(active.fromHospitalId)?.name ?? "—"} />
                <Field label="Required service" value={active.requiredService} />
                <Field label="Urgency" value={<StatusBadge status={active.urgency} />} />
                <Field label="Status" value={<StatusBadge status={active.status} />} />
                <Field label="Treatment phase" value={active.treatmentPhase} />
                <Field label="Requested" value={shortDate(active.date)} />
                <Field label="Reason" value={active.reason} className="sm:col-span-2" />
                <Field label="Treatment plan" value={active.treatmentPlan} className="sm:col-span-2" />
                {receiving ? (
                  <Field label="Receiving hospital" value={receiving.name} className="sm:col-span-2" />
                ) : null}
              </FieldGrid>
            </DrawerSection>

            {["Submitted", "Under Review"].includes(active.status) ? (
              <DrawerSection title="Matching hospitals">
                <div className="space-y-2">
                  {candidates.slice(0, 6).map((c) => {
                    const picked = (choice ?? active.recommendedHospitalId) === c.hospital.id;
                    return (
                      <button
                        key={c.hospital.id}
                        type="button"
                        onClick={() => setChoice(c.hospital.id)}
                        className={cn(
                          "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors",
                          picked
                            ? "border-primary bg-primary-soft/60"
                            : "border-border hover:bg-secondary",
                        )}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {c.hospital.name}
                            {c.recommended ? (
                              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground uppercase">
                                Recommended
                              </span>
                            ) : null}
                          </p>
                          <p className="num truncate text-xs text-muted-foreground">
                            {c.hospital.city} · {c.hospital.beds} beds · {c.hospital.status}
                          </p>
                        </div>
                        <StatusBadge status={c.status} />
                      </button>
                    );
                  })}
                </div>
              </DrawerSection>
            ) : null}

            {["Submitted", "Under Review", "Receiving Hospital Pending"].includes(active.status) ? (
              <DrawerSection title="Admin note">
                <Textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note attached to the next action (required to request information)."
                />
              </DrawerSection>
            ) : null}

            <DrawerSection title="Workflow">
              <ol className="space-y-2">
                {TRANSFER_FLOW.map((s) => {
                  const done = active.timeline.some((e) => e.status === s);
                  return (
                    <li key={s} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-full",
                          done ? "bg-success-soft text-success" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {done ? <Check className="size-3" /> : null}
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          done ? "font-medium text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {s}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </DrawerSection>

            <DrawerSection title="Timeline">
              <div className="space-y-3">
                {[...active.timeline].reverse().map((e, i) => (
                  <div key={`${e.status}-${i}`} className="rounded-md border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <StatusBadge status={e.status} />
                      <span className="num text-xs text-muted-foreground">{dateTime(e.at)}</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground">{e.by}</p>
                    {e.note ? (
                      <p className="mt-1 text-sm text-muted-foreground">{e.note}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </DrawerSection>
          </>
        ) : null}
      </DetailDrawer>

      <ConfirmDialog
        open={confirm === "approve"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Approve transfer?"
        description={`The receiving hospital will be asked to accept ${active ? patient(active.patientId)?.displayName : "the patient"}.`}
        confirmLabel="Approve"
        onConfirm={() => {
          if (active) approveTransfer(active.id, choice ?? active.recommendedHospitalId);
          setConfirm(null);
        }}
      />
      <ConfirmDialog
        open={confirm === "reject"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Reject transfer request?"
        description="The requesting hospital will be notified that this transfer will not proceed."
        confirmLabel="Reject"
        destructive
        onConfirm={() => {
          if (active) rejectTransfer(active.id, note.trim() || "Rejected by admin.");
          setConfirm(null);
          setNote("");
        }}
      />
      <ConfirmDialog
        open={confirm === "info"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Request more information?"
        description="Your note will be sent to the requesting hospital and the request stays under review."
        confirmLabel="Send request"
        onConfirm={() => {
          if (active) requestInfo(active.id, note.trim());
          setConfirm(null);
          setNote("");
        }}
      />
      <ConfirmDialog
        open={confirm === "decline"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Receiving hospital declines?"
        description="The transfer will be marked as rejected and can be re-routed to another facility."
        confirmLabel="Record decline"
        destructive
        onConfirm={() => {
          if (active) respondReceivingHospital(active.id, false, note.trim() || undefined);
          setConfirm(null);
          setNote("");
        }}
      />
    </>
  );
}
