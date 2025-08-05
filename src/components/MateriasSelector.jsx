import React from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";

export default function MateriasSelector({ materiasPorNivel, estados, estadosElectivas, puedeCursar, onChange }) {
  const niveles = ["1", "2", "3", "4", "5"];

  // Función para cambiar el estado de todas las materias de un nivel
  const cambiarEstadoNivel = (nivel, nuevoEstado) => {
    (materiasPorNivel[nivel] || []).forEach(m =>
      onChange(m.id, nuevoEstado)
    );
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
                  let color = "";
                  if (estados[m.id] === "aprobada") color = "bg-success text-white";
                  else if (puedeCursar(m, estados, estadosElectivas) && estados[m.id] !== "regular" && estados[m.id] !== "aprobada") color = "bg-warning";
                  else if (estados[m.id] === "regular") color = "bg-info";

                  const habilitado =
                    puedeCursar(m, estados, estadosElectivas) ||
                    estados[m.id] === "regular" ||
                    estados[m.id] === "aprobada";

                  return (
                    <Card className={`mb-2 ${color}`} key={m.id}>
                      <Card.Body className="d-flex align-items-center justify-content-between p-2">
                        <div>
                          <span className="fw-bold">{m.nombre}</span>
                          <span className="ms-2 text-muted">{m.codigo}</span>
                        </div>
                        <Form.Select
                          size="sm"
                          value={estados[m.id] || "no"}
                          onChange={e => onChange(m.id, e.target.value)}
                          disabled={!habilitado}
                          style={{ width: "130px" }}
                        >
                          <option value="no">No cursada</option>
                          <option value="regular">Regular</option>
                          <option value="aprobada">Aprobada</option>
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