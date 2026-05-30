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
    assetPath: "/campuses/Calicut - campus copy.webp",
    accent: "#0f766e",
    aliases: ["calicut", "kozhikode"],
  },
  {
    label: "Kannur",
    assetPath: "/campuses/Kannur-Campus.webp",
    accent: "#1d4ed8",
    aliases: ["kannur"],
  },
  {
    label: "Kottayam",
    assetPath: "/campuses/Kottayam Campus.webp",
    accent: "#7c3aed",
    aliases: ["kottayam"],
  },
  {
    label: "Perinthalmanna",
    assetPath: "/campuses/Perinthalmanna-Campus copy.webp",
    accent: "#be123c",
    aliases: ["perinthalmanna", "perithalmanna", "malappuram", "malapuram"],
  },
  {
    label: "Thrissur",
    assetPath: "/campuses/Thrissur - Campus copy.webp",
    accent: "#b45309",
    aliases: ["thrissur"],
  },
  {
    label: "Trivandrum",
    assetPath: "/campuses/Trivandrum Campus copy.webp",
    accent: "#0f172a",
    aliases: ["trivandrum", "thiruvananthapuram"],
  },
  {
    label: "Kochi - Vyttila",
    assetPath: "/campuses/Vytilla Campus copy.webp",
    accent: "#155e75",
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
