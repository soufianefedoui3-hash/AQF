import { forwardRef, useId } from "react";
import { type CertificateData, formatCertificateDate } from "@/lib/certificate";

const NAVY = "#004d5a";
const EMERALD = "#0a6b73";
const TEAL = "#0c7f88";
const GOLD = "#b8975a";
const IVORY = "#f8f6f1";
const INK = "#1c2a2e";
const MUTED = "#4a5c61";
const WHITE = "#ffffff";
const SANS = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
const SERIF = 'Georgia, "Palatino Linotype", "Times New Roman", Times, serif';

export const CERTIFICATE_WIDTH = 1123;
export const CERTIFICATE_HEIGHT = 794;

function AqfMark({ size = 88, gid = "aqf-mark" }: { size?: number; gid?: string }) {
  return (
    <svg width={size} height={size * 0.56} viewBox="0 0 220 124" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="8%" y1="92%" x2="92%" y2="8%">
          <stop offset="0%" stopColor={NAVY} />
          <stop offset="55%" stopColor={TEAL} />
          <stop offset="100%" stopColor="#7ee0c8" />
        </linearGradient>
      </defs>
      <path d="M16 114 L56 12 H74 L114 114 H94 L86 90 H44 L36 114 Z M48 74 H82 L65 28 Z" fill={NAVY} />
      <circle cx="128" cy="62" r="36" fill="none" stroke={`url(#${gid})`} strokeWidth="12" />
      <path d="M122 74 L152 16 L166 24 L136 78 Z" fill={TEAL} />
      <path d="M166 26 H212 V40 H182 V54 H206 V66 H182 V80 H212 V94 H166 Z" fill={NAVY} />
      <path d="M174 20 L194 4 L202 12 L184 26 Z" fill="#7ee0c8" />
    </svg>
  );
}

function ElegantDivider() {
  return (
    <svg width="520" height="22" viewBox="0 0 520 22" aria-hidden>
      <path d="M12 11 H214" stroke={GOLD} strokeWidth="1.15" />
      <path d="M306 11 H508" stroke={GOLD} strokeWidth="1.15" />
      <path d="M214 11 L228 11" stroke={TEAL} strokeWidth="1.4" />
      <path d="M292 11 L306 11" stroke={TEAL} strokeWidth="1.4" />
      <path d="M246 11 L260 4.5 L274 11 L260 17.5 Z" fill={TEAL} />
      <circle cx="260" cy="11" r="2.2" fill={IVORY} />
    </svg>
  );
}

function CornerFillet({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const top = corner.startsWith("t");
  const left = corner.endsWith("l");
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        width: 22,
        height: 22,
        top: top ? -1 : undefined,
        bottom: top ? undefined : -1,
        left: left ? -1 : undefined,
        right: left ? undefined : -1,
        borderTop: top ? `2px solid ${GOLD}` : undefined,
        borderBottom: top ? undefined : `2px solid ${GOLD}`,
        borderLeft: left ? `2px solid ${GOLD}` : undefined,
        borderRight: left ? undefined : `2px solid ${GOLD}`,
      }}
    />
  );
}

function NameFrame({ children }: { children: string }) {
  return (
    <div
      style={{
        position: "relative",
        minWidth: 480,
        maxWidth: 740,
        padding: 5,
        border: `1px solid ${GOLD}`,
        background:
          "linear-gradient(180deg, rgba(184,151,90,0.07) 0%, rgba(255,255,255,0.4) 40%, rgba(12,127,136,0.05) 100%)",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "14px 48px",
          border: `1.6px solid ${TEAL}`,
          backgroundColor: WHITE,
        }}
      >
        {(["tl", "tr", "bl", "br"] as const).map((corner) => (
          <CornerFillet key={corner} corner={corner} />
        ))}
        <p
          style={{
            margin: 0,
            color: EMERALD,
            fontFamily: SERIF,
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: "0.03em",
            lineHeight: 1.12,
          }}
        >
          {children}
        </p>
      </div>
    </div>
  );
}

