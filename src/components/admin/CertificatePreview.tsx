import { forwardRef, type CSSProperties } from "react";
import { type CertificateData, formatCertificateDate } from "@/lib/certificate";

const INK = "#0b1c20";
const TEAL = "#0a5f66";
const WHITE = "#ffffff";
const SANS = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
const SERIF = 'Georgia, "Times New Roman", Times, serif';
const TEXT_SHADOW = "0 1px 0 #fff, 0 0 10px #fff, 0 0 18px #fff";

export const CERTIFICATE_WIDTH = 1123;
export const CERTIFICATE_HEIGHT = 794;

function overlayText(style: CSSProperties): CSSProperties {
  return {
    margin: 0,
    color: INK,
    fontFamily: SANS,
    textShadow: TEXT_SHADOW,
    ...style,
  };
}

export const CertificatePreview = forwardRef<HTMLDivElement, { data: CertificateData }>(
  function CertificatePreview({ data }, ref) {
    const background = data.backgroundImage.trim();
    const logo = data.logoImage.trim();
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
          position: "relative",
          width: CERTIFICATE_WIDTH,
          height: CERTIFICATE_HEIGHT,
          boxSizing: "border-box",
          overflow: "hidden",
          backgroundColor: WHITE,
          color: INK,
          fontFamily: SANS,
        }}
      >
        {background ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={background}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              pointerEvents: "none",
            }}
          />
        ) : null}

        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "100%",
            boxSizing: "border-box",
            padding: "36px 72px 28px",
            textAlign: "center",
          }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt="Logo"
              style={{
                height: 78,
                width: "auto",
                maxWidth: 280,
                objectFit: "contain",
                marginBottom: 10,
              }}
            />
          ) : (
            <div style={{ height: 18 }} />
          )}

          <p
            style={overlayText({
              marginTop: 4,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.18em",
            })}
          >
            ACADÉMIE DE QUALITÉ ET DE FORMATION
          </p>
          <p
            style={overlayText({
              marginTop: 6,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.28em",
            })}
          >
            ACCOMPAGNEMENT &amp; FORMATION
          </p>

          <h1
            style={overlayText({
              marginTop: 18,
              fontFamily: SERIF,
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: INK,
            })}
          >
            ATTESTATION DE RÉUSSITE
          </h1>

          <p
            style={overlayText({
              marginTop: 18,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.16em",
            })}
          >
            L&apos;ACADÉMIE CERTIFIE QUE
          </p>

          <p
            style={overlayText({
              marginTop: 14,
              color: TEAL,
              fontFamily: SERIF,
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: "0.02em",
              lineHeight: 1.15,
            })}
          >
            {student}
          </p>

          <p
            style={overlayText({
              marginTop: 16,
              maxWidth: 840,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.04em",
              lineHeight: 1.45,
            })}
          >
            A SUIVI ET VALIDÉ AVEC SUCCÈS LE PROGRAMME COMPLET DE FORMATION ET
            D&apos;ACCOMPAGNEMENT PROFESSIONNEL EN :
          </p>
          <p
            style={overlayText({
              marginTop: 12,
              maxWidth: 840,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "0.03em",
              lineHeight: 1.3,
            })}
          >
            {title}
          </p>
          <p
            style={overlayText({
              marginTop: 12,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: "0.03em",
            })}
          >
            DU {start} AU {end} (DURÉE TOTALE : {hours} HEURES)
          </p>
          <p
            style={overlayText({
              marginTop: 10,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: "0.04em",
            })}
          >
            {trainer}
          </p>
          <p
            style={overlayText({
              marginTop: 14,
              maxWidth: 820,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.035em",
              lineHeight: 1.55,
            })}
          >
            DÉLIVRÉ APRÈS ÉVALUATION DES COMPÉTENCES ET VALIDATION DU PARCOURS PRATIQUE.
          </p>
          <p
            style={overlayText({
              marginTop: 4,
              maxWidth: 820,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.035em",
              lineHeight: 1.55,
            })}
          >
            EN FOI DE QUOI, CETTE ATTESTATION EST ÉTABLIE POUR SERVIR ET VALOIR CE QUE DE DROIT.
          </p>
          <p
            style={overlayText({
              marginTop: 14,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: "0.06em",
            })}
          >
            FAIT À {place} | {issued}
          </p>

          <div
            style={{
              marginTop: "auto",
              display: "grid",
              width: "100%",
              gridTemplateColumns: "1fr 1fr",
              paddingTop: 12,
            }}
          >
            <div style={{ textAlign: "left", paddingLeft: 12 }}>
              <p
                style={overlayText({
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                })}
              >
                LE DIRECTEUR ACADÉMIQUE
              </p>
              <div style={{ height: 92 }} />
            </div>
            <div style={{ textAlign: "right", paddingRight: 12 }}>
              <p
                style={overlayText({
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                })}
              >
                LE RESPONSABLE PÉDAGOGIQUE
              </p>
              <div style={{ height: 92 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
