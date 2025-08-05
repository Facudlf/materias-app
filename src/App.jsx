import React, { useState, useEffect } from "react";
import { materiasIniciales } from "./data/materias.js";
import MateriasSelector from "./components/MateriasSelector.jsx";
import MateriasHabilitadas from "./components/MateriasHabilitadas.jsx";

function puedeCursar(materia, estados) {
  const regulares = materia.requisitosRegular.every(id => estados[id] === "regular" || estados[id] === "aprobada");
  const aprobadas = materia.requisitosAprobada.every(id => estados[id] === "aprobada");
  return regulares && aprobadas;
}

function agruparPorNivel(materias) {
  return materias.reduce((acc, materia) => {
    if (!acc[materia.nivel]) acc[materia.nivel] = [];
    acc[materia.nivel].push(materia);
    return acc;
  }, {});
}

export default function App() {
  const [estados, setEstados] = useState({});

  // Limpia estados inválidos cuando correlativas cambian
  useEffect(() => {
    setEstados(prev => {
      const nuevosEstados = { ...prev };
      let cambios = false;
      materiasIniciales.forEach(m => {
        // Solo puede estar en regular/aprobada si está habilitada
        const habilitado = puedeCursar(m, prev);
        if (
          !habilitado &&
          (prev[m.id] === "regular" || prev[m.id] === "aprobada")
        ) {
          nuevosEstados[m.id] = "no";
          cambios = true;
        }
      });
      return cambios ? nuevosEstados : prev;
    });
    // eslint-disable-next-line
  }, [materiasIniciales, estados]);

  const handleChange = (id, estado) => {
    setEstados(prev => ({ ...prev, [id]: estado }));
  };

  const materiasPorNivel = agruparPorNivel(materiasIniciales);
  const materiasHabilitadas = materiasIniciales
    .filter(m => puedeCursar(m, estados))
    .filter(m => estados[m.id] !== "regular" && estados[m.id] !== "aprobada");


  return (
    <div>
      <h2>Selecciona el estado de tus materias</h2>
      <MateriasSelector
        materiasPorNivel={materiasPorNivel}
        estados={estados}
        onChange={handleChange}
        puedeCursar={puedeCursar}
      />
      <h3>Materias que puedes cursar:</h3>
      <MateriasHabilitadas materias={materiasHabilitadas} estados={estados} />
    </div>
  );
}