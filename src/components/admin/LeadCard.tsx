import type { ReactNode } from "react";
import { Building2, CalendarDays, Mail, Phone, User } from "lucide-react";

export interface LeadRecord {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  [key: string]: unknown;
}

const TYPE_LABELS: Record<string, string> = {
  consultation: "Consultation",
  accompagnement: "Accompagnement",
  formation: "Formation",
  audit: "Audit",
  "web-service": "Service Web",
};

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) {
    return value.map((item) => asText(item)).filter(Boolean).join(", ");
  }
  return "";
}

function firstText(lead: LeadRecord, keys: string[]): string {
  for (const key of keys) {
    const text = asText(lead[key]);
    if (text) return text;
  }
  return "";
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">
        <Icon className="h-3.5 w-3.5 shrink-0 text-accent-600" />
        {label}
      </p>
      <div className="text-sm text-primary-900">{children}</div>
    </div>
  );
}

export function leadDisplayName(lead: LeadRecord): string {
  return (
    firstText(lead, ["contactName", "name", "responsableName", "applicantName"]) ||
    "—"
  );
}

export function LeadCard({
  lead,
  createdLabel,
  statusControl,
}: {
  lead: LeadRecord;
  createdLabel: string;
  statusControl: ReactNode;
}) {
  const name = leadDisplayName(lead);
  const email = firstText(lead, ["contactEmail", "email"]);
  const phone = firstText(lead, ["contactPhone", "phone"]);
  const company = firstText(lead, ["company", "companyName", "entityName"]);
  const message = firstText(lead, [
    "message",
    "requestInfo",
    "entityDetails",
    "companyActivity",
  ]);

  const extras: { label: string; value: string }[] = [
    { label: "Secteur", value: firstText(lead, ["sector"]) },
    { label: "Type de demande", value: firstText(lead, ["requestType"]) },
    { label: "Formation", value: firstText(lead, ["trainingType"]) },
    { label: "Public", value: firstText(lead, ["audienceType"]) },
    { label: "Normes", value: firstText(lead, ["norms", "customNorm"]) },
    { label: "Nature d'audit", value: firstText(lead, ["auditNature", "customAuditNature"]) },
    {
      label: "Rendez-vous",
      value: [firstText(lead, ["appointmentDate"]), firstText(lead, ["appointmentTime"])]
        .filter(Boolean)
        .join(" · "),
    },
  ].filter((item) => item.value);

  return (
    <article className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 border-b border-primary-50 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
              {TYPE_LABELS[lead.type] || lead.type}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
              <CalendarDays className="h-3.5 w-3.5" />
              {createdLabel}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-primary-900">{name}</h3>
          {company ? (
            <p className="mt-0.5 text-sm text-text-muted">{company}</p>
          ) : null}
        </div>
        <div className="shrink-0">{statusControl}</div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field icon={User} label="Nom du client">
          {name}
        </Field>
        <Field icon={Mail} label="Email">
          {email ? (
            <a
              href={`mailto:${email}`}
              className="break-all font-medium text-accent-700 hover:text-accent-600 hover:underline"
            >
              {email}
            </a>
          ) : (
            <span className="text-text-muted">—</span>
          )}
        </Field>
        <Field icon={Phone} label="Téléphone">
          {phone ? (
            <a
              href={telHref(phone)}
              className="font-medium text-accent-700 hover:text-accent-600 hover:underline"
            >
              {phone}
            </a>
          ) : (
            <span className="text-text-muted">—</span>
          )}
        </Field>
        {company ? (
          <Field icon={Building2} label="Entreprise">
            {company}
          </Field>
        ) : null}
      </div>

      {extras.length > 0 ? (
        <dl className="mt-4 grid gap-3 rounded-xl border border-primary-50 bg-surface-muted/60 px-4 py-3 sm:grid-cols-2">
          {extras.map((item) => (
            <div key={item.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {item.label}
              </dt>
              <dd className="mt-0.5 text-sm text-primary-900">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {message ? (
        <blockquote className="mt-4 rounded-xl border-l-4 border-accent-400 bg-accent-50/50 px-4 py-3 text-sm leading-relaxed text-primary-800">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-accent-700">
            Message
          </p>
          <p className="whitespace-pre-line">{message}</p>
        </blockquote>
      ) : null}
    </article>
  );
}
