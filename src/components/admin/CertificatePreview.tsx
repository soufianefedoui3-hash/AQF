import { forwardRef, useId } from "react";
import { type CertificateData, formatCertificateDate } from "@/lib/certificate";

const TEAL = "#0c7f88";
const TEAL_DEEP = "#0a5f66";
const TEAL_MID = "#14919b";
const INK = "#1a1f20";
const WHITE = "#ffffff";
const SANS = '"Segoe UI", Arial, Helvetica, sans-serif';

export const CERTIFICATE_WIDTH = 1123;
export const CERTIFICATE_HEIGHT = 794;

const PLUS_FIELD =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E%3Cpath d='M8.15 4.2h1.7v9.6h-1.7zM4.2 8.15h9.6v1.7H4.2z' fill='%230c7f88' fill-opacity='0.22'/%3E%3C/svg%3E\")";

function AqfMark({ size = 92, gid = "aqf-mark" }: { size?: number; gid?: string }) {
  return (
    <svg width={size} height={size * 0.52} viewBox="0 0 200 104" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="18%" y1="92%" x2="88%" y2="8%">
          <stop offset="0%" stopColor="#08707a" />
          <stop offset="55%" stopColor="#14b8c6" />
          <stop offset="100%" stopColor="#7ee0c8" />
        </linearGradient>
      </defs>
      <path
        d="M28 92 L52 18 H66 L90 92 H74 L70 78 H48 L44 92 Z M51.2 66 H66.8 L59 40 Z"
        fill={TEAL_DEEP}
      />
      <path d="M62 40 L86 14 L92 20 L74 40 Z" fill="#7ee0c8" />
      <circle cx="112" cy="54" r="34" fill="none" stroke={`url(#${gid})`} strokeWidth="14" />
      <path d="M146 28 H196 V40 H158 V50 H188 V62 H158 V74 H196 V86 H146 Z" fill={`url(#${gid})`} />
      <path d="M108 62 L154 18 L162 26 L122 64 Z" fill="#7ee0c8" />
    </svg>
  );
}

function DiamondDivider() {
  return (
    <svg width="520" height="18" viewBox="0 0 520 18" aria-hidden>
      <path d="M8 9 H232" stroke={TEAL} strokeWidth="1.8" />
      <path d="M244 9 L260 3.2 L276 9 L260 14.8 Z" fill={TEAL} />
      <path d="M288 9 H512" stroke={TEAL} strokeWidth="1.8" />
    </svg>
  );
}

function NameRules({ children }: { children: string }) {
  const rule = {
    height: 6,
    borderTop: `1.6px solid ${TEAL}`,
    borderBottom: `1.6px solid ${TEAL}`,
  } as const;

  return (
    <div style={{ minWidth: 480, maxWidth: 740 }}>
      <div style={rule} />
      <p
        style={{
          margin: 0,
          padding: "11px 32px",
          color: TEAL_MID,
          fontFamily: SANS,
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: "0.04em",
          lineHeight: 1.15,
        }}
      >
        {children}
      </p>
      <div style={rule} />
    </div>
  );
}

function CornerPlusCluster({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const pluses = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      pluses.push(
        <path
          key={`${row}-${col}`}
          d={`M${4 + col * 11}.3 ${1 + row * 11} h2.4 v6.6 h-2.4z M${1 + col * 11} ${4.3 + row * 11} h8.6 v2.4 H${1 + col * 11}z`}
          fill={TEAL}
          fillOpacity="0.62"
        />
      );
    }
  }

  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 46 46"
      aria-hidden
      style={{
        position: "absolute",
        top: corner.startsWith("t") ? 10 : undefined,
        bottom: corner.startsWith("b") ? 10 : undefined,
        left: corner.endsWith("l") ? 10 : undefined,
        right: corner.endsWith("r") ? 10 : undefined,
      }}
    >
      {pluses}
    </svg>
  );
}

function AcademySeal({ uid }: { uid: string }) {
  const spikes = 34;
  const points: string[] = [];
  for (let i = 0; i < spikes * 2; i += 1) {
    const angle = (Math.PI * i) / spikes - Math.PI / 2;
    const radius = i % 2 === 0 ? 58 : 50;
    points.push(`${60 + radius * Math.cos(angle)},${60 + radius * Math.sin(angle)}`);
  }
  const rimId = `${uid}-seal-rim`;

  return (
    <svg width="116" height="116" viewBox="0 0 120 120" aria-hidden>
      <polygon points={points.join(" ")} fill={TEAL} />
      <circle cx="60" cy="60" r="45" fill={TEAL_DEEP} />
      <defs>
        <path id={rimId} d="M60,60 m-33.5,0 a33.5,33.5 0 1,1 67,0 a33.5,33.5 0 1,1 -67,0" />
      </defs>
      <text
        fill={WHITE}
        fontFamily={SANS}
        fontSize="6.6"
        fontWeight="700"
        letterSpacing="2.2"
      >
        <textPath href={`#${rimId}`} startOffset="0%">
          AQF ACADÉMIE · AQF ACADÉMIE ·
        </textPath>
      </text>
      <g transform="translate(34, 38) scale(0.26)">
        <AqfMark size={200} gid={`${uid}-seal-mark`} />
      </g>
    </svg>
  );
}

