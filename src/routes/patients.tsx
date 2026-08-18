import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
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
import { usePortal } from "@/store/portal";
import { shortDate } from "@/lib/format";
import { Check, Circle } from "lucide-react";

export const Route = createFileRoute("/patients")({
  head: () => ({
    meta: [
      { title: "Patients — FundEzer Admin Portal" },
      {
        name: "description",
        content:
          "Browse anonymised patient records, treatment journeys, hospital history and linked funding campaigns.",
      },
      { property: "og:title", content: "Patients — FundEzer Admin Portal" },
      {
        property: "og:description",
        content: "Anonymised patient records, treatment journeys and linked campaigns.",
      },
    ],
  }),
  component: PatientsPage,
});

function PatientsPage() {
  const { patients, hospital, cause, campaign } = usePortal();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [causeFilter, setCauseFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const { causes } = usePortal();

  const rows = useMemo(
    () =>
      patients.filter((p) => {
        const q = query.trim().toLowerCase();
        const matchQ =
          !q ||
          [p.displayName, p.reference, p.treatment, p.id].some((v) =>
            v.toLowerCase().includes(q),
          );
        return (
          matchQ &&
          (status === "all" || p.status === status) &&
          (causeFilter === "all" || p.causeId === causeFilter)
        );
      }),
    [patients, query, status, causeFilter],
  );

  const active = patients.find((p) => p.id === selected) ?? null;

  return (
    <>
      <PageHeader
        title="Patients"
        description="Anonymised patient records linked to hospitals, causes and campaigns."
      />

      <SectionCard bodyClassName="p-0">
        <FilterBar>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search patients or references"
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              "Active",
              "Treatment in Progress",
              "Awaiting Treatment",
              "Completed",
              "Transferred",
            ].map((v) => ({ value: v, label: v }))}
          />
          <FilterSelect
            label="Cause"
            value={causeFilter}
            onChange={setCauseFilter}
            options={causes.map((c) => ({ value: c.id, label: c.name }))}
          />
          <span className="num ml-auto text-xs text-muted-foreground">
            {rows.length} of {patients.length}
          </span>
        </FilterBar>

        {rows.length === 0 ? (
          <EmptyState
            searching
            title="No patients match your filters"
            description="Try a different search term or clear the status and cause filters."
          />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Patient</Th>
                <Th>Reference</Th>
                <Th>Hospital</Th>
                <Th>Cause</Th>
                <Th>Treatment stage</Th>
                <Th>Status</Th>
                <Th>Updated</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <Tr key={p.id} onClick={() => setSelected(p.id)}>
                  <Td className="font-medium">{p.displayName}</Td>
                  <Td className="num text-muted-foreground">{p.reference}</Td>
                  <Td className="max-w-[16rem] truncate">{hospital(p.hospitalId)?.name}</Td>
                  <Td>{cause(p.causeId)?.name}</Td>
                  <Td className="text-muted-foreground">{p.treatmentStage}</Td>
                  <Td>
                    <StatusBadge status={p.status} />
                  </Td>
                  <Td className="num text-muted-foreground">{shortDate(p.lastUpdated)}</Td>
                </Tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </SectionCard>

      <DetailDrawer
        open={!!active}
        onOpenChange={(o) => !o && setSelected(null)}
        title={active?.displayName ?? ""}
        subtitle={active ? `${active.reference} · ${active.treatment}` : undefined}
      >
        {active ? (
          <>
            <DrawerSection title="Overview">
              <FieldGrid>
                <Field label="Age band" value={active.ageBand} />
                <Field label="Gender" value={active.gender} />
                <Field label="Hospital" value={hospital(active.hospitalId)?.name ?? "—"} />
                <Field label="Cause" value={cause(active.causeId)?.name ?? "—"} />
                <Field label="Treatment stage" value={active.treatmentStage} />
                <Field label="Status" value={<StatusBadge status={active.status} />} />
                <Field
                  label="Campaign"
                  value={campaign(active.campaignId)?.title ?? active.campaignId}
                />
                <Field label="Guardian" value={active.guardianRef} />
              </FieldGrid>
            </DrawerSection>

            <DrawerSection title="Treatment journey">
              <ol className="space-y-3">
                {active.journey.map((j) => (
                  <li key={j.stage} className="flex items-start gap-3">
                    <span
                      className={
                        j.done
                          ? "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success"
                          : "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
                      }
                    >
                      {j.done ? <Check className="size-3" /> : <Circle className="size-2" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{j.stage}</p>
                      <p className="num text-xs text-muted-foreground">{shortDate(j.date)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </DrawerSection>

            <DrawerSection title="Clinical updates">
              <div className="space-y-3">
                {active.updates.map((u) => (
                  <div key={u.date + u.note} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{u.author}</p>
                      <p className="num text-xs text-muted-foreground">{shortDate(u.date)}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{u.note}</p>
                  </div>
                ))}
              </div>
            </DrawerSection>

            <DrawerSection title="Hospital history">
              <div className="space-y-2">
                {active.hospitalHistory.map((h, i) => (
                  <div
                    key={`${h.hospitalId}-${i}`}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {hospital(h.hospitalId)?.name ?? h.hospitalId}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{h.reason}</p>
                    </div>
                    <p className="num text-xs whitespace-nowrap text-muted-foreground">
                      {shortDate(h.from)} — {h.to ? shortDate(h.to) : "present"}
                    </p>
                  </div>
                ))}
              </div>
            </DrawerSection>
          </>
        ) : null}
      </DetailDrawer>
    </>
  );
}
