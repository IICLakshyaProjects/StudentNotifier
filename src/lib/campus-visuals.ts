type CampusVisual = {
  label: string;
  src: string;
  exportSrc: string;
  accent: string;
};

type CampusVisualConfig = {
  label: string;
  assetPath: string;
  accent: string;
  aliases: string[];
};

const CAMPUS_VISUALS: CampusVisualConfig[] = [
  {
    label: "Calicut",
    assetPath: "/Calicut.webp",
    accent: "#0F766E",
    aliases: ["calicut", "kozhikode"],
  },
  {
    label: "Kannur",
    assetPath: "/Kannur.webp",
    accent: "#1D4ED8",
    aliases: ["kannur"],
  },
  {
    label: "Kottayam",
    assetPath: "/Kottayam.webp",
    accent: "#7C3AED",
    aliases: ["kottayam"],
  },
  {
    label: "Perinthalmanna",
    assetPath: "/Perinthalmanna.webp",
    accent: "#BE123C",
    aliases: ["perinthalmanna", "perithalmanna", "malappuram", "malapuram"],
  },
  {
    label: "Thrissur",
    assetPath: "/Thrissur.webp",
    accent: "#B45309",
    aliases: ["thrissur"],
  },
  {
    label: "Trivandrum",
    assetPath: "/Thiruvananthapuram.webp",
    accent: "#0F172A",
    aliases: ["trivandrum", "thiruvananthapuram"],
  },
  {
    label: "Kochi - Vyttila",
    assetPath: "/Vytilla.webp",
    accent: "#155E75",
    aliases: ["kochi", "vyttila", "vytilla", "vytal"],
  },
];

function normalizeCampusName(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function buildCampusAssetSrc(assetPath: string) {
  return encodeURI(assetPath);
}

export function getCampusVisual(campus: string): CampusVisual | null {
  const normalized = normalizeCampusName(campus);
  if (!normalized) return null;

  const visual = CAMPUS_VISUALS.find((item) =>
    item.aliases.some((alias) => normalized.includes(normalizeCampusName(alias)))
  );

  if (!visual) return null;

  return {
    label: visual.label,
    accent: visual.accent,
    src: buildCampusAssetSrc(visual.assetPath),
    exportSrc: buildCampusAssetSrc(visual.assetPath),
  };
}