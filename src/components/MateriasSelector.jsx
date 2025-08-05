import React from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";

export default function MateriasSelector({ materiasPorNivel, estados, estadosElectivas, puedeCursar, onChange }) {
  const niveles = ["1", "2", "3", "4", "5"];

  // Función para cambiar el estado de todas las materias de un nivel, solo si pueden estar en ese estado
  const cambiarEstadoNivel = (nivel, nuevoEstado) => {
    (materiasPorNivel[nivel] || []).forEach(m => {
      const habilitado = puedeCursar(m, estados, estadosElectivas);
      if (nuevoEstado === "no") {
        if (habilitado) {
          onChange(m.id, "no");
        } else {
          onChange(m.id, "bloqueada");
        }
      } else if (nuevoEstado === "regular" && habilitado) {
        onChange(m.id, "regular");
      } else if (nuevoEstado === "aprobada" && habilitado) {
        onChange(m.id, "aprobada");
      }
    });
  };

  return (
    <Container className="mb-4">

      <Row>
        {niveles.map((nivel, idx) => (
          <Col key={nivel} md={4} className="mb-3">
            <Card>
              <Card.Header className="text-center">Nivel {nivel}</Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-center mb-3 gap-2">
                  <Button variant="outline-secondary" size="sm" onClick={() => cambiarEstadoNivel(nivel, "no")}>No cursada todas</Button>
                  <Button variant="outline-primary" size="sm" onClick={() => cambiarEstadoNivel(nivel, "regular")}>Regularizar todas</Button>
                  <Button variant="outline-success" size="sm" onClick={() => cambiarEstadoNivel(nivel, "aprobada")}>Aprobar todas</Button>
                </div>
                {(materiasPorNivel[nivel] || []).map(m => {
                  // El color y el selector dependen solo del estado actual
                  let color;
                  if (estados[m.id] === "bloqueada") color = "bg-secondary text-white";
                  else if (estados[m.id] === "aprobada") color = "bg-success text-white";
                  else if (estados[m.id] === "regular") color = "bg-info";
                  else if (puedeCursar(m, estados, estadosElectivas)) color = "bg-warning";
                  else color = "bg-light text-muted";

                  return (
                    <Card className={`mb-2 ${color}`} key={m.id} style={{ minWidth: "270px", maxWidth: "100%" }}>
                      <Card.Body className="d-flex align-items-center justify-content-between p-2" style={{ minHeight: "48px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span className="fw-bold">{m.nombre}</span>
                          <span className="ms-2 text-muted">{m.codigo}</span>
                        </div>
                        <Form.Select
                          size="sm"
                          value={estados[m.id] || "no"}
                          onChange={e => onChange(m.id, e.target.value)}
                          disabled={estados[m.id] === "bloqueada"}
                          style={{ width: "140px", marginLeft: "8px" }}
                        >
                          <option value="no">No cursada</option>
                          <option value="regular">Regular</option>
                          <option value="aprobada">Aprobada</option>
                          <option value="bloqueada">Bloqueada</option>
                        </Form.Select>
                      </Card.Body>
                    </Card>
                  );
                })}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}