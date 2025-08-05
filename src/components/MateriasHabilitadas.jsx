import React from "react";

export default function MateriasHabilitadas({ materias }) {
  // Agrupa las materias habilitadas por nivel
  const niveles = ["1", "2", "3", "4", "5"];
  const materiasPorNivel = niveles.map(nivel =>
    materias.filter(m => m.nivel === nivel)
  );

  return (
    <div style={{ display: "flex", border: "2px solid black" }}>
      {niveles.map((nivel, idx) => (
        <div
          key={nivel}
          style={{
            flex: 1,
            borderRight: idx < niveles.length - 1 ? "2px solid black" : "none",
            padding: "10px",
            minHeight: "150px"
          }}
        >
          <h3 style={{ textAlign: "center" }}>Nivel {nivel}</h3>
          <ul>
            {materiasPorNivel[idx].map(m => (
              <li key={m.id}>{m.nombre}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}