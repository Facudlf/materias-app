import React, { useState, useEffect } from "react";
import { materiasIniciales } from "./data/materias.js";
import { materiasElectivas } from "./data/materias-electivas.js";
import MateriasSelector from "./components/MateriasSelector.jsx";
import MateriasHabilitadas from "./components/MateriasHabilitadas.jsx";
import MateriasElectivas from "./components/MateriasElectivas.jsx";

function puedeCursar(materia, estados, estadosElectivas) {
  // Helper para obtener el estado de cualquier materia (regular o electiva)
  const getEstado = id => {
    if (estados.hasOwnProperty(id)) return estados[id];
    if (estadosElectivas && estadosElectivas.hasOwnProperty(id)) return estadosElectivas[id];
    return undefined;
  };
  // Log para todas las materias
  console.log('puedeCursar:', {
    id: materia.id,
    nombre: materia.nombre,
    requisitosRegular: materia.requisitosRegular,
    requisitosAprobada: materia.requisitosAprobada,
    estados,
    estadosElectivas,
    estadosCorrelativas: materia.requisitosRegular.map(getEstado).concat(materia.requisitosAprobada.map(getEstado))
  });
  const regulares = materia.requisitosRegular.every(id => getEstado(id) === "regular" || getEstado(id) === "aprobada");
  const aprobadas = materia.requisitosAprobada.every(id => getEstado(id) === "aprobada");
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
  const [estadosElectivas, setEstadosElectivas] = useState({});

  // Limpia estados inválidos cuando correlativas cambian (materias regulares)
  useEffect(() => {
    setEstados(prev => {
      const nuevosEstados = { ...prev };
      let cambios = false;
      materiasIniciales.forEach(m => {
        // Solo puede estar en regular/aprobada si está habilitada
        const habilitado = puedeCursar(m, prev, estadosElectivas);
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
  }, [materiasIniciales, estados, estadosElectivas]);

  // Limpia estados inválidos de electivas cuando correlativas cambian
  useEffect(() => {
    setEstadosElectivas(prev => {
      const nuevosEstados = { ...prev };
      let cambios = false;
      materiasElectivas.forEach(e => {
        // Solo puede estar en regular/aprobada si está habilitada
        const regulares = e.requisitosRegular.every(id => estados[id] === "regular" || estados[id] === "aprobada");
        const aprobadas = e.requisitosAprobada.every(id => estados[id] === "aprobada");
        const habilitado = regulares && aprobadas;
        if (
          !habilitado &&
          (prev[e.id] === "regular" || prev[e.id] === "aprobada")
        ) {
          nuevosEstados[e.id] = "no";
          cambios = true;
        }
      });
      return cambios ? nuevosEstados : prev;
    });
    // eslint-disable-next-line
  }, [materiasElectivas, estados, estadosElectivas]);

  const handleChange = (id, estado) => {
    setEstados(prev => ({ ...prev, [id]: estado }));
  };
  const handleChangeElectiva = (id, estado) => {
    setEstadosElectivas(prev => ({ ...prev, [id]: estado }));
  };

  const materiasPorNivel = agruparPorNivel(materiasIniciales);
  const puedeCursarElectiva = (electiva) => {
    // Las electivas pueden tener correlativas regulares o electivas
    const getEstado = id => {
      if (estados.hasOwnProperty(id)) return estados[id];
      if (estadosElectivas.hasOwnProperty(id)) return estadosElectivas[id];
      return undefined;
    };
    const regulares = electiva.requisitosRegular.every(id => getEstado(id) === "regular" || getEstado(id) === "aprobada");
    const aprobadas = electiva.requisitosAprobada.every(id => getEstado(id) === "aprobada");
    return regulares && aprobadas;
  };

  const materiasHabilitadas = [
    ...materiasIniciales
      .filter(m => puedeCursar(m, estados))
      .filter(m => estados[m.id] !== "regular" && estados[m.id] !== "aprobada"),
    ...materiasElectivas
      .filter(e => puedeCursarElectiva(e))
      .filter(e => estadosElectivas[e.id] !== "regular" && estadosElectivas[e.id] !== "aprobada")
  ];

  return (
    <div>
      <h2>Selecciona el estado de tus materias</h2>
      <MateriasSelector
        materiasPorNivel={materiasPorNivel}
        estados={estados}
        estadosElectivas={estadosElectivas}
        onChange={handleChange}
        puedeCursar={puedeCursar}
      />
      <h2>Materias electivas</h2>
      <MateriasElectivas
        electivas={materiasElectivas}
        estados={estadosElectivas}
        estadosMaterias={estados}
        onChange={handleChangeElectiva}
      />
      <h3>Materias que puedes cursar:</h3>
      <MateriasHabilitadas materias={materiasHabilitadas} estados={estados} />
    </div>
  );
}