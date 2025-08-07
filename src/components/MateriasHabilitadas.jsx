
import React, { useRef } from "react";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function MateriasHabilitadas({ materias }) {
  const resumenRef = useRef(null);

  const exportarPDF = async () => {
    const input = resumenRef.current;
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);
    pdf.save("materias-habilitadas.pdf");
  };
  // Agrupa las materias habilitadas por nivel
  const niveles = ["1", "2", "3", "4", "5"];
  const materiasPorNivel = niveles.map(nivel =>
    materias.filter(m => m.nivel === nivel)
  );

  return (
    <Container fluid className="mb-4" style={{ overflowX: 'auto', padding: 0 }}>
      <Card className="shadow-sm" style={{ minWidth: '900px', maxWidth: '100%', margin: '0 auto' }}>
        <Card.Header className="text-center fw-bold" style={{ fontSize: '1.2em', background: '#e9ecef' }}>
          Resumen de materias que puedes cursar
          <Button variant="outline-dark" size="sm" className="ms-3" onClick={exportarPDF}>
            Exportar PDF
          </Button>
        </Card.Header>
        <Card.Body ref={resumenRef} style={{ padding: '0.5rem 1rem' }}>
          <Row className="justify-content-center flex-nowrap" style={{ minHeight: '350px', flexWrap: 'nowrap' }}>
            {niveles.map((nivel, idx) => (
            <Col key={nivel} style={{ flex: '0 0 260px', maxWidth: '260px', minWidth: '260px', padding: '0 12px' }}>
                <Card className="h-100" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
                  <Card.Header className="text-center bg-light fw-bold">Nivel {nivel}</Card.Header>
                  <Card.Body style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                    {materiasPorNivel[idx].length === 0 ? (
                      <div className="text-muted text-center">Sin materias habilitadas</div>
                    ) : (
                      <div className="d-flex flex-column gap-2 align-items-center">
                        {materiasPorNivel[idx].map(m => (
                          <Badge
                            bg="primary"
                            key={m.id}
                            className="w-100 d-flex flex-column align-items-center justify-content-center"
                            style={{ fontSize: '1em', padding: '8px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center', gap: '2px' }}
                          >
                            <span>{m.nombre}</span>
                            {m.modalidad && (
                              <span className="badge bg-info mt-1" style={{ fontSize: '0.9em' }}>{m.modalidad}</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}