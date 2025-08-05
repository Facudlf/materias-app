import React from "react";

export default function MateriasSelector({ materiasPorNivel, estados, puedeCursar, onChange }) {
  const niveles = ["1", "2", "3", "4", "5"];

  // Función para cambiar el estado de todas las materias de un nivel
  const cambiarEstadoNivel = (nivel, nuevoEstado) => {
    (materiasPorNivel[nivel] || []).forEach(m =>
      onChange(m.id, nuevoEstado)
    );
  };

  return (
    <div style={{ display: "flex", border: "2px solid black", marginBottom: "20px" }}>
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
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <button onClick={() => cambiarEstadoNivel(nivel, "regular")}>Regularizar todas</button>
            <button onClick={() => cambiarEstadoNivel(nivel, "aprobada")} style={{ marginLeft: "8px" }}>Aprobar todas</button>
          </div>
          {(materiasPorNivel[nivel] || []).map(m => {
            let color = "transparent";
            if (estados[m.id] === "aprobada") color = "green";
            else if (puedeCursar(m, estados) && estados[m.id] !== "regular" && estados[m.id] !== "aprobada") color = "yellow";
            else if (estados[m.id] === "regular") color = "lightblue";

            const habilitado =
              puedeCursar(m, estados) ||
              estados[m.id] === "regular" ||
              estados[m.id] === "aprobada";

            return (
              <div
                key={m.id}
                style={{
                  marginBottom: "8px",
                  backgroundColor: color,
                  color: color === "green" ? "white" : "black",
                  padding: "4px",
                  borderRadius: "4px"
                }}
              >
                <span>{m.nombre}</span>
                <select
                  value={estados[m.id] || "no"}
                  onChange={e => onChange(m.id, e.target.value)}
                  style={{ marginLeft: "8px" }}
                  disabled={!habilitado}
                >
                  <option value="no">No cursada</option>
                  <option value="libre">Libre</option>
                  <option value="regular">Regular</option>
                  <option value="aprobada">Aprobada</option>
                </select>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}