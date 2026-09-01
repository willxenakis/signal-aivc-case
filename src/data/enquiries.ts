import { syntheticCompanies } from "@/data/companies";
import type { Enquiry } from "@/domain/schemas";

type EnquirySeed = {
  description: string;
  urgency?: Enquiry["urgency"];
  industry?: Enquiry["selfReportedIndustry"];
  companySize?: Enquiry["companySize"];
};

const enquirySeeds: EnquirySeed[][] = [
  [
    { description: "We need an AI roadmap that prioritizes the highest-value opportunities across our eight plants and defines a two-year business case." },
    { description: "Our MES, ERP, and equipment historian disagree on asset identities. We need a governed data foundation for future AI applications." },
    { description: "We want a maintenance technician copilot that summarizes work history and drafts recommended troubleshooting steps." },
    { description: "Can you build predictive maintenance and production scheduling models across all plants with real-time equipment telemetry?", urgency: "high" },
    { description: "We have an early AI policy but need a practical model-risk and safety review before giving plant teams generative AI tools." },
  ],
  [
    { description: "Our leadership team needs a portfolio assessment to prioritize clinical and administrative AI use cases without chasing pilots." },
    { description: "We need to unify EHR, claims, scheduling, and call-center data with strict access controls for analytics and AI." },
    { description: "Build a patient access assistant that answers scheduling questions and drafts responses using approved knowledge." },
    { description: "We want to optimize operating-room schedules across six hospitals while accounting for staffing, equipment, and urgent cases." },
    { description: "Please assess governance, privacy, validation, and monitoring requirements for an AI-assisted claims review workflow.", urgency: "critical" },
  ],
  [
    { description: "Help us define an enterprise AI strategy with measurable value across lending, treasury, service, and risk operations." },
    { description: "We need a governed customer and transaction data platform that can support models across several legacy banking systems." },
    { description: "We want an analyst copilot that summarizes commercial loan files and drafts credit memo sections for human review." },
    { description: "Can you improve transaction anomaly detection and prioritize AML investigations using our historical case outcomes?", urgency: "high" },
    { description: "Our model risk team needs an independent review of generative AI controls, testing, audit trails, and third-party risk." },
  ],
  [
    { description: "We need to identify and value the strongest AI opportunities across underwriting, claims, distribution, and service." },
    { description: "Policy, claims, billing, document, and image data live in separate platforms; we need a reusable AI-ready data layer." },
    { description: "Build a claims adjuster assistant that summarizes files, identifies missing documents, and drafts customer updates." },
    { description: "We want decision models that detect suspicious claims and prioritize them for special investigation without auto-denial." },
    { description: "Assess fairness, explainability, privacy, and state regulatory controls for our proposed AI-assisted underwriting program." },
  ],
  [
    { description: "Create a value-backed AI transformation roadmap spanning field operations, grid planning, customer service, and corporate functions." },
    { description: "We need to connect asset, GIS, outage, work-order, weather, and telemetry data into a shared operational model." },
    { description: "Develop a field technician assistant that retrieves equipment procedures and summarizes recent asset alarms." },
    { description: "We need outage risk prediction and crew scheduling across two million accounts before the next storm season.", urgency: "critical" },
    { description: "Review the cybersecurity, reliability, and human-override controls for AI used in critical grid operations." },
  ],
  [
    { description: "Help our executives prioritize AI investments across brokerage, warehousing, routing, and last-mile delivery." },
    { description: "We need a canonical shipment and carrier data model across TMS, WMS, GPS, partner spreadsheets, and customer feeds." },
    { description: "Build an exception-management copilot that summarizes late shipments and drafts updates for customers and carriers." },
    { description: "Optimize daily route, capacity, and warehouse labor decisions while accounting for service levels and network constraints." },
    { description: "We need guidance on responsible monitoring of drivers and appropriate controls for automated logistics recommendations." },
  ],
  [
    { description: "Develop an AI growth and productivity strategy across merchandising, stores, ecommerce, support, and marketplace operations." },
    { description: "We need an identity-resolved data platform joining POS, ecommerce, loyalty, product, inventory, and campaign data." },
    { description: "Create a customer support agent that drafts responses, summarizes conversations, and cites policy and order evidence." },
    { description: "Improve demand forecasting, inventory allocation, and replenishment decisions across 180 stores and fulfillment centers." },
    { description: "Assess privacy, consumer transparency, and bias risks before using AI for personalized offers and customer segmentation." },
  ],
  [
    { description: "We need a product and platform strategy for embedding AI into our monitoring product while protecting margins and trust." },
    { description: "Design a governed telemetry and customer data layer for product analytics and future AI features." },
    { description: "Build a support copilot that clusters incidents, finds similar resolutions, and drafts technically accurate replies." },
    { description: "Predict account churn and recommend interventions using product usage, support, contract, and customer-success data." },
    { description: "Create an AI operating model and training program so product, engineering, legal, and go-to-market teams can ship responsibly." },
  ],
  [
    { description: "Prioritize AI opportunities across research, clinical development, regulatory operations, safety, and commercial teams." },
    { description: "Unify scientific, clinical, safety, and regulatory knowledge with traceable lineage and permission-aware retrieval." },
    { description: "Build a regulatory authoring copilot that drafts sections only from approved study evidence and preserves citations." },
    { description: "We want trial-site risk forecasting across global programs using operational, enrollment, and data-quality signals." },
    { description: "Define validation, monitoring, audit, and human-approval controls for generative AI used in regulated submissions.", urgency: "high" },
  ],
  [
    { description: "Define a practical AI transformation roadmap across network operations, field service, customer care, and revenue assurance." },
    { description: "Create a shared network and customer data foundation across telemetry, tickets, inventory, CRM, and legacy billing." },
    { description: "Build a contact-center assistant that diagnoses service issues, retrieves account context, and drafts next-best actions." },
    { description: "Predict network degradation and optimize technician dispatch using alarms, topology, weather, and work history." },
    { description: "Review privacy, security, and acceptable-use controls for AI processing customer communications and location data." },
  ],
  [
    { description: "Help us prioritize where AI can reduce permit backlogs, improve inspections, and make resident services more responsive." },
    { description: "We need a reliable data model across permitting, GIS, inspections, work orders, documents, and resident requests." },
    { description: "Build a resident service assistant that answers questions from published rules and creates properly categorized requests." },
    { description: "Optimize inspector and maintenance crew schedules across the city using location, priority, skills, and service targets." },
    { description: "Assess public-records, accessibility, procurement, bias, and appeal requirements for our proposed AI services.", urgency: "high" },
  ],
  [
    { description: "Create an AI strategy that identifies which engagement workflows to transform first and how to measure margin and quality impact." },
    { description: "We need a permission-aware knowledge layer across CRM, project files, deliverables, staffing, and financial systems." },
    { description: "Build an engagement copilot that summarizes diligence documents, drafts workpapers, and links every assertion to source evidence." },
    { description: "Predict project margin risk and optimize specialist staffing across a portfolio of active client engagements." },
    { description: "Design an adoption program, role-based training, and operating model that helps consultants use AI without exposing client data." },
  ],
];

export const syntheticEnquiries: Enquiry[] = syntheticCompanies.flatMap(
  (company, companyIndex) =>
    enquirySeeds[companyIndex].map((seed, enquiryIndex) => ({
      id: `${company.id}-ENQ-${String(enquiryIndex + 1).padStart(2, "0")}`,
      contactName: ["Jordan Lee", "Morgan Patel", "Casey Rivera", "Taylor Kim", "Avery Brooks"][enquiryIndex],
      senderEmail: `contact${enquiryIndex + 1}@${company.domain}`,
      companyName: company.name,
      description: seed.description,
      selfReportedIndustry: seed.industry ?? company.industry,
      companySize: seed.companySize ?? company.employeeBand,
      urgency: seed.urgency ?? "standard",
      submittedAt: new Date(
        Date.UTC(2026, 7, 18 + companyIndex, 13 + enquiryIndex, 15),
      ).toISOString(),
    })),
);