function AcademySeal({ uid }: { uid: string }) {
  const spikes = 40;
  const points: string[] = [];
  for (let i = 0; i < spikes * 2; i += 1) {
    const angle = (Math.PI * i) / spikes - Math.PI / 2;
    const radius = i % 2 === 0 ? 58 : 50;
    points.push(`${60 + radius * Math.cos(angle)},${60 + radius * Math.sin(angle)}`);
  }
  const rimId = `${uid}-seal-rim`;

  return (
    <svg width="112" height="112" viewBox="0 0 120 120" aria-hidden>
      <polygon points={points.join(" ")} fill={TEAL} />
      <circle cx="60" cy="60" r="46" fill={NAVY} />
      <circle cx="60" cy="60" r="42" fill="none" stroke={GOLD} strokeWidth="1.2" />
      <defs>
        <path id={rimId} d="M60,60 m-33,0 a33,33 0 1,1 66,0 a33,33 0 1,1 -66,0" />
      </defs>
      <text fill={WHITE} fontFamily={SANS} fontSize="6.2" fontWeight="700" letterSpacing="2.3">
        <textPath href={`#${rimId}`} startOffset="0%">
          AQF ACADÉMIE · AQF ACADÉMIE ·
        </textPath>
      </text>
      <circle cx="60" cy="60" r="20" fill="none" stroke={WHITE} strokeWidth="1" />
      <text
        x="60"
        y="64"
        textAnchor="middle"
        fill={WHITE}
        fontFamily={SANS}
        fontSize="14"
        fontWeight="700"
        letterSpacing="1.4"
      >
        AQF
      </text>
    </svg>
  );
}

