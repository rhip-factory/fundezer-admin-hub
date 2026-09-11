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
import { SERVICES } from "@/data/fundezer";
import { shortDate } from "@/lib/format";

export const Route = createFileRoute("/hospitals")({
  head: () => ({
    meta: [
      { title: "Hospitals — FundEzer Admin Portal" },
      {
        name: "description",
        content:
          "Partner hospital directory with verification status, service capabilities, equipment and bed capacity.",
      },
      { property: "og:title", content: "Hospitals — FundEzer Admin Portal" },
      {
        property: "og:description",
        content: "Partner hospital directory with capabilities, equipment and capacity.",
      },
    ],
  }),
  component: HospitalsPage,
});

function HospitalsPage() {
  const { hospitals, patients } = usePortal();
  const [query, setQuery] = useState("");
  const [verification, setVerification] = useState("all");
  const [status, setStatus] = useState("all");
  const [service, setService] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      hospitals.filter((h) => {
        const q = query.trim().toLowerCase();
        const matchQ =
          !q || [h.name, h.city, h.state, h.id].some((v) => v.toLowerCase().includes(q));
        return (
          matchQ &&
          (verification === "all" || h.verification === verification) &&
          (status === "all" || h.status === status) &&
          (service === "all" ||
            h.capabilities[service as (typeof SERVICES)[number]] === "Available")
        );
      }),
    [hospitals, query, verification, status, service],
  );

  const active = hospitals.find((h) => h.id === selected) ?? null;
  const activePatients = active ? patients.filter((p) => p.hospitalId === active.id) : [];

  return (
    <>
      <PageHeader
        title="Hospitals"
        description="Accredited facilities, their capabilities and current partnership status."
      />

      <SectionCard bodyClassName="p-0">
        <FilterBar>
          <SearchInput value={query} onChange={setQuery} placeholder="Search hospitals or cities" />
          <FilterSelect
            label="Verification"
            value={verification}
            onChange={setVerification}
            options={["Verified", "Pending", "Suspended"].map((v) => ({ value: v, label: v }))}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={["Active", "Inactive"].map((v) => ({ value: v, label: v }))}
          />
          <FilterSelect
            label="Service"
            value={service}
            onChange={setService}
            options={SERVICES.map((s) => ({ value: s, label: s }))}
          />
          <span className="num ml-auto text-xs text-muted-foreground">
            {rows.length} of {hospitals.length}
          </span>
        </FilterBar>

        {rows.length === 0 ? (
          <EmptyState
            searching
            title="No hospitals match your filters"
            description="Adjust the service capability or verification filter to widen the search."
          />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Hospital</Th>
                <Th>Location</Th>
                <Th>Beds</Th>
                <Th>Verification</Th>
                <Th>Status</Th>
                <Th>Onboarded</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => (
                <Tr key={h.id} onClick={() => setSelected(h.id)}>
                  <Td className="max-w-[20rem] truncate font-medium">{h.name}</Td>
                  <Td className="text-muted-foreground">
                    {h.city}, {h.state}
                  </Td>
                  <Td className="num">{h.beds}</Td>
                  <Td>
                    <StatusBadge status={h.verification} />
                  </Td>
                  <Td>
                    <StatusBadge status={h.status} />
                  </Td>
                  <Td className="num text-muted-foreground">{shortDate(h.onboarded)}</Td>
                </Tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </SectionCard>

      <DetailDrawer
        open={!!active}
        onOpenChange={(o) => !o && setSelected(null)}
        title={active?.name ?? ""}
        subtitle={active ? `${active.city}, ${active.state} · ${active.id}` : ""}
      >
        {active ? (
          <>
            <DrawerSection title="Facility details">
              <FieldGrid>
                <Field label="Contact role" value={active.contactRole} />
                <Field label="Email" value={active.email} />
                <Field label="Phone" value={<span className="num">{active.phone}</span>} />
                <Field label="Beds" value={<span className="num">{active.beds}</span>} />
                <Field label="Verification" value={<StatusBadge status={active.verification} />} />
                <Field label="Status" value={<StatusBadge status={active.status} />} />
                <Field label="Accreditation" value={active.accreditation} className="sm:col-span-2" />
              </FieldGrid>
            </DrawerSection>

            <DrawerSection title="Service capabilities">
              <div className="grid gap-2 sm:grid-cols-2">
                {SERVICES.map((s) => (
                  <div
                    key={s}
                    className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                  >
                    <span className="truncate text-sm text-foreground">{s}</span>
                    <StatusBadge status={active.capabilities[s]} />
                  </div>
                ))}
              </div>
            </DrawerSection>

            <DrawerSection title="Equipment">
              <div className="space-y-2">
                {active.equipment.map((e) => (
                  <div
                    key={e.name}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{e.name}</p>
                      <p className="text-xs text-muted-foreground">{e.condition}</p>
                    </div>
                    <span className="num text-sm text-muted-foreground">×{e.count}</span>
                  </div>
                ))}
              </div>
            </DrawerSection>

            <DrawerSection title={`Patients in care (${activePatients.length})`}>
              {activePatients.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No patients currently assigned to this facility.
                </p>
              ) : (
                <div className="space-y-2">
                  {activePatients.map((p) => (
                    <div
                      key={p.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {p.displayName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{p.treatment}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  ))}
                </div>
              )}
            </DrawerSection>
          </>
        ) : null}
      </DetailDrawer>
    </>
  );
}
