import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Field,
  FieldGrid,
  LabeledInput,
  PageHeader,
  SectionCard,
  StatusBadge,
  TableShell,
  Td,
  Th,
  Tr,
} from "@/components/admin/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CURRENT_ADMIN, usePortal } from "@/store/portal";
import { dateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Admin Profile — FundEzer Admin Portal" },
      {
        name: "description",
        content:
          "Manage your FundEzer admin account details, contact information and review your recent portal activity.",
      },
      { property: "og:title", content: "Admin Profile — FundEzer Admin Portal" },
      {
        property: "og:description",
        content: "Manage your admin account details and review recent activity.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { audit } = usePortal();
  const [name, setName] = useState(CURRENT_ADMIN.name);
  const [email, setEmail] = useState(CURRENT_ADMIN.email);
  const [phone, setPhone] = useState("+234 809 220 4410");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mine = audit.filter((a) => a.user === CURRENT_ADMIN.name).slice(0, 8);

  const save = () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 3) next["name"] = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next["email"] = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    toast.success("Profile saved", { description: "Prototype: changes are kept in memory only." });
  };

  return (
    <>
      <PageHeader
        title="Admin Profile"
        description="Your account details and recent activity in the portal."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <SectionCard title="Account details" description="Update how you appear in the audit log">
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledInput label="Full name" error={errors["name"] ?? ""}>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </LabeledInput>
            <LabeledInput label="Email" error={errors["email"] ?? ""}>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </LabeledInput>
            <LabeledInput label="Phone">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </LabeledInput>
            <LabeledInput label="Role" hint="Roles are assigned by a super admin.">
              <Input value={CURRENT_ADMIN.role} readOnly className="bg-muted" />
            </LabeledInput>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setName(CURRENT_ADMIN.name);
                setEmail(CURRENT_ADMIN.email);
                setErrors({});
              }}
            >
              Reset
            </Button>
            <Button onClick={save}>Save changes</Button>
          </div>
        </SectionCard>

        <SectionCard title="Access">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
              {CURRENT_ADMIN.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="mt-5">
            <FieldGrid>
              <Field label="Role" value={<StatusBadge status="Active" tone="brand" />} />
              <Field label="Permission set" value={CURRENT_ADMIN.role} />
              <Field label="Two-factor" value="Enabled (authenticator app)" className="sm:col-span-2" />
            </FieldGrid>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Your recent activity" bodyClassName="p-0">
        <TableShell>
          <thead>
            <tr>
              <Th>Timestamp</Th>
              <Th>Action</Th>
              <Th>Record</Th>
              <Th>Description</Th>
            </tr>
          </thead>
          <tbody>
            {mine.map((a) => (
              <Tr key={a.id}>
                <Td className="num whitespace-nowrap text-muted-foreground">{dateTime(a.at)}</Td>
                <Td className="font-medium">{a.action}</Td>
                <Td className="num text-muted-foreground">{a.record}</Td>
                <Td className="text-muted-foreground">{a.description}</Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
      </SectionCard>
    </>
  );
}
