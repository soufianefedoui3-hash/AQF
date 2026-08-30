import { forwardRef } from "react";
import { LOGO_PATH } from "@/lib/brand";
import { BRAND } from "@/lib/constants";
import { formatCertificateDate, type CertificateData } from "@/lib/certificate";

const TEAL = "#004d5a";
const TEAL_DEEP = "#063540";
const GOLD = "#c4a35a";
const GOLD_SOFT = "#e8d5a3";
const CREAM = "#fbf8f1";
const INK = "#0a3340";
const MUTED = "#5a7178";

export const CERTIFICATE_WIDTH = 1123;
export const CERTIFICATE_HEIGHT = 794;

function Seal() {
  return (
    <svg width="118" height="118" viewBox="0 0 118 118" aria-hidden>
      <circle cx="59" cy="59" r="56" fill="none" stroke={GOLD} strokeWidth="3" />
      <circle cx="59" cy="59" r="50" fill="none" stroke={TEAL} strokeWidth="2" />
      <circle cx="59" cy="59" r="44" fill={TEAL} />
      <circle cx="59" cy="59" r="38" fill="none" stroke={GOLD_SOFT} strokeWidth="1.5" />
      <text
        x="59"
        y="54"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="18"
        fontWeight="700"
      >
        AQF
      </text>
      <text
        x="59"
        y="72"
        textAnchor="middle"
        fill={GOLD_SOFT}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="7"
        letterSpacing="1.4"
      >
        EXCELLENCE
      </text>
    </svg>
  );
}

export const CertificatePreview = forwardRef<HTMLDivElement, { data: CertificateData }>(
  function CertificatePreview({ data }, ref) {
    const start = formatCertificateDate(data.startDate);
    const end = formatCertificateDate(data.endDate);
    const issued = formatCertificateDate(data.issueDate);
    const hours = data.hours.trim() || "—";
    const place = data.issuePlace.trim() || "—";

    return (
      <div
        ref={ref}
        data-certificate-root
        style={{
          width: CERTIFICATE_WIDTH,
          height: CERTIFICATE_HEIGHT,
          boxSizing: "border-box",
          padding: 22,
          background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 55%, #052830 100%)`,
          color: INK,
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        <div
          style={{
            height: "100%",
            boxSizing: "border-box",
            padding: 8,
            border: `1.5px solid ${GOLD}`,
          }}
        >
          <div
            style={{
              position: "relative",
              height: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
              backgroundColor: CREAM,
              border: `3px solid ${TEAL}`,
              padding: "36px 56px 32px",
            }}
          >
            <div
              aria-hidden
              style={{
                pointerEvents: "none",
                position: "absolute",
                inset: 14,
                border: `1px solid ${GOLD_SOFT}`,
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                height: "100%",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_PATH}
                alt="AQF"
                width={168}
                height={72}
                style={{ height: 72, width: "auto", objectFit: "contain" }}
              />
              <p
                style={{
                  margin: "10px 0 0",
                  color: TEAL,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                }}
              >
                {BRAND.fullName}
              </p>

              <h1
                style={{
                  margin: "22px 0 0",
                  color: TEAL,
                  fontSize: 34,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Attestation de Réussite
              </h1>
              <div
                style={{
                  marginTop: 10,
                  height: 2,
                  width: 180,
                  background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                }}
              />

              <p style={{ margin: "22px 0 0", color: MUTED, fontSize: 16, fontStyle: "italic" }}>
                L&apos;Académie de Qualité et de Formation certifie que
              </p>
              <p
                style={{
                  margin: "14px 0 0",
                  color: TEAL,
                  fontSize: 32,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                {data.studentName.trim() || "Prénom NOM"}
              </p>
              <div style={{ marginTop: 8, height: 1, width: 280, backgroundColor: GOLD }} />

              <p style={{ margin: "18px 0 0", color: MUTED, fontSize: 15 }}>
                a suivi avec succès la formation / l&apos;accompagnement intitulé(e)
              </p>
              <p
                style={{
                  margin: "12px 0 0",
                  maxWidth: 760,
                  color: TEAL,
                  fontSize: 20,
                  fontWeight: 700,
                  lineHeight: 1.35,
                }}
              >
                « {data.trainingTitle.trim() || "Intitulé de la formation / accompagnement"} »
              </p>

              <p style={{ margin: "18px 0 0", color: INK, fontSize: 15, lineHeight: 1.7 }}>
                du <strong>{start}</strong> au <strong>{end}</strong>
                <br />
                d&apos;une durée totale de <strong>{hours} heures</strong>
              </p>

              <p style={{ margin: "16px 0 0", color: MUTED, fontSize: 14 }}>
                Fait à <strong style={{ color: INK }}>{place}</strong>, le{" "}
                <strong style={{ color: INK }}>{issued}</strong>
              </p>

              <div
                style={{
                  marginTop: "auto",
                  display: "grid",
                  width: "100%",
                  gridTemplateColumns: "1fr 118px 1fr",
                  alignItems: "end",
                  gap: 24,
                  paddingTop: 18,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      margin: 0,
                      color: MUTED,
                      fontSize: 11,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                    }}
                  >
                    Formateur / Responsable
                  </p>
                  <p
                    style={{
                      margin: "10px 0 12px",
                      minHeight: 22,
                      color: TEAL,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {data.trainerName.trim() || "Nom du formateur"}
                  </p>
                  <div style={{ margin: "0 auto", width: 210, borderTop: `1px solid ${TEAL}` }} />
                  <p style={{ margin: "6px 0 0", color: MUTED, fontSize: 11 }}>Signature</p>
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Seal />
                </div>

                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      margin: 0,
                      color: MUTED,
                      fontSize: 11,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                    }}
                  >
                    Direction AQF
                  </p>
                  <p
                    style={{
                      margin: "10px 0 12px",
                      minHeight: 22,
                      color: TEAL,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {BRAND.name}
                  </p>
                  <div style={{ margin: "0 auto", width: 210, borderTop: `1px solid ${TEAL}` }} />
                  <p style={{ margin: "6px 0 0", color: MUTED, fontSize: 11 }}>Signature et cachet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
