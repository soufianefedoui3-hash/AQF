import { forwardRef } from "react";
import { LOGO_PATH } from "@/lib/brand";
import { formatCertificateDate, type CertificateData } from "@/lib/certificate";

const TEAL = "#0c7f88";
const TEAL_DEEP = "#0a5f66";
const TEAL_SOFT = "#7ec8c4";
const NAVY = "#123940";
const WHITE = "#ffffff";

export const CERTIFICATE_WIDTH = 1123;
export const CERTIFICATE_HEIGHT = 794;

const PLUS_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath d='M7 3h2v10H7zM3 7h10v2H3z' fill='%230c7f88' fill-opacity='0.42'/%3E%3C/svg%3E\")";

function DiamondDivider() {
  return (
    <svg width="468" height="20" viewBox="0 0 468 20" aria-hidden>
      <path d="M6 10 L32 5 L42 10 L32 15 Z" fill={TEAL} />
      <path d="M42 10 H198" stroke={TEAL} strokeWidth="1.7" />
      <path d="M210 10 L234 3.5 L258 10 L234 16.5 Z" fill={TEAL} />
      <path d="M270 10 H426" stroke={TEAL} strokeWidth="1.7" />
      <path d="M426 10 L436 5 L462 10 L436 15 Z" fill={TEAL} />
    </svg>
  );
}

