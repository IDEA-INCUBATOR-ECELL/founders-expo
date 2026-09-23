export const categories = [
  "AI / ML",
  "FinTech",
  "EdTech",
  "HealthTech",
  "ConstructionTech",
  "Sustainability",
  "Consumer",
  "SaaS",
  "Hardware",
  "Other",
];
export const stages = [
  "Idea",
  "Prototype",
  "MVP",
  "Early Users",
  "Revenue Generating",
  "Scaling",
];
export const roles = [
  "Co-founders",
  "Developers",
  "Designers",
  "Marketing",
  "Operations",
  "Other",
];
export const steps = [
  {
    title: "Founder details",
    caption: "The people behind the possibility.",
    fields: [
      ["founderName", "Founder name", "text", true],
      ["email", "Email address", "email", true],
      ["phone", "Phone number", "tel", true],
      ["department", "Department", "text", true],
      [
        "year",
        "Year",
        "select",
        true,
        [
          "1st year",
          "2nd year",
          "3rd year",
          "4th year",
          "Postgraduate",
          "Alumni",
        ],
      ],
      ["founderCount", "Number of founders", "number", true],
    ],
  },
  {
    title: "Your startup",
    caption: "Let’s give your idea a name.",
    fields: [
      ["name", "Startup name", "text", true],
      ["tagline", "One-line description", "text", true],
      ["category", "Startup category", "select", true, categories],
      ["stage", "Startup stage", "select", true, stages],
      ["logo", "Startup logo", "file", true],
      ["website", "Website", "url"],
      ["social", "Social profile URL", "url"],
    ],
  },
  {
    title: "Problem & solution",
    caption: "Big possibilities begin with a real problem.",
    fields: [
      ["problem", "Problem statement", "textarea", true],
      ["targetUsers", "Target users", "textarea", true],
      ["alternatives", "Current alternatives", "textarea", true],
      ["solution", "Proposed solution", "textarea", true],
      ["value", "Unique value proposition", "textarea", true],
    ],
  },
  {
    title: "The product",
    caption: "Show us what you’re building.",
    fields: [
      ["productDescription", "Product description", "textarea", true],
      [
        "productStatus",
        "Current product status",
        "select",
        true,
        ["Concept only", "In development", "Working prototype", "Live product"],
      ],
      ["demo", "Demo / product link", "url"],
      ["prototype", "Prototype link", "url"],
      ["images", "Product images", "files"],
      ["video", "Video / demo link", "url"],
    ],
  },
  {
    title: "The business",
    caption: "From a promising idea to a lasting venture.",
    fields: [
      ["businessModel", "Business model", "textarea", true],
      ["revenueModel", "Revenue model", "textarea", true],
      ["customers", "Current users / customers", "text", true],
      ["revenue", "Revenue (if applicable)", "text"],
      ["market", "Market / target segment", "textarea", true],
    ],
  },
  {
    title: "Meet the team",
    caption: "Great things are built together.",
    fields: [],
  },
  {
    title: "Your expo stall",
    caption: "We’ll help set the stage for your startup.",
    fields: [
      ["display", "What will you display at your stall?", "textarea", true],
      [
        "demonstration",
        "Product / prototype demonstration required?",
        "boolean",
      ],
      ["electricity", "Electricity required?", "boolean"],
      ["table", "Table required?", "boolean"],
      ["monitor", "Display / monitor required?", "boolean"],
      ["internet", "Internet required?", "boolean"],
      ["otherRequirements", "Other requirements", "textarea"],
    ],
  },
  {
    title: "Grow your team",
    caption: "Your next collaborator could be here.",
    fields: [
      ["hiring", "Are you looking for team members?", "boolean"],
      ["requiredRoles", "Required roles", "checks", false, roles],
      ["requiredSkills", "Required skills", "text"],
      ["openings", "Number of people required", "number"],
      ["opportunity", "Describe the opportunity", "textarea"],
    ],
  },
  {
    title: "Review & submit",
    caption: "One last look before your next big beginning.",
    fields: [],
  },
];
export const safeUrl = (value) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};
export function validateApplication(data) {
  const errors = {};
  if (!data || typeof data !== "object" || Array.isArray(data))
    return { application: "Submit a valid application." };
  for (const step of steps)
    for (const [key, label, type, required, options] of step.fields) {
      const v = data[key];
      if (
        v !== undefined &&
        v !== null &&
        ["text", "email", "tel", "url", "textarea", "select"].includes(type) &&
        typeof v !== "string"
      ) {
        errors[key] = `${label} must be text.`;
        continue;
      }
      if (type === "boolean" && v !== undefined && typeof v !== "boolean") {
        errors[key] = "Choose yes or no.";
        continue;
      }
      if (
        required &&
        (v === undefined || v === null || (typeof v === "string" && !v.trim()))
      )
        errors[key] = `${label} is required.`;
      if (v && type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        errors[key] = "Enter a valid email address.";
      if (v && type === "url" && !safeUrl(v))
        errors[key] = "Enter a complete http:// or https:// URL.";
      if (v && type === "tel" && !/^\+?[\d\s()-]{8,20}$/.test(v))
        errors[key] = "Enter a valid phone number.";
      if (v && type === "select" && !options.includes(v))
        errors[key] = "Choose a listed option.";
      if (
        v &&
        type === "number" &&
        (!Number.isInteger(Number(v)) || Number(v) < 1 || Number(v) > 100)
      )
        errors[key] = "Enter a whole number between 1 and 100.";
      if (typeof v === "string" && v.length > 6000)
        errors[key] = "Keep this answer under 6,000 characters.";
    }
  if (
    !Array.isArray(data.members) ||
    !data.members.length ||
    data.members.length > 100 ||
    data.members.some(
      (m) =>
        !m ||
        ["name", "role", "skills"].some(
          (k) => typeof m[k] !== "string" || !m[k].trim() || m[k].length > 6000,
        ) ||
        (m.profile && !safeUrl(m.profile)),
    )
  )
    errors.members =
      "Add at least one team member with a name, role and skills, and a valid profile URL if provided.";
  if (
    data.images !== undefined &&
    (!Array.isArray(data.images) || data.images.length > 3)
  )
    errors.images = "Upload no more than three product images.";
  if (data.hiring)
    for (const key of [
      "requiredRoles",
      "requiredSkills",
      "openings",
      "opportunity",
    ])
      if (!data[key] || (Array.isArray(data[key]) && !data[key].length))
        errors[key] = "Complete this field when looking for team members.";
  if (
    data.requiredRoles &&
    (!Array.isArray(data.requiredRoles) ||
      data.requiredRoles.some((r) => !roles.includes(r)))
  )
    errors.requiredRoles = "Choose valid team roles.";
  return errors;
}
