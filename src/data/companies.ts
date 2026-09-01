import type { CompanyDossier, Industry } from "@/domain/schemas";

type CompanySeed = {
  id: string;
  name: string;
  domain: string;
  industry: Industry;
  employeeBand: CompanyDossier["employeeBand"];
  headquarters: string;
  summary: string;
  products: string[];
  operations: string[];
  dataAi: string[];
  regulatory: string[];
};

function company(seed: CompanySeed): CompanyDossier {
  const slug = seed.domain.split(".")[0];
  return {
    id: seed.id,
    name: seed.name,
    domain: seed.domain,
    identityConfidence: "verified",
    industry: seed.industry,
    employeeBand: seed.employeeBand,
    headquarters: seed.headquarters,
    summary: seed.summary,
    productsAndServices: seed.products,
    operatingSignals: seed.operations,
    dataAiSignals: seed.dataAi,
    regulatorySignals: seed.regulatory,
    unknowns: ["Current AI governance maturity", "Available implementation budget"],
    sources: [
      {
        id: `SRC-${seed.id}-ABOUT`,
        title: `${seed.name} - About`,
        url: `https://${seed.domain}/about`,
        excerpt: seed.summary,
        retrievedAt: "2026-08-25T12:00:00.000Z",
        trustTier: "official",
      },
      {
        id: `SRC-${seed.id}-OPS`,
        title: `${seed.name} - Operations`,
        url: `https://${seed.domain}/${slug}-operations`,
        excerpt: `${seed.operations.join(". ")}. ${seed.dataAi.join(". ")}.`,
        retrievedAt: "2026-08-25T12:00:00.000Z",
        trustTier: "official",
      },
    ],
  };
}