function Lockup({ uid }: { uid: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <AqfMark size={118} gid={`${uid}-lockup-mark`} />
      <p
        style={{
          margin: "8px 0 0",
          color: TEAL_DEEP,
          fontFamily: SANS,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "0.22em",
          lineHeight: 1,
        }}
      >
        AQF
      </p>
      <p
        style={{
          margin: "8px 0 0",
          color: INK,
          fontFamily: SANS,
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: "0.14em",
          lineHeight: 1.2,
        }}
      >
        ACADÉMIE DE QUALITÉ
      </p>
      <p
        style={{
          margin: "2px 0 0",
          color: INK,
          fontFamily: SANS,
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: "0.14em",
          lineHeight: 1.2,
        }}
      >
        ET DE FORMATION
      </p>
      <p
        style={{
          margin: "7px 0 0",
          color: INK,
          fontFamily: SANS,
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: "0.42em",
        }}
      >
        ACCOMPAGNEMENT &amp; FORMATION
      </p>
    </div>
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
          backgroundColor: WHITE,
          padding: 18,
          color: INK,
          fontFamily: SANS,
        }}
      >
        <div
          style={{
            position: "relative",
            height: "100%",
            boxSizing: "border-box",
            padding: 5,
            border: `3.2px solid ${TEAL}`,
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
              padding: "16px 36px 14px",
              border: `1.35px solid ${TEAL}`,
              backgroundColor: WHITE,
              backgroundImage: PLUS_FIELD,
              backgroundRepeat: "repeat",
              textAlign: "center",
            }}
          >
            <CornerPlusCluster corner="tl" />
            <CornerPlusCluster corner="tr" />
            <CornerPlusCluster corner="bl" />
            <CornerPlusCluster corner="br" />

            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 18,
                bottom: 28,
                opacity: 0.09,
                pointerEvents: "none",
                transform: "rotate(-8deg)",
              }}
            >
              <AqfMark size={340} gid={`${uid}-watermark-mark`} />
            </div>

            <Lockup uid={uid} />

            <h1
              style={{
                margin: "16px 0 0",
                color: TEAL_DEEP,
                fontFamily: SANS,
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: "0.06em",
              }}
            >
              ATTESTATION DE RÉUSSITE
            </h1>
            <div style={{ marginTop: 8 }}>
              <DiamondDivider />
            </div>

            <p
              style={{
                margin: "16px 0 0",
                color: INK,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.16em",
              }}
            >
              L&apos;ACADÉMIE CERTIFIE QUE
            </p>

            <div style={{ marginTop: 10 }}>
              <NameRules>{student}</NameRules>
            </div>

            <p
              style={{
                margin: "14px 0 0",
                maxWidth: 800,
                color: INK,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.045em",
                lineHeight: 1.45,
              }}
            >
              A SUIVI ET VALIDÉ AVEC SUCCÈS LE PROGRAMME COMPLET DE FORMATION ET
              D&apos;ACCOMPAGNEMENT PROFESSIONNEL EN :
            </p>
            <p
              style={{
                margin: "10px 0 0",
                maxWidth: 800,
                color: INK,
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "0.03em",
                lineHeight: 1.3,
              }}
            >
              {title}
            </p>
            <p
              style={{
                margin: "9px 0 0",
                color: INK,
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: "0.03em",
              }}
            >
              DU {start} AU {end} (DURÉE TOTALE : {hours} HEURES)
            </p>
            <p
              style={{
                margin: "8px 0 0",
                color: INK,
                fontSize: 13.5,
                fontWeight: 800,
                letterSpacing: "0.04em",
              }}
            >
              {trainer}
            </p>
            <p
              style={{
                margin: "10px 0 0",
                maxWidth: 780,
                color: INK,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.04em",
                lineHeight: 1.55,
              }}
            >
              DÉLIVRÉ APRÈS ÉVALUATION DES COMPÉTENCES ET VALIDATION DU PARCOURS PRATIQUE.
            </p>
            <p
              style={{
                margin: "3px 0 0",
                maxWidth: 780,
                color: INK,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.04em",
                lineHeight: 1.55,
              }}
            >
              EN FOI DE QUOI, CETTE ATTESTATION EST ÉTABLIE POUR SERVIR ET VALOIR CE QUE DE DROIT.
            </p>
            <p
              style={{
                margin: "12px 0 0",
                color: INK,
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.06em",
              }}
            >
              FAIT À {place} | {issued}
            </p>

            <div
              style={{
                marginTop: "auto",
                display: "grid",
                width: "100%",
                gridTemplateColumns: "1fr 1fr 120px",
                alignItems: "end",
                paddingTop: 8,
              }}
            >
              <div style={{ textAlign: "left", paddingLeft: 8, alignSelf: "start" }}>
                <p
                  style={{
                    margin: 0,
                    color: INK,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  LE DIRECTEUR ACADÉMIQUE
                </p>
                <div style={{ height: 84 }} />
              </div>
              <div style={{ textAlign: "center", alignSelf: "start" }}>
                <p
                  style={{
                    margin: 0,
                    color: INK,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  LE RESPONSABLE PÉDAGOGIQUE
                </p>
                <div style={{ height: 84 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
                <AcademySeal uid={uid} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
