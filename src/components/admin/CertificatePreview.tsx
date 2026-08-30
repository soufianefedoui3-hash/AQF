import { forwardRef, useId } from "react";
import { LOGO_PATH } from "@/lib/brand";
import { type CertificateData, formatCertificateDate } from "@/lib/certificate";

const TEAL = "#0c7f88";
const TEAL_DEEP = "#0a5f66";
const INK = "#1a1a1a";
const WHITE = "#ffffff";
const SANS = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
const SERIF = 'Georgia, "Times New Roman", Times, serif';

export const CERTIFICATE_WIDTH = 1123;
export const CERTIFICATE_HEIGHT = 794;

const PLUS_GUTTER =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath d='M6.1 2.4h1.8v9.2H6.1zM2.4 6.1h9.2v1.8H2.4z' fill='%230c7f88' fill-opacity='0.38'/%3E%3C/svg%3E\")";

function AqfMark({ size = 96, gid = "aqf-mark" }: { size?: number; gid?: string }) {
  return (
    <svg width={size} height={size * 0.58} viewBox="0 0 220 128" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="10%" y1="90%" x2="90%" y2="10%">
          <stop offset="0%" stopColor="#0a5f66" />
          <stop offset="100%" stopColor="#1ec8c4" />
        </linearGradient>
      </defs>
      <path d="M18 118 L58 14 H76 L116 118 H96 L88 94 H46 L38 118 Z M50 78 H84 L67 32 Z" fill="#2a3336" />
      <circle cx="128" cy="64" r="38" fill="none" stroke={`url(#${gid})`} strokeWidth="13" />
      <path d="M122 78 L154 18 L168 26 L138 82 Z" fill={TEAL} />
      <path d="M168 28 H214 V42 H184 V56 H208 V68 H184 V82 H214 V96 H168 Z" fill="#2a3336" />
      <path d="M176 22 L196 4 L204 12 L186 28 Z" fill="#7ee0c8" />
    </svg>
  );
}

function DiamondDivider() {
  return (
    <svg width="440" height="20" viewBox="0 0 440 20" aria-hidden>
      <path d="M6 10 L34 5 L44 10 L34 15 Z" fill={TEAL} />
      <path d="M44 10 H198" stroke={TEAL} strokeWidth="1.7" />
      <path d="M210 10 L220 4.2 L230 10 L220 15.8 Z" fill={TEAL} />
      <path d="M242 10 H396" stroke={TEAL} strokeWidth="1.7" />
      <path d="M396 10 L406 5 L434 10 L406 15 Z" fill={TEAL} />
    </svg>
  );
}

function NameBox({ children, framed }: { children: string; framed: boolean }) {
  return (
    <div
      style={{
        minWidth: 460,
        maxWidth: 720,
        padding: framed ? 4 : 0,
        border: framed ? `2.4px solid ${TEAL}` : "none",
        background: framed ? WHITE : "transparent",
      }}
    >
      <div
        style={{
          padding: "12px 42px",
          border: framed ? `1.2px solid ${TEAL}` : "none",
        }}
      >
        <p
          style={{
            margin: 0,
            color: TEAL,
            fontFamily: SERIF,
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: "0.02em",
            lineHeight: 1.15,
          }}
        >
          {children}
        </p>
      </div>
    </div>
  );
}

function CornerPlusCluster({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const cells = [];
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      cells.push(
        <path
          key={`${row}-${col}`}
          d={`M${3.2 + col * 9}.4 ${1 + row * 9} h1.8 v6.2 h-1.8z M${1 + col * 9} ${3.4 + row * 9} h6.6 v1.8 H${1 + col * 9}z`}
          fill={TEAL}
          fillOpacity="0.7"
        />
      );
    }
  }

  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 48 48"
      aria-hidden
      style={{
        position: "absolute",
        top: corner.startsWith("t") ? 6 : undefined,
        bottom: corner.startsWith("b") ? 6 : undefined,
        left: corner.endsWith("l") ? 6 : undefined,
        right: corner.endsWith("r") ? 6 : undefined,
      }}
    >
      {cells}
    </svg>
  );
}

function AcademySeal({ uid }: { uid: string }) {
  const spikes = 36;
  const points: string[] = [];
  for (let i = 0; i < spikes * 2; i += 1) {
    const angle = (Math.PI * i) / spikes - Math.PI / 2;
    const radius = i % 2 === 0 ? 58 : 49;
    points.push(`${60 + radius * Math.cos(angle)},${60 + radius * Math.sin(angle)}`);
  }
  const rimId = `${uid}-seal-rim`;

  return (
    <svg width="118" height="118" viewBox="0 0 120 120" aria-hidden>
      <polygon points={points.join(" ")} fill={TEAL} />
      <circle cx="60" cy="60" r="44" fill={TEAL_DEEP} />
      <circle cx="60" cy="60" r="40" fill="none" stroke={WHITE} strokeWidth="1.1" />
      <defs>
        <path id={rimId} d="M60,60 m-32,0 a32,32 0 1,1 64,0 a32,32 0 1,1 -64,0" />
      </defs>
      <text fill={WHITE} fontFamily={SANS} fontSize="6.4" fontWeight="700" letterSpacing="2.1">
        <textPath href={`#${rimId}`} startOffset="0%">
          AQF ACADÉMIE · AQF ACADÉMIE ·
        </textPath>
      </text>
      <circle cx="60" cy="60" r="18" fill="none" stroke={WHITE} strokeWidth="1" />
      <text
        x="60"
        y="64"
        textAnchor="middle"
        fill={WHITE}
        fontFamily={SANS}
        fontSize="13"
        fontWeight="700"
        letterSpacing="1.2"
      >
        AQF
      </text>
    </svg>
  );
}