export const syntheticCompanies: CompanyDossier[] = [
  company({
    id: "CMP-01",
    name: "Forgewell Manufacturing",
    domain: "forgewell.example",
    industry: "manufacturing",
    employeeBand: "1001-5000",
    headquarters: "Cleveland, Ohio",
    summary:
      "Forgewell manufactures precision components across eight plants and maintains a large installed base of industrial equipment.",
    products: ["Precision components", "Industrial maintenance services"],
    operations: ["Runs eight factories", "Manages equipment maintenance and production scheduling"],
    dataAi: ["Uses ERP, MES, and historian data", "Has a centralized analytics team"],
    regulatory: ["Maintains product quality and worker-safety controls"],
  }),
  company({
    id: "CMP-02",
    name: "Meridian Health Network",
    domain: "meridianhealth.example",
    industry: "healthcare",
    employeeBand: "5000+",
    headquarters: "Nashville, Tennessee",
    summary:
      "Meridian operates six hospitals and more than forty outpatient clinics serving patients across three states.",
    products: ["Acute care", "Outpatient clinical services"],
    operations: ["Coordinates clinical scheduling and claims", "Operates a centralized contact center"],
    dataAi: ["Uses an enterprise EHR and claims platform", "Maintains governed clinical data"],
    regulatory: ["Handles protected health information", "Subject to healthcare privacy requirements"],
  }),
  company({
    id: "CMP-03",
    name: "Harborline Bank",
    domain: "harborline.example",
    industry: "financial_services",
    employeeBand: "1001-5000",
    headquarters: "Providence, Rhode Island",
    summary:
      "Harborline is a regional commercial bank offering deposits, lending, treasury, and wealth services to businesses and consumers.",
    products: ["Commercial lending", "Retail banking", "Treasury services"],
    operations: ["Reviews lending and transaction risk", "Runs regulated customer-service workflows"],
    dataAi: ["Uses a cloud data warehouse", "Maintains transaction-monitoring models"],
    regulatory: ["Subject to banking, AML, privacy, and model-risk controls"],
  }),
  company({
    id: "CMP-04",
    name: "Verity Mutual",
    domain: "veritymutual.example",
    industry: "insurance",
    employeeBand: "1001-5000",
    headquarters: "Hartford, Connecticut",
    summary:
      "Verity Mutual provides property and casualty insurance through independent agents in twenty-two states.",
    products: ["Commercial insurance", "Personal insurance", "Claims services"],
    operations: ["Processes claims and underwriting submissions", "Coordinates a distributed adjuster network"],
    dataAi: ["Stores policy, document, image, and claims history", "Uses actuarial models"],
    regulatory: ["Subject to state insurance regulation", "Handles sensitive claimant information"],
  }),
  company({
    id: "CMP-05",
    name: "Gridline Energy",
    domain: "gridline.example",
    industry: "energy_utilities",
    employeeBand: "5000+",
    headquarters: "Phoenix, Arizona",
    summary:
      "Gridline operates electric generation, transmission, and distribution assets serving two million customer accounts.",
    products: ["Electric utility service", "Grid operations"],
    operations: ["Maintains critical field assets", "Balances demand, outages, and workforce schedules"],
    dataAi: ["Streams telemetry from grid equipment", "Operates GIS and asset-management platforms"],
    regulatory: ["Operates critical infrastructure", "Subject to reliability and cybersecurity requirements"],
  }),
  company({
    id: "CMP-06",
    name: "Atlas Freight Cooperative",
    domain: "atlasfreight.example",
    industry: "logistics",
    employeeBand: "1001-5000",
    headquarters: "Memphis, Tennessee",
    summary:
      "Atlas coordinates truckload, warehouse, and last-mile logistics through a network of regional operating partners.",
    products: ["Freight brokerage", "Warehousing", "Last-mile delivery"],
    operations: ["Plans routes and capacity daily", "Manages shipment exceptions and carrier performance"],
    dataAi: ["Uses TMS, WMS, GPS, and customer order data", "Has fragmented partner data feeds"],
    regulatory: ["Handles customer and driver information"],
  }),
  company({
    id: "CMP-07",
    name: "Luma Retail Group",
    domain: "lumaretail.example",
    industry: "retail",
    employeeBand: "5000+",
    headquarters: "Chicago, Illinois",
    summary:
      "Luma sells home and lifestyle products through 180 stores, an ecommerce site, and a growing marketplace business.",
    products: ["Retail stores", "Ecommerce", "Marketplace"],
    operations: ["Plans inventory across stores and fulfillment centers", "Runs customer support and merchandising teams"],
    dataAi: ["Combines POS, web, loyalty, and inventory data", "Uses cloud analytics"],
    regulatory: ["Handles consumer and payment-adjacent data"],
  }),
  company({
    id: "CMP-08",
    name: "Kestrel Cloud",
    domain: "kestrelcloud.example",
    industry: "technology",
    employeeBand: "251-1000",
    headquarters: "Austin, Texas",
    summary:
      "Kestrel Cloud builds infrastructure monitoring software for mid-market engineering and IT operations teams.",
    products: ["Cloud monitoring platform", "Incident-management software"],
    operations: ["Runs product engineering and customer-success teams", "Handles high-volume support tickets"],
    dataAi: ["Has mature APIs and event data", "Experiments with language-model features"],
    regulatory: ["Supports enterprise security commitments"],
  }),
  company({
    id: "CMP-09",
    name: "NovaThera Laboratories",
    domain: "novathera.example",
    industry: "life_sciences",
    employeeBand: "1001-5000",
    headquarters: "Cambridge, Massachusetts",
    summary:
      "NovaThera develops specialty therapeutics and operates research, clinical, regulatory, and commercial teams globally.",
    products: ["Specialty therapeutics", "Clinical research"],
    operations: ["Runs regulated clinical and safety workflows", "Coordinates scientific knowledge across programs"],
    dataAi: ["Maintains research, trial, and regulatory repositories", "Uses statistical computing platforms"],
    regulatory: ["Subject to GxP controls", "Handles patient and safety data"],
  }),
  company({
    id: "CMP-10",
    name: "SignalWave Telecom",
    domain: "signalwave.example",
    industry: "telecom",
    employeeBand: "5000+",
    headquarters: "Denver, Colorado",
    summary:
      "SignalWave provides fiber and wireless connectivity to consumer, business, and municipal customers across the western United States.",
    products: ["Fiber internet", "Wireless connectivity", "Enterprise networking"],
    operations: ["Operates a network operations center", "Dispatches field technicians and contact-center agents"],
    dataAi: ["Collects network telemetry and service tickets", "Uses multiple legacy billing systems"],
    regulatory: ["Operates communications infrastructure", "Handles customer location data"],
  }),
  company({
    id: "CMP-11",
    name: "CivicWorks Department",
    domain: "civicworks.example",
    industry: "government",
    employeeBand: "1001-5000",
    headquarters: "Columbus, Ohio",
    summary:
      "CivicWorks is a fictional municipal department responsible for permits, inspections, roads, facilities, and resident service requests.",
    products: ["Permitting", "Inspections", "Public works services"],
    operations: ["Processes resident requests and field inspections", "Maintains public infrastructure"],
    dataAi: ["Uses document management, GIS, and work-order systems", "Has uneven data quality"],
    regulatory: ["Subject to public records, accessibility, and procurement requirements"],
  }),
  company({
    id: "CMP-12",
    name: "Alder Advisory Partners",
    domain: "alderadvisory.example",
    industry: "professional_services",
    employeeBand: "251-1000",
    headquarters: "New York, New York",
    summary:
      "Alder Advisory provides finance, operations, and transaction consulting to middle-market companies and investors.",
    products: ["Finance consulting", "Operations consulting", "Transaction advisory"],
    operations: ["Delivers document-heavy client engagements", "Staffs projects across specialist teams"],
    dataAi: ["Uses CRM, document repositories, and project-finance systems", "Pilots internal AI tools"],
    regulatory: ["Handles confidential client and transaction information"],
  }),
];
