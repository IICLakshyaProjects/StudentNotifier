import * as React from "react";

type TemplatePreviewProps = {
  studentName: string;
  campus: string;
  dateTime: string;
  location: string;
};

export const TemplatePreview = React.forwardRef<HTMLDivElement, TemplatePreviewProps>(
  function TemplatePreview({ studentName, campus, dateTime, location }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: "100%",
          maxWidth: 960,
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
            Hi {studentName},
          </p>
          <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.7, color: "#334155" }}>
            Counselling session confirmed, please find the session details below:
          </p>

          <div
            style={{
              marginTop: 24,
              borderRadius: 30,
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              padding: 24,
              position: "relative",
              minHeight: 340,
            }}
          >
            <div
              style={{
                minWidth: 0,
                borderRadius: 28,
                background: "#FFFFFF",
                padding: 24,
                paddingRight: "clamp(136px, 42vw, 260px)",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748B" }}>
                Session details
              </div>
              <div style={{ marginTop: 20, display: "grid", gap: 18, fontSize: 15, color: "#334155" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#0F172A" }}>Campus</div>
                  <div>{campus}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "#0F172A" }}>Date & Time</div>
                  <div>{dateTime}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "#0F172A" }}>Location</div>
                  <div style={{ marginTop: 8 }}>
                    <div>{location}</div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                top: 24,
                right: 24,
                bottom: 24,
                width: "clamp(120px, 34vw, 220px)",
                borderRadius: 30,
                background: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 12,
              }}
            >
              <img
                src="/api/images/CMA_USA_MAILER-lal_with_blue_elements_3_-removebg-preview.png"
                alt="Admission card"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  objectPosition: "center",
                  display: "block",
                  maxHeight: "100%",
                }}
              />
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
            <div style={{ fontWeight: 700, color: "#B45309", marginBottom: 8 }}>
              Important
            </div>
            <div>
              Please keep your admission card ready and confirm once received. If you have questions, please contact the campus team.
            </div>
          </div>
        </div>
      </div>
    );
  }
);

TemplatePreview.displayName = "TemplatePreview";
