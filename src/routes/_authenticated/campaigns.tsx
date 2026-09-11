import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ConfirmDialog,
  DetailDrawer,
  DrawerSection,
  EmptyState,
  Field,
  FieldGrid,
  FilterBar,
  FilterSelect,
  FundingProgress,
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
import { usePortal } from "@/store/portal";
import { naira, shortDate } from "@/lib/format";
import type { CampaignStatus } from "@/data/fundezer";

export const Route = createFileRoute("/campaigns")({
  head: () => ({
    meta: [
      { title: "Campaigns — FundEzer Admin Portal" },
      {
        name: "description",
        content:
          "Moderate patient fundraising campaigns: review drafts, publish, suspend and track amounts raised against target.",
      },
      { property: "og:title", content: "Campaigns — FundEzer Admin Portal" },
      {
        property: "og:description",
        content: "Moderate patient fundraising campaigns and track amounts raised.",
      },
    ],
  }),
  component: CampaignsPage,
});

const STATUSES: CampaignStatus[] = ["Draft", "Under Review", "Active", "Completed", "Suspended"];

function CampaignsPage() {
  const { campaigns, patient, hospital, cause, donations, setCampaignStatus } = usePortal();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState<CampaignStatus | null>(null);

  const rows = useMemo(
    () =>
      campaigns.filter((c) => {
        const q = query.trim().toLowerCase();
        return (
          (!q || [c.title, c.id, c.summary].some((v) => v.toLowerCase().includes(q))) &&
          (status === "all" || c.status === status)
        );
      }),
    [campaigns, query, status],
  );

  const active = campaigns.find((c) => c.id === selected) ?? null;
  const campaignDonations = active
    ? donations.filter((d) => d.campaignId === active.id).slice(0, 8)
    : [];

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Patient fundraising campaigns awaiting moderation or already live."
      />

      <SectionCard bodyClassName="p-0">
        <FilterBar>
          <SearchInput value={query} onChange={setQuery} placeholder="Search campaigns" />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUSES.map((v) => ({ value: v, label: v }))}
          />
          <span className="num ml-auto text-xs text-muted-foreground">
            {rows.length} of {campaigns.length}
          </span>
        </FilterBar>

        {rows.length === 0 ? (
          <EmptyState
            searching
            title="No campaigns match"
            description="Try another search term or reset the status filter."
          />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Campaign</Th>
                <Th>Patient</Th>
                <Th>Cause</Th>
                <Th className="w-56">Progress</Th>
                <Th>Status</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <Tr key={c.id} onClick={() => setSelected(c.id)}>
                  <Td className="max-w-[20rem] truncate font-medium">{c.title}</Td>
                  <Td className="truncate">{patient(c.patientId)?.displayName}</Td>
                  <Td className="text-muted-foreground">{cause(c.causeId)?.name}</Td>
                  <Td>
                    <FundingProgress raised={c.raised} target={c.target} compact />
                  </Td>
                  <Td>
                    <StatusBadge status={c.status} />
                  </Td>
                  <Td className="num text-muted-foreground">{shortDate(c.created)}</Td>
                </Tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </SectionCard>

      <DetailDrawer
        open={!!active}
        onOpenChange={(o) => !o && setSelected(null)}
        title={active?.title ?? ""}
        subtitle={active ? `${active.id} · ${cause(active.causeId)?.name ?? ""}` : ""}
        footer={
          active ? (
            <>
              {active.status !== "Active" ? (
                <Button onClick={() => setPending("Active")}>Publish</Button>
              ) : null}
              {active.status !== "Suspended" ? (
                <Button variant="ghost" onClick={() => setPending("Suspended")}>
                  Suspend
                </Button>
              ) : null}
              {active.status !== "Completed" ? (
                <Button variant="outline" onClick={() => setPending("Completed")}>
                  Mark completed
                </Button>
              ) : null}
            </>
          ) : null
        }
      >
        {active ? (
          <>
            <DrawerSection title="Campaign details">
              <FieldGrid>
                <Field label="Patient" value={patient(active.patientId)?.displayName ?? "—"} />
                <Field label="Hospital" value={hospital(active.hospitalId)?.name ?? "—"} />
                <Field label="Target" value={<span className="num">{naira(active.target)}</span>} />
                <Field label="Raised" value={<span className="num">{naira(active.raised)}</span>} />
                <Field label="Status" value={<StatusBadge status={active.status} />} />
                <Field label="Created" value={shortDate(active.created)} />
                <Field label="Summary" value={active.summary} className="sm:col-span-2" />
              </FieldGrid>
              <div className="mt-4">
                <FundingProgress raised={active.raised} target={active.target} />
              </div>
            </DrawerSection>

            <DrawerSection title="Recent donations">
              {campaignDonations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No donations recorded for this campaign yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {campaignDonations.map((d) => (
                    <div
                      key={d.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{d.donor}</p>
                        <p className="num truncate text-xs text-muted-foreground">
                          {shortDate(d.date)} · {d.channel}
                        </p>
                      </div>
                      <span className="num text-sm font-medium text-foreground">
                        {naira(d.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </DrawerSection>
          </>
        ) : null}
      </DetailDrawer>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title={`Set campaign to ${pending ?? ""}?`}
        description={
          pending === "Suspended"
            ? "Donations will be paused and the campaign hidden from donors."
            : pending === "Completed"
              ? "The campaign will close to new donations and be archived as completed."
              : "The campaign will go live and start accepting donations."
        }
        confirmLabel={`Set ${pending ?? ""}`}
        destructive={pending === "Suspended"}
        onConfirm={() => {
          if (active && pending) setCampaignStatus(active.id, pending);
          setPending(null);
        }}
      />
    </>
  );
}
