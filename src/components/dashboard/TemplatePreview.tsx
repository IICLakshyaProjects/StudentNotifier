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
                data-export-flex-container="true"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 20,
                  alignItems: "stretch",
                }}
              >
                <div data-export-left-panel="true" style={{ flex: "1 1 420px", minWidth: 0, position: "relative", overflow: "hidden" }}>
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
                  <img
                    src={SESSION_IMAGE_URL}
                    alt=""
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: "auto",
                      maxWidth: "65%",
                      objectFit: "contain",
                      objectPosition: "right center",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  />
                </div>
                <div style={{ flex: "0 1 420px", minWidth: 320, display: "grid", gap: 16 }}>
                  {campusVisual ? (
                    /* ── Campus WITH image ── */
                    <div
                      style={{
                        borderRadius: 28,
                        overflow: "hidden",
                        border: "1px solid rgba(15, 23, 42, 0.08)",
                        backgroundColor: "#F1F5F9",
                      }}
                    >
                      {/* Image hero — neutral bg adapts to any campus image tone */}
                      <div
                        style={{
                          position: "relative",
                          aspectRatio: "4/3",
                          overflow: "hidden",
                          background: "#F1F5F9",
                        }}
                      >
                        <img
                          src={campusVisual.src}
                          alt={campusVisual.label}
                          style={{
                            display: "block",
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            objectPosition: "center center",
                          }}
                        />
                        {/* overlay label — dark pill readable on any image tone */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 12,
                            left: 14,
                            right: 14,
                            pointerEvents: "none",
                          }}
                        >
                          <div
                            style={{
                              display: "inline-block",
                              background: "rgba(15,23,42,0.62)",
                              backdropFilter: "blur(6px)",
                              WebkitBackdropFilter: "blur(6px)",
                              borderRadius: 10,
                              padding: "7px 12px",
                              color: "#FFFFFF",
                              fontSize: 14,
                              fontWeight: 400,
                              lineHeight: 1.35,
                              wordBreak: "break-word",
                              maxWidth: "100%",
                            }}
                          >
                            Your{" "}
                            <span style={{ fontWeight: 800 }}>{campusVisual.label}</span>{" "}
                            Campus Building
                          </div>
                        </div>
                      </div>

                      {/* Address section */}
                      <div style={{ padding: "14px 18px", background: "#FFFFFF" }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "#64748B",
                            marginBottom: 6,
                          }}
                        >
                          Address
                        </div>
                        <div style={{ fontSize: 14, lineHeight: 1.6, color: "#334155" }}>
                          {address || "Address"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── Campus WITHOUT image — no image area, no placeholder ── */
                    <div
                      style={{
                        borderRadius: 28,
                        overflow: "hidden",
                        border: "1px solid #E2E8F0",
                        background: "#FFFFFF",
                      }}
                    >
                      <div style={{ padding: "18px 18px 16px" }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "#64748B",
                            marginBottom: 8,
                          }}
                        >
                          Campus you will be visiting
                        </div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>
                          {campus}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "#64748B",
                            marginBottom: 6,
                          }}
                        >
                          Address
                        </div>
                        <div style={{ fontSize: 14, lineHeight: 1.6, color: "#334155" }}>
                          {address || "Address"}
                        </div>
                      </div>
                    </div>
                  )}
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
                    color: "#1D4ED8",
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