function NameFrame({ children }: { children: string }) {
  return (
    <div
      style={{
        position: "relative",
        minWidth: 440,
        maxWidth: 740,
        padding: 3,
        border: `1.25px solid ${TEAL_SOFT}`,
      }}
    >
      <div style={{ padding: 3, border: `1.25px solid ${TEAL_SOFT}` }}>
        <div
          style={{
            position: "relative",
            padding: "11px 42px",
            border: `1.6px solid ${TEAL}`,
          }}
        >
          {["tl", "tr", "bl", "br"].map((corner) => {
            const top = corner.startsWith("t");
            const left = corner.endsWith("l");
            return (
              <span
                key={corner}
                aria-hidden
                style={{
                  position: "absolute",
                  width: 18,
                  height: 18,
                  top: top ? -3 : undefined,
                  bottom: top ? undefined : -3,
                  left: left ? -3 : undefined,
                  right: left ? undefined : -3,
                  borderTop: top ? `2.6px solid ${TEAL}` : undefined,
                  borderBottom: top ? undefined : `2.6px solid ${TEAL}`,
                  borderLeft: left ? `2.6px solid ${TEAL}` : undefined,
                  borderRight: left ? undefined : `2.6px solid ${TEAL}`,
                }}
              />
            );
          })}
          <p
            style={{
              margin: 0,
              color: TEAL,
              fontFamily: 'Georgia, "Times New Roman", Times, serif',
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "0.02em",
              lineHeight: 1.15,
            }}
          >
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}

function AcademySeal() {
  const spikes = 32;
  const points: string[] = [];
  for (let i = 0; i < spikes * 2; i += 1) {
    const angle = (Math.PI * i) / spikes - Math.PI / 2;
    const radius = i % 2 === 0 ? 58 : 50;
    points.push(`${60 + radius * Math.cos(angle)},${60 + radius * Math.sin(angle)}`);
  }

  return (
    <svg width="118" height="118" viewBox="0 0 120 120" aria-hidden>
      <polygon points={points.join(" ")} fill={TEAL} />
      <circle cx="60" cy="60" r="46" fill={TEAL_DEEP} />
      <circle cx="60" cy="60" r="43" fill="none" stroke={WHITE} strokeWidth="1" />
      <defs>
        <path id="aqf-seal-rim" d="M60,60 m-34,0 a34,34 0 1,1 68,0 a34,34 0 1,1 -68,0" />
      </defs>
      <text
        fill={WHITE}
        fontFamily='Arial, "Helvetica Neue", sans-serif'
        fontSize="7.2"
        fontWeight="700"
        letterSpacing="2.4"
      >
        <textPath href="#aqf-seal-rim" startOffset="0%">
          AQF ACADÉMIE · AQF ACADÉMIE ·
        </textPath>
      </text>
      <circle cx="60" cy="60" r="24" fill="none" stroke={WHITE} strokeWidth="1.1" />
      <text
        x="60"
        y="64"
        textAnchor="middle"
        fill={WHITE}
        fontFamily='Arial, "Helvetica Neue", sans-serif'
        fontSize="15"
        fontWeight="700"
        letterSpacing="1.4"
      >
        AQF
      </text>
    </svg>
  );
}

function PlusBand({ orientation }: { orientation: "row" | "col" }) {
  return (
    <div
      aria-hidden
      style={{
        width: orientation === "col" ? 32 : "100%",
        height: orientation === "row" ? 32 : "auto",
        alignSelf: "stretch",
        backgroundImage: PLUS_TILE,
        backgroundRepeat: "repeat",
        backgroundPosition: "center",
      }}
    />
  );
}

export const CertificatePreview = forwardRef<HTMLDivElement, { data: CertificateData }>(
  function CertificatePreview({ data }, ref) {
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
          backgroundColor: TEAL,
          padding: 15,
          color: NAVY,
          fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxSizing: "border-box",
            backgroundColor: WHITE,
            overflow: "hidden",
          }}
        >
          <PlusBand orientation="row" />
          <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
            <PlusBand orientation="col" />
            <div
              style={{
                position: "relative",
                display: "flex",
                flex: 1,
                minWidth: 0,
                boxSizing: "border-box",
                margin: "8px 0",
                padding: 4,
                border: `1.5px solid ${TEAL}`,
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  flex: 1,
                  minWidth: 0,
                  boxSizing: "border-box",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "14px 26px 12px",
                  border: `1.5px solid ${TEAL}`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_PATH}
                  alt=""
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: -24,
                    bottom: -16,
                    width: 340,
                    height: "auto",
                    opacity: 0.07,
                    pointerEvents: "none",
                  }}
                />

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_PATH}
                  alt="AQF"
                  width={150}
                  height={64}
                  style={{ height: 58, width: "auto", objectFit: "contain" }}
                />
                <p
                  style={{
                    margin: "5px 0 0",
                    color: TEAL_DEEP,
                    fontSize: 21,
                    fontWeight: 800,
                    letterSpacing: "0.2em",
                  }}
                >
                  AQF
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    color: TEAL_DEEP,
                    fontFamily: 'Georgia, "Times New Roman", Times, serif',
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                  }}
                >
                  ACADÉMIE DE QUALITÉ ET DE FORMATION
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    color: TEAL,
                    fontSize: 9.5,
                    fontWeight: 600,
                    letterSpacing: "0.3em",
                  }}
                >
                  ACCOMPAGNEMENT &amp; FORMATION
                </p>

                <h1
                  style={{
                    margin: "14px 0 0",
                    color: TEAL_DEEP,
                    fontFamily: 'Georgia, "Times New Roman", Times, serif',
                    fontSize: 33,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  ATTESTATION DE RÉUSSITE
                </h1>
                <div style={{ marginTop: 7 }}>
                  <DiamondDivider />
                </div>

                <p
                  style={{
                    margin: "14px 0 0",
                    color: NAVY,
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: "0.16em",
                  }}
                >
                  L&apos;ACADÉMIE CERTIFIE QUE
                </p>

                <div style={{ marginTop: 9 }}>
                  <NameFrame>{student}</NameFrame>
                </div>

                <p
                  style={{
                    margin: "12px 0 0",
                    maxWidth: 780,
                    color: NAVY,
                    fontSize: 11.5,
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
                    margin: "9px 0 0",
                    maxWidth: 780,
                    color: TEAL_DEEP,
                    fontSize: 15.5,
                    fontWeight: 800,
                    letterSpacing: "0.03em",
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </p>
                <p
                  style={{
                    margin: "8px 0 0",
                    color: NAVY,
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  DU {start} AU {end} (DURÉE TOTALE : {hours} HEURES)
                </p>
                <p
                  style={{
                    margin: "7px 0 0",
                    color: TEAL_DEEP,
                    fontSize: 13.5,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                  }}
                >
                  {trainer}
                </p>
                <p
                  style={{
                    margin: "9px 0 0",
                    maxWidth: 760,
                    color: NAVY,
                    fontSize: 10.5,
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
                    maxWidth: 760,
                    color: NAVY,
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    lineHeight: 1.55,
                  }}
                >
                  EN FOI DE QUOI, CETTE ATTESTATION EST ÉTABLIE POUR SERVIR ET VALOIR CE QUE DE
                  DROIT.
                </p>
                <p
                  style={{
                    margin: "10px 0 0",
                    color: TEAL_DEEP,
                    fontSize: 12.5,
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
                    gridTemplateColumns: "1fr 1fr 126px",
                    alignItems: "end",
                    paddingTop: 10,
                  }}
                >
                  <div style={{ textAlign: "left", paddingLeft: 8, alignSelf: "start" }}>
                    <p
                      style={{
                        margin: 0,
                        color: TEAL_DEEP,
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: "0.08em",
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
                        color: TEAL_DEEP,
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                      }}
                    >
                      LE RESPONSABLE PÉDAGOGIQUE
                    </p>
                    <div style={{ height: 86 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
                    <AcademySeal />
                  </div>
                </div>
              </div>
            </div>
            <PlusBand orientation="col" />
          </div>
          <PlusBand orientation="row" />
        </div>
      </div>
    );
  }
);