export const CertificatePreview = forwardRef<HTMLDivElement, { data: CertificateData }>(
  function CertificatePreview({ data }, ref) {
    const uid = useId().replace(/:/g, "");
    const student = data.studentName.trim() || "[Prénom NOM]";
    const title =
      data.trainingTitle.trim().toUpperCase() || "[INTITULÉ DE LA FORMATION/ACCOMPAGNEMENT]";
    const start = data.startDate.trim()
      ? formatCertificateDate(data.startDate)
      : "[DATE DE DÉBUT]";
    const end = data.endDate.trim() ? formatCertificateDate(data.endDate) : "[DATE DE FIN]";
    const hours = data.hours.trim() || "[NOMBRE]";
    const trainer =
      data.trainerName.trim().toUpperCase() || "[NOM DU FORMATEUR/RESPONSABLE]";
    const place = data.issuePlace.trim().toUpperCase() || "[LIEU DE DÉLIVRANCE]";
    const issued = data.issueDate.trim()
      ? formatCertificateDate(data.issueDate)
      : "[DATE DE DÉLIVRANCE]";

    return (
      <div
        ref={ref}
        data-certificate-root
        style={{
          width: CERTIFICATE_WIDTH,
          height: CERTIFICATE_HEIGHT,
          boxSizing: "border-box",
          backgroundColor: NAVY,
          padding: 12,
          color: INK,
          fontFamily: SANS,
        }}
      >
        <div
          style={{
            height: "100%",
            boxSizing: "border-box",
            padding: 5,
            backgroundColor: GOLD,
          }}
        >
          <div
            style={{
              position: "relative",
              height: "100%",
              boxSizing: "border-box",
              padding: 11,
              backgroundColor: NAVY,
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                height: "100%",
                flexDirection: "column",
                alignItems: "center",
                boxSizing: "border-box",
                overflow: "hidden",
                padding: "22px 48px 16px",
                background:
                  "radial-gradient(ellipse at 50% 0%, #ffffff 0%, #f8f6f1 62%, #f3f0e8 100%)",
                border: `1px solid ${TEAL}`,
                textAlign: "center",
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 10,
                  border: `1px solid rgba(184,151,90,0.45)`,
                  pointerEvents: "none",
                }}
              />

              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "40%",
                  transform: "translate(-50%, -50%)",
                  opacity: 0.045,
                  pointerEvents: "none",
                }}
              >
                <AqfMark size={420} gid={`${uid}-watermark`} />
              </div>

              <AqfMark size={86} gid={`${uid}-lockup`} />
              <p
                style={{
                  margin: "8px 0 0",
                  color: NAVY,
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: "0.28em",
                }}
              >
                AQF
              </p>
              <p
                style={{
                  margin: "5px 0 0",
                  color: NAVY,
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                }}
              >
                ACADÉMIE DE QUALITÉ ET DE FORMATION
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  color: MUTED,
                  fontSize: 9,
                  fontWeight: 500,
                  letterSpacing: "0.38em",
                }}
              >
                ACCOMPAGNEMENT &amp; FORMATION
              </p>

              <h1
                style={{
                  margin: "18px 0 0",
                  color: NAVY,
                  fontFamily: SERIF,
                  fontSize: 36,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                ATTESTATION DE RÉUSSITE
              </h1>
              <div style={{ marginTop: 8 }}>
                <ElegantDivider />
              </div>

              <p
                style={{
                  margin: "16px 0 0",
                  color: MUTED,
                  fontSize: 11.5,
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                }}
              >
                L&apos;ACADÉMIE CERTIFIE QUE
              </p>

              <div style={{ marginTop: 12 }}>
                <NameFrame>{student}</NameFrame>
              </div>

              <p
                style={{
                  margin: "16px 0 0",
                  maxWidth: 780,
                  color: INK,
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.055em",
                  lineHeight: 1.5,
                }}
              >
                A SUIVI ET VALIDÉ AVEC SUCCÈS LE PROGRAMME COMPLET DE FORMATION ET
                D&apos;ACCOMPAGNEMENT PROFESSIONNEL EN :
              </p>
              <p
                style={{
                  margin: "11px 0 0",
                  maxWidth: 780,
                  color: NAVY,
                  fontFamily: SERIF,
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  lineHeight: 1.3,
                }}
              >
                {title}
              </p>
              <p
                style={{
                  margin: "10px 0 0",
                  color: INK,
                  fontSize: 12.5,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                DU {start} AU {end} (DURÉE TOTALE : {hours} HEURES)
              </p>
              <p
                style={{
                  margin: "8px 0 0",
                  color: NAVY,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                }}
              >
                {trainer}
              </p>
              <p
                style={{
                  margin: "12px 0 0",
                  maxWidth: 760,
                  color: MUTED,
                  fontSize: 10.5,
                  fontWeight: 500,
                  letterSpacing: "0.045em",
                  lineHeight: 1.6,
                }}
              >
                DÉLIVRÉ APRÈS ÉVALUATION DES COMPÉTENCES ET VALIDATION DU PARCOURS PRATIQUE.
              </p>
              <p
                style={{
                  margin: "3px 0 0",
                  maxWidth: 760,
                  color: MUTED,
                  fontSize: 10.5,
                  fontWeight: 500,
                  letterSpacing: "0.045em",
                  lineHeight: 1.6,
                }}
              >
                EN FOI DE QUOI, CETTE ATTESTATION EST ÉTABLIE POUR SERVIR ET VALOIR CE QUE DE DROIT.
              </p>
              <p
                style={{
                  margin: "12px 0 0",
                  color: NAVY,
                  fontSize: 12.5,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                }}
              >
                FAIT À {place} | {issued}
              </p>

              <div
                style={{
                  marginTop: "auto",
                  display: "grid",
                  width: "100%",
                  gridTemplateColumns: "1fr 1fr 118px",
                  alignItems: "end",
                  paddingTop: 8,
                }}
              >
                <div style={{ textAlign: "left", paddingLeft: 8, alignSelf: "start" }}>
                  <p
                    style={{
                      margin: 0,
                      color: NAVY,
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                    }}
                  >
                    LE DIRECTEUR ACADÉMIQUE
                  </p>
                  <div style={{ height: 86 }} />
                </div>
                <div style={{ textAlign: "center", alignSelf: "start" }}>
                  <p
                    style={{
                      margin: 0,
                      color: NAVY,
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                    }}
                  >
                    LE RESPONSABLE PÉDAGOGIQUE
                  </p>
                  <div style={{ height: 86 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
                  <AcademySeal uid={uid} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
