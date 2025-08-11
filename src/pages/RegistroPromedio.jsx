
import React, { useState } from "react";
import { materiasIniciales } from "../data/materias.js";
import { materiasElectivas } from "../data/materias-electivas.js";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import jsPDF from "jspdf";

function agruparPorNivel(materias) {
  return materias.reduce((acc, materia) => {
    if (!acc[materia.nivel]) acc[materia.nivel] = [];
    acc[materia.nivel].push(materia);
    return acc;
  }, {});
}

export default function RegistroPromedio() {
  const [electivas, setElectivas] = useState([{ materiaId: '', nota: '' }]);

  const handleElectivaMateriaChange = (idx, materiaId) => {
    setElectivas(prev => prev.map((e, i) => i === idx ? { ...e, materiaId } : e));
  };
  const handleElectivaNotaChange = (idx, nota) => {
    const num = Number(nota);
    if (nota === '' || (Number.isInteger(num) && num >= 1 && num <= 10)) {
      setElectivas(prev => prev.map((e, i) => i === idx ? { ...e, nota } : e));
    }
  };
  const handleAddElectiva = () => {
    setElectivas(prev => [...prev, { materiaId: '', nota: '' }]);
  };
  const handleRemoveElectiva = idx => {
    setElectivas(prev => prev.filter((_, i) => i !== idx));
  };
  const materiasPorNivel = agruparPorNivel(materiasIniciales);
  const [notas, setNotas] = useState({});
  const [aplazos, setAplazos] = useState([{ materiaId: '', nota: '' }]);
  const resumenRef = React.useRef(null);
  const navigate = useNavigate();

  // Calcular promedio por nivel (sin aplazos)
  const promediosPorNivel = {};
  Object.entries(materiasPorNivel).forEach(([nivel, materias]) => {
    const notasNivel = materias
      .map(m => Number(notas[m.id]))
      .filter(n => Number.isInteger(n) && n >= 1 && n <= 10);
    promediosPorNivel[nivel] = notasNivel.length > 0
      ? (notasNivel.reduce((a, b) => a + b, 0) / notasNivel.length).toFixed(2)
      : null;
  });

  const handleExportPDF = () => {
    const pdf = new jsPDF({ orientation: "portrait" });
    let y = 20;
    pdf.setFontSize(18);
    pdf.text("Registro de Promedio General", 15, y);
    y += 10;
    pdf.setFontSize(12);
    pdf.text(`Promedio General: ${promedioGeneral !== null ? promedioGeneral : "-"}`, 15, y);
    y += 7;
    pdf.text(`Promedio con aplazos: ${promedioConAplazos !== null ? promedioConAplazos : "-"}`, 15, y);
    y += 12;

    // Listado de materias y notas
    pdf.setFontSize(14);
    pdf.text("Materias y Notas", 15, y);
    y += 8;
    pdf.setFontSize(11);
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.1);
    pdf.line(15, y, 195, y);
    y += 3;
    pdf.text("Materia", 15, y);
    pdf.text("Nota", 120, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    Object.entries(materiasPorNivel).forEach(([nivel, materias]) => {
      materias.forEach(m => {
        const nota = notas[m.id] ? notas[m.id] : "-";
        pdf.text(m.nombre, 15, y);
        pdf.text(String(nota), 120, y);
        y += 6;
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
      });
    });
    y += 8;
    pdf.setFontSize(14);
    pdf.text("Aplazos", 15, y);
    y += 8;
    pdf.setFontSize(11);
    pdf.line(15, y, 195, y);
    y += 3;
    pdf.text("Materia", 15, y);
    pdf.text("Nota de aplazo", 120, y);
    y += 6;
    aplazos.forEach((aplazo, idx) => {
      const materia = materiasIniciales.find(m => String(m.id) === String(aplazo.materiaId));
      if (materia) {
        pdf.text(materia.nombre, 15, y);
        pdf.text(aplazo.nota ? String(aplazo.nota) : "-", 120, y);
        y += 6;
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
      }
    });
    y += 8;
    pdf.setFontSize(14);
    pdf.text("Electivas", 15, y);
    y += 8;
    pdf.setFontSize(11);
    pdf.line(15, y, 195, y);
    y += 3;
    pdf.text("Electiva", 15, y);
    pdf.text("Nota", 120, y);
    y += 6;
    electivas.forEach((electiva, idx) => {
      const materia = materiasElectivas.find(m => String(m.id) === String(electiva.materiaId));
      if (materia) {
        pdf.text(materia.nombre, 15, y);
        pdf.text(electiva.nota ? String(electiva.nota) : "-", 120, y);
        y += 6;
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
      }
    });
    pdf.save("registro-promedio.pdf");
  };
  const handleResetAll = () => {
    setNotas({});
    setAplazos([{ materiaId: '', nota: '' }]);
  };

  const handleNotaChange = (id, value) => {
    // Solo permitir números del 1 al 10
    const num = Number(value);
    if (value === "" || (Number.isInteger(num) && num >= 1 && num <= 10)) {
      setNotas(prev => ({ ...prev, [id]: value }));
    }
  };

  // Aplazos
  const handleAplazoMateriaChange = (idx, materiaId) => {
    setAplazos(prev => prev.map((a, i) => i === idx ? { ...a, materiaId } : a));
  };
  const handleAplazoNotaChange = (idx, nota) => {
    const num = Number(nota);
    if (nota === "" || (Number.isInteger(num) && num >= 1 && num <= 10)) {
      setAplazos(prev => prev.map((a, i) => i === idx ? { ...a, nota } : a));
    }
  };
  const handleAddAplazo = () => {
    setAplazos(prev => [...prev, { materiaId: '', nota: '' }]);
  };
  const handleRemoveAplazo = idx => {
    setAplazos(prev => prev.filter((_, i) => i !== idx));
  };

  // Calcular promedio general (sin aplazos)
  const notasValidas = Object.values(notas)
    .map(n => Number(n))
    .filter(n => Number.isInteger(n) && n >= 1 && n <= 10);
  const promedioGeneral = notasValidas.length > 0
    ? (notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(2)
    : null;

  // Calcular promedio con aplazos (incluye las notas de aplazos)
  const aplazosValidos = aplazos
    .map(a => Number(a.nota))
    .filter(n => Number.isInteger(n) && n >= 1 && n <= 10);
  const todasNotasConAplazos = [...notasValidas, ...aplazosValidos];
  const promedioConAplazos = todasNotasConAplazos.length > 0
    ? (todasNotasConAplazos.reduce((a, b) => a + b, 0) / todasNotasConAplazos.length).toFixed(2)
    : null;

  return (
    <Container className="py-4">
      <div ref={resumenRef}>
        <Card className="mb-4 shadow-sm">
          <Card.Body className="d-flex flex-column flex-md-row align-items-md-center justify-content-between">
            <div>
              <h2 className="mb-3 mb-md-0">Promedio General</h2>
              <div className="mt-2">
                <div className="mb-2">
                  <span className="fw-bold" style={{ fontSize: '1.1em', color: '#1976d2' }}>Promedio General: </span>
                  {promedioGeneral !== null ? (
                    <span style={{ fontSize: '1.3em', color: '#388e3c', fontWeight: 'bold' }}>{promedioGeneral}</span>
                  ) : (
                    <span className="text-muted" style={{ fontSize: '1.1em' }}>No hay notas cargadas</span>
                  )}
                </div>
                <div>
                  <span className="fw-bold" style={{ fontSize: '1.1em', color: '#d32f2f' }}>Promedio con aplazos: </span>
                  {promedioConAplazos !== null ? (
                    <span style={{ fontSize: '1.3em', color: '#d32f2f', fontWeight: 'bold' }}>{promedioConAplazos}</span>
                  ) : (
                    <span className="text-muted" style={{ fontSize: '1.1em' }}>No hay notas cargadas</span>
                  )}
                </div>
              </div>
            </div>
            <div className="d-flex flex-column gap-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/")}
                style={{ fontWeight: 'bold' }}
              >
                Volver al inicio
              </Button>
              <Button
                variant="outline-danger"
                size="lg"
                onClick={handleResetAll}
                style={{ fontWeight: 'bold' }}
              >
                Reestablecer todo
              </Button>
              <Button
                variant="success"
                size="lg"
                onClick={handleExportPDF}
                style={{ fontWeight: 'bold' }}
              >
                Exportar PDF
              </Button>
            </div>
          </Card.Body>
        </Card>
      <Row>
        {Object.entries(materiasPorNivel).map(([nivel, materias]) => (
          <Col key={nivel} xs={12} md={6} lg={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Header className="text-center fw-bold bg-info text-white">
                Nivel {nivel}
              </Card.Header>
              <Card.Body>
                {promediosPorNivel[nivel] !== null && (
                  <div className="mb-3 text-center">
                    <span className="badge bg-success" style={{ fontSize: '1.1em' }}>
                      Promedio del nivel: {promediosPorNivel[nivel]}
                    </span>
                  </div>
                )}
                <Form>
                  {materias.map(m => (
                    <Form.Group key={m.id} className="mb-3 d-flex align-items-center justify-content-between">
                      <Form.Label className="mb-0" style={{ flex: 1, fontWeight: '500' }}>{m.nombre}</Form.Label>
                      <Form.Control
                        type="number"
                        min={1}
                        max={10}
                        step={1}
                        value={notas[m.id] || ""}
                        onChange={e => handleNotaChange(m.id, e.target.value)}
                        placeholder="Nota"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        style={{ width: '80px', fontSize: '1em', fontWeight: 'bold' }}
                      />
                    </Form.Group>
                  ))}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

        {/* Sección de aplazos */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="fw-bold bg-danger text-white">Aplazos</Card.Header>
          <Card.Body>
            {aplazos.map((aplazo, idx) => (
              <Form key={idx} className="mb-3 d-flex align-items-center gap-2">
                <Form.Select
                  value={aplazo.materiaId}
                  onChange={e => handleAplazoMateriaChange(idx, e.target.value)}
                  style={{ minWidth: '220px' }}
                >
                  <option value="">Selecciona materia</option>
                  {materiasIniciales.map(m => (
                    <option key={m.id + '-' + idx} value={m.id}>{m.nombre}</option>
                  ))}
                </Form.Select>
                <Form.Control
                  type="number"
                  min={1}
                  max={10}
                  step={1}
                  value={aplazo.nota}
                  onChange={e => handleAplazoNotaChange(idx, e.target.value)}
                  placeholder="Nota del aplazo"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  style={{ width: '80px', fontSize: '1em', fontWeight: 'bold' }}
                />
                <Button variant="outline-danger" onClick={() => handleRemoveAplazo(idx)} disabled={aplazos.length === 1}>Eliminar</Button>
              </Form>
            ))}
            <Button variant="danger" onClick={handleAddAplazo}>Agregar aplazo</Button>
          </Card.Body>
        </Card>

        {/* Sección de electivas */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="fw-bold bg-secondary text-white">Electivas</Card.Header>
          <Card.Body>
            {electivas.map((electiva, idx) => (
              <Form key={idx} className="mb-3 d-flex align-items-center gap-2">
                <Form.Select
                  value={electiva.materiaId}
                  onChange={e => handleElectivaMateriaChange(idx, e.target.value)}
                  style={{ minWidth: '220px' }}
                >
                  <option value="">Selecciona electiva</option>
                  {materiasElectivas.map(m => (
                    <option key={m.id + '-' + idx} value={m.id}>{m.nombre}</option>
                  ))}
                </Form.Select>
                <Form.Control
                  type="number"
                  min={1}
                  max={10}
                  step={1}
                  value={electiva.nota}
                  onChange={e => handleElectivaNotaChange(idx, e.target.value)}
                  placeholder="Nota de electiva"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  style={{ width: '80px', fontSize: '1em', fontWeight: 'bold' }}
                />
                <Button variant="outline-secondary" onClick={() => handleRemoveElectiva(idx)} disabled={electivas.length === 1}>Eliminar</Button>
              </Form>
            ))}
            <Button variant="secondary" onClick={handleAddElectiva}>Agregar electiva</Button>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}
