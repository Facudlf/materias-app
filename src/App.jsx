import React, { useState, useEffect } from "react";
import { materiasIniciales } from "./data/materias.js";
import { materiasElectivas } from "./data/materias-electivas.js";
import MateriasSelector from "./components/MateriasSelector.jsx";
import MateriasHabilitadas from "./components/MateriasHabilitadas.jsx";
import MateriasElectivas from "./components/MateriasElectivas.jsx";
import WeeklySchedule from "./components/WeeklySchedule.jsx";

function puedeCursar(materia, estados, estadosElectivas) {
  // Helper para obtener el estado de cualquier materia (regular o electiva)
  const getEstado = id => {
    if (Object.prototype.hasOwnProperty.call(estados, id)) return estados[id];
    if (estadosElectivas && Object.prototype.hasOwnProperty.call(estadosElectivas, id)) return estadosElectivas[id];
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
  // Persistencia en localStorage
  const [estados, setEstados] = useState(() => {
    try {
      const saved = localStorage.getItem('materias-estados');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [estadosElectivas, setEstadosElectivas] = useState(() => {
    try {
      const saved = localStorage.getItem('materias-electivas-estados');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  // Guardar estados en localStorage cuando cambian
  React.useEffect(() => {
    localStorage.setItem('materias-estados', JSON.stringify(estados));
  }, [estados]);
  React.useEffect(() => {
    localStorage.setItem('materias-electivas-estados', JSON.stringify(estadosElectivas));
  }, [estadosElectivas]);

  // Actualiza estados automáticamente según correlatividades (materias regulares)
  useEffect(() => {
    setEstados(prev => {
      const nuevosEstados = { ...prev };
      let cambios = false;
      materiasIniciales.forEach(m => {
        const habilitado = puedeCursar(m, prev, estadosElectivas);
        const tieneCorrelativas = (m.requisitosRegular && m.requisitosRegular.length > 0) || (m.requisitosAprobada && m.requisitosAprobada.length > 0);
        // Si no puede cursar y tiene correlativas, SIEMPRE bloquear
        if (!habilitado && tieneCorrelativas) {
          nuevosEstados[m.id] = "bloqueada";
          cambios = true;
        } else {
          // Si está bloqueada y ahora puede cursar, lo pasa a 'no'
          if (prev[m.id] === "bloqueada") {
            nuevosEstados[m.id] = "no";
            cambios = true;
          }
        }
      });
      return cambios ? nuevosEstados : prev;
    });
    // eslint-disable-next-line
  }, [materiasIniciales, estados, estadosElectivas]);

  // Actualiza estados automáticamente según correlatividades (electivas)
  useEffect(() => {
    setEstadosElectivas(prev => {
      const nuevosEstados = { ...prev };
      let cambios = false;
      materiasElectivas.forEach(e => {
        const regulares = e.requisitosRegular.every(id => estados[id] === "regular" || estados[id] === "aprobada");
        const aprobadas = e.requisitosAprobada.every(id => estados[id] === "aprobada");
        const habilitado = regulares && aprobadas;
        const tieneCorrelativas = (e.requisitosRegular && e.requisitosRegular.length > 0) || (e.requisitosAprobada && e.requisitosAprobada.length > 0);
        // Si no puede cursar y tiene correlativas, SIEMPRE bloquear
        if (!habilitado && tieneCorrelativas) {
          nuevosEstados[e.id] = "bloqueada";
          cambios = true;
        } else {
          // Si está bloqueada y ahora puede cursar, lo pasa a 'no'
          if (prev[e.id] === "bloqueada") {
            nuevosEstados[e.id] = "no";
            cambios = true;
          }
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
      if (Object.prototype.hasOwnProperty.call(estados, id)) return estados[id];
      if (Object.prototype.hasOwnProperty.call(estadosElectivas, id)) return estadosElectivas[id];
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
      <WeeklySchedule />
    </div>
  );
}