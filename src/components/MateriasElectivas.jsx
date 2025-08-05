import React from "react";
import { Container, Row, Col, Card, Button, Form, Badge } from "react-bootstrap";

export default function MateriasElectivas({ electivas, estados, estadosMaterias, onChange }) {
  // Agrupa electivas por nivel
  const niveles = ["3", "4", "5"];
  const electivasPorNivel = niveles.reduce((acc, nivel) => {
    acc[nivel] = electivas.filter(e => e.nivel === nivel);
    return acc;
  }, {});

  // Suma de créditos aprobados
  const creditosAprobados = electivas
    .filter(e => estados[e.id] === "aprobada")
    .reduce((sum, e) => sum + (e.creditos || 0), 0);

  // Función para cambiar el estado de todas las electivas de un nivel, solo si pueden estar en ese estado
  const cambiarEstadoNivel = (nivel, nuevoEstado) => {
    (electivasPorNivel[nivel] || []).forEach(e => {
      if (
        nuevoEstado === "no" ||
        (nuevoEstado === "regular" && puedeCursarElectiva(e)) ||
        (nuevoEstado === "aprobada" && puedeCursarElectiva(e))
      ) {
        onChange(e.id, nuevoEstado);
      }
    });
  };

  // Determina si la electiva está habilitada para cursar (usa la misma lógica que las materias regulares)
  function puedeCursarElectiva(electiva) {
    const getEstado = id => {
      // Si el id corresponde a una electiva, busca en estados; si no, en estadosMaterias
      if (estados.hasOwnProperty(id)) return estados[id];
      return estadosMaterias[id];
    };
    const regulares = electiva.requisitosRegular.every(id => getEstado(id) === "regular" || getEstado(id) === "aprobada");
    const aprobadas = electiva.requisitosAprobada.every(id => getEstado(id) === "aprobada");
    return regulares && aprobadas;
  }

  return (
    <Container className="mb-4">
      <h3 className="mb-3"><Badge bg="info">Créditos obtenidos: {creditosAprobados}</Badge></h3>
      <Row>
        {niveles.map((nivel, idx) => (
          <Col key={nivel} xs={12} sm={6} md={4} className="mb-3">
            <Card>
              <Card.Header className="text-center">Nivel {nivel}</Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-center mb-3 gap-2">
                  <Button variant="outline-secondary" size="sm" onClick={() => cambiarEstadoNivel(nivel, "no")}>No cursada todas</Button>
                  <Button variant="outline-primary" size="sm" onClick={() => cambiarEstadoNivel(nivel, "regular")}>Regularizar todas</Button>
                  <Button variant="outline-success" size="sm" onClick={() => cambiarEstadoNivel(nivel, "aprobada")}>Aprobar todas</Button>
                </div>
                {(electivasPorNivel[nivel] || []).map(e => {
                  // El color y el selector dependen solo del estado actual
                  let color;
                  if (estados[e.id] === "bloqueada") color = "bg-secondary text-white";
                  else if (estados[e.id] === "aprobada") color = "bg-success text-white";
                  else if (estados[e.id] === "regular") color = "bg-info";
                  else if (puedeCursarElectiva(e)) color = "bg-warning";
                  else color = "bg-light text-muted";

                  return (
                    <Card className={`mb-2 ${color}`} key={e.id} style={{ minWidth: "180px", maxWidth: "100%" }}>
                      <Card.Body className="d-flex align-items-center justify-content-between p-2 flex-wrap" style={{ minHeight: "48px" }}>
                        <div style={{ flex: 1, minWidth: 0, marginBottom: '8px' }}>
                          <span className="fw-bold" style={{ fontSize: '1.1em' }}>{e.nombre}</span>
                          <span className="ms-2 text-muted" style={{ fontSize: '1em' }}>Créditos: {e.creditos}</span>
                        </div>
                        {estados[e.id] === "bloqueada" ? (
                          <span className="badge bg-secondary" style={{ minWidth: "130px", marginLeft: "8px", fontSize: '1.1em', padding: '10px' }}>
                            Bloqueada
                          </span>
                        ) : (
                          <Form.Select
                            size="sm"
                            value={estados[e.id] || "no"}
                            onChange={ev => onChange(e.id, ev.target.value)}
                            aria-label={`Estado de ${e.nombre}`}
                            style={{ minWidth: "130px", maxWidth: "100%", marginLeft: "8px", padding: '10px', fontSize: '1.1em' }}
                            title="Selecciona el estado"
                          >
                            <option value="no">No cursada</option>
                            <option value="regular">Regular</option>
                            <option value="aprobada">Aprobada</option>
                          </Form.Select>
                        )}
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