export const CertificatePreview = forwardRef<HTMLDivElement, { data: CertificateData }>(
  function CertificatePreview({ data }, ref) {
    const uid = useId().replace(/:/g, "");
    const customBg = data.backgroundImage.trim();
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

    const body = (
      <>
        {!customBg && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_PATH}
              alt=""
              aria-hidden
              style={{
                position: "absolute",
                left: -10,
                bottom: -8,
                width: 380,
                height: "auto",
                opacity: 0.06,
                mixBlendMode: "multiply",
                pointerEvents: "none",
              }}
            />
            <AqfMark size={108} gid={`${uid}-lockup`} />
          </>
        )}
        {customBg && <div style={{ height: 108 }} />}
        <p
          style={{
            margin: customBg ? 0 : "7px 0 0",
            color: INK,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "0.2em",
            visibility: customBg ? "hidden" : "visible",
          }}
        >
          AQF
        </p>
        <p
          style={{
            margin: "5px 0 0",
            color: INK,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.16em",
            visibility: customBg ? "hidden" : "visible",
          }}
        >
          ACADÉMIE DE QUALITÉ ET DE FORMATION
        </p>
        <p
          style={{
            margin: "4px 0 0",
            color: INK,
            fontSize: 9.5,
            fontWeight: 500,
            letterSpacing: "0.32em",
            visibility: customBg ? "hidden" : "visible",
          }}
        >
          ACCOMPAGNEMENT &amp; FORMATION
        </p>

        <h1
          style={{
            margin: "16px 0 0",
            color: INK,
            fontFamily: SERIF,
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: "0.06em",
            visibility: customBg ? "hidden" : "visible",
          }}
        >
          ATTESTATION DE RÉUSSITE
        </h1>
        <div style={{ marginTop: 8, visibility: customBg ? "hidden" : "visible" }}>
          <DiamondDivider />
        </div>

        <p
          style={{
            margin: "16px 0 0",
            color: INK,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.16em",
            visibility: customBg ? "hidden" : "visible",
          }}
        >
          L&apos;ACADÉMIE CERTIFIE QUE
        </p>

        <div style={{ marginTop: 11 }}>
          <NameBox framed={!customBg}>{student}</NameBox>
        </div>

        <p
          style={{
            margin: "14px 0 0",
            maxWidth: 820,
            color: INK,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.04em",
            lineHeight: 1.45,
            visibility: customBg ? "hidden" : "visible",
          }}
        >
          A SUIVI ET VALIDÉ AVEC SUCCÈS LE PROGRAMME COMPLET DE FORMATION ET
          D&apos;ACCOMPAGNEMENT PROFESSIONNEL EN :
        </p>
        <p
          style={{
            margin: "10px 0 0",
            maxWidth: 820,
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
            maxWidth: 800,
            color: INK,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.035em",
            lineHeight: 1.55,
            visibility: customBg ? "hidden" : "visible",
          }}
        >
          DÉLIVRÉ APRÈS ÉVALUATION DES COMPÉTENCES ET VALIDATION DU PARCOURS PRATIQUE.
        </p>
        <p
          style={{
            margin: "3px 0 0",
            maxWidth: 800,
            color: INK,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.035em",
            lineHeight: 1.55,
            visibility: customBg ? "hidden" : "visible",
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
            gridTemplateColumns: "1fr 1fr 122px",
            alignItems: "end",
            paddingTop: 10,
          }}
        >
          <div style={{ textAlign: "left", paddingLeft: 10, alignSelf: "start" }}>
            <p
              style={{
                margin: 0,
                color: INK,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.08em",
                visibility: customBg ? "hidden" : "visible",
              }}
            >
              LE DIRECTEUR ACADÉMIQUE
            </p>
            <div style={{ height: 88 }} />
          </div>
          <div style={{ textAlign: "center", alignSelf: "start" }}>
            <p
              style={{
                margin: 0,
                color: INK,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.08em",
                visibility: customBg ? "hidden" : "visible",
              }}
            >
              LE RESPONSABLE PÉDAGOGIQUE
            </p>
            <div style={{ height: 88 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
            {!customBg && <AcademySeal uid={uid} />}
          </div>
        </div>
      </>
    );

    if (customBg) {
      return (
        <div
          ref={ref}
          data-certificate-root
          style={{
            position: "relative",
            width: CERTIFICATE_WIDTH,
            height: CERTIFICATE_HEIGHT,
            boxSizing: "border-box",
            overflow: "hidden",
            color: INK,
            fontFamily: SANS,
            backgroundColor: WHITE,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={customBg}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "100%",
              boxSizing: "border-box",
              padding: "62px 84px 44px",
              textAlign: "center",
            }}
          >
            {body}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        data-certificate-root
        style={{
          width: CERTIFICATE_WIDTH,
          height: CERTIFICATE_HEIGHT,
          boxSizing: "border-box",
          backgroundColor: TEAL,
          padding: 14,
          color: INK,
          fontFamily: SANS,
        }}
      >
        <div
          style={{
            position: "relative",
            height: "100%",
            boxSizing: "border-box",
            padding: 30,
            backgroundColor: WHITE,
            backgroundImage: PLUS_GUTTER,
            backgroundRepeat: "repeat",
          }}
        >
          <CornerPlusCluster corner="tl" />
          <CornerPlusCluster corner="tr" />
          <CornerPlusCluster corner="bl" />
          <CornerPlusCluster corner="br" />

          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
              padding: "18px 40px 14px",
              border: `1.6px solid ${TEAL}`,
              backgroundColor: WHITE,
              textAlign: "center",
            }}
          >
            {body}
          </div>
        </div>
      </div>
    );
  }
);
