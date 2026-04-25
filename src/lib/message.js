import { renderNumberedTemplate } from "@/lib/template";

export const DEFAULT_TEMPLATE = `Hi {{1}}, your counselling session is confirmed.

Campus: {{2}}
Date: {{3}}
Time: {{4}}

Location: {{5}}

Please keep your admission card ready and confirm once received.`;

export function buildCounsellingMessage({
  studentName,
  campus,
  date,
  time,
  location,
  template = DEFAULT_TEMPLATE,
} = {}) {
  return renderNumberedTemplate(template, [
    studentName,
    campus,
    date,
    time,
    location,
  ]).trim();
}

