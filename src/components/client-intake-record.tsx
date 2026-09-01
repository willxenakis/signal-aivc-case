import type { Enquiry } from "@/domain/schemas";

type ClientIntakeRecordProps = {
  enquiry: Enquiry;
};

const submittedAtFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function pretty(value: string | null) {
  return (value ?? "Not supplied").replaceAll("_", " ");
}

function submittedAt(value: string) {
  return submittedAtFormatter.format(new Date(value));
}

export function ClientIntakeRecord({ enquiry }: ClientIntakeRecordProps) {
  const fields = [
    ["Contact", enquiry.contactName],
    ["Email", enquiry.senderEmail],
    ["Company", enquiry.companyName],
    ["Industry", pretty(enquiry.selfReportedIndustry)],
    ["Company size", enquiry.companySize],
    ["Urgency", pretty(enquiry.urgency)],
    ["Received", submittedAt(enquiry.submittedAt)],
  ];

  return (
    <article className="client-record">
      <header className="client-record-header">
        <div>
          <span className="eyebrow">Original intake record</span>
          <strong>Exact values stored from the enquiry</strong>
        </div>
        <code>{enquiry.id}</code>
      </header>
      <div className="client-record-description">
        <span>Description</span>
        <p>{enquiry.description}</p>
      </div>
      <dl className="client-record-grid">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
