import * as React from "react";
import { getCampusVisual } from "@/lib/campus-visuals";

type TemplatePreviewProps = {
  studentName: string;
  campus: string;
  dateTime: string;
  address: string;
  location: string;
  sessionId: string;
  contactNumber: string;
  extraFields?: Array<{ label: string; value: string }>;
};

const SESSION_IMAGE_URL =
  "/api/images/CMA_USA_MAILER-lal_with_blue_elements_3_-removebg-preview.png";

export const TemplatePreview = React.forwardRef<HTMLDivElement, TemplatePreviewProps>(
  function TemplatePreview(
    { studentName, campus, dateTime, address, location, sessionId, contactNumber, extraFields = [] },
    ref
  ) {
    const campusVisual = getCampusVisual(campus);

    return (
      <div
        ref={ref}
        style={{
          width: "100%",
          maxWidth: 1120,
          margin: "0 auto",
          minWidth: 0,
          borderRadius: 32,
          border: "1px solid #CBD5E1",
          background: "#FFFFFF",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div
          style={{
            backgroundImage: "url('/api/images/bg-banner1.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            padding: "28px 32px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src="/api/images/WHITE.png"
            alt="Lakshya logo"
            style={{ height: 58, width: "auto", maxWidth: 180, display: "block", objectFit: "contain" }}
          />
        </div>
        <div style={{ padding: 28 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0F172A" }}>
            Admit Card
          </p>

          <div
            style={{
              marginTop: 24,
              borderRadius: 30,
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              padding: 24,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                borderRadius: 28,
                background: "#FFFFFF",
                padding: 24,
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 20,
                  alignItems: "stretch",
                }}
              >
                <div style={{ flex: "1 1 420px", minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#64748B",
                    }}
                  >
                    Session details
                  </div>
                  <div style={{ marginTop: 20, display: "grid", gap: 18, fontSize: 15, color: "#334155" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0F172A" }}>Student name</div>
                      <div>{studentName}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0F172A" }}>Campus</div>
                      <div>{campus}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0F172A" }}>ID</div>
                      <div
                        style={{
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                        }}
                      >
                        {sessionId}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0F172A" }}>Date & Time</div>
                      <div>{dateTime}</div>
                    </div>
                    {extraFields
                      .filter((f) => String(f?.value || "").trim().length > 0)
                      .map((f) => (
                        <div key={f.label}>
                          <div style={{ fontWeight: 700, color: "#0F172A" }}>{f.label}</div>
                          <div>{f.value}</div>
                        </div>
                      ))}
                  </div>
                </div>
                <div style={{ flex: "0 1 420px", minWidth: 320, display: "grid", gap: 16 }}>
                  <div
                    style={{
                      borderRadius: 28,
                      overflow: "hidden",
                      border: "1px solid #E2E8F0",
                      background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
                      padding: 14,
                      minHeight: 190,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        minHeight: 160,
                        borderRadius: 22,
                        backgroundImage: `url("${SESSION_IMAGE_URL}")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        backgroundSize: "contain",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      borderRadius: 28,
                      overflow: "hidden",
                      border: `1px solid ${campusVisual ? "rgba(15, 23, 42, 0.08)" : "#E2E8F0"}`,
                      backgroundColor: campusVisual ? "#E5E7EB" : "#0f172a",
                    }}
                  >
                    <div
                      style={{
                        minHeight: 250,
                        backgroundImage: campusVisual
                          ? `linear-gradient(180deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.45) 100%), url("${campusVisual.src}")`
                          : "linear-gradient(180deg, #0f172a 0%, #334155 100%)",
                        backgroundSize: campusVisual ? "contain, contain" : "cover",
                        backgroundPosition: campusVisual ? "center center, center center" : "center center",
                        backgroundRepeat: campusVisual ? "no-repeat, no-repeat" : "no-repeat",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "flex-end",
                          padding: 16,
                          color: "#FFFFFF",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 800,
                            lineHeight: 1.1,
                            textShadow: "0 2px 14px rgba(15, 23, 42, 0.5)",
                            wordBreak: "break-word",
                            textAlign: "right",
                            maxWidth: "76%",
                          }}
                        >
                          {campusVisual ? campusVisual.label : campus}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: 18, background: "#FFFFFF" }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "#64748B",
                        }}
                      >
                        Campus you will be visiting
                      </div>
                      <div style={{ marginTop: 8, fontSize: 17, fontWeight: 800, color: "#0F172A" }}>
                        {campusVisual ? campusVisual.label : campus}
                      </div>
                      <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: "#334155" }}>
                        {address || "Address"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              borderRadius: 20,
              border: "1px solid #FBBF24",
              background: "#FFFBEB",
              padding: 18,
              color: "#475569",
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            <div style={{ fontWeight: 700, color: "#B45309", marginBottom: 8 }}>Important:</div>
            <div>Please carry this Admit Card during your campus visit, as it will be used for your visit verification, counselling coordination, and priority assistance at the campus.</div>
            <div style={{ marginTop: 10 }}>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>Campus Contact No:</span>{" "}
              <span
                style={{
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                }}
              >
                {contactNumber || "-"}
              </span>
            </div>
            <div style={{ marginTop: 10 }}>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>Campus Location:</span>{" "}
              {location ? (
                <a
                  href={location}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#1d4ed8",
                    textDecoration: "underline",
                    fontWeight: 700,
                  }}
                >
                  Click here
                </a>
              ) : (
                <span>-</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

TemplatePreview.displayName = "TemplatePreview";
