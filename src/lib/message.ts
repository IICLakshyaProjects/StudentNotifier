import { renderNumberedTemplate, generateCounsellingSessionTemplate } from "@/lib/template";
import { escapeHtml } from "@/lib/template";

export const DEFAULT_TEMPLATE = `Hi {{1}}, your counselling session is confirmed.

Campus: {{2}}
Date: {{3}}
Time: {{4}}

Location: {{5}}

Please keep your admission card ready and confirm once received.`;

export type CounsellingMessageInput = {
  studentName: string;
  campus: string;
  date: string;
  time: string;
  location: string;
  address?: string;
  baseUrl?: string;
  contactNumber?: string;
  extraFields?: Record<string, unknown>;
  sessionId?: string;
  template?: string;
};

export function buildCounsellingMessage(input: CounsellingMessageInput) {
  const { studentName, campus, date, time, location, template = DEFAULT_TEMPLATE } =
    input;

  return renderNumberedTemplate(template, [
    studentName,
    campus,
    date,
    time,
    location,
  ]).trim();
}

export function buildCounsellingEmailHtml(input: CounsellingMessageInput) {
  return generateCounsellingSessionTemplate({
    baseUrl: input.baseUrl,
    studentName: input.studentName,
    campus: input.campus,
    dateTime: `${input.date} · ${input.time}`,
    address: input.address,
    location: input.location,
    contactNumber: input.contactNumber,
    extraFields: input.extraFields,
    sessionId: input.sessionId,
  });
}

