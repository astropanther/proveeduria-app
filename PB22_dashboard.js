const express = require("express");
const app = express();

app.use(express.json());

// Simulación de base de datos
const solicitudes = [
  { id: 1, estado: "Pendiente" },
  { id: 2, estado: "Aprobada" },
  { id: 3, estado: "Aprobada" },
  { id: 4, estado: "Rechazada" },
  { id: 5, estado: "Anulada" },
];

// Función para contar solicitudes por estado
function contarPorEstado() {
  const resumen = { Pendiente: 0, Aprobada: 0, Rechazada: 0, Anulada: 0 };
  solicitudes.forEach((s) => resumen[s.estado]++);
  return resumen;
}

// Endpoint para enviar datos JSON al frontend
app.get("/dashboard", (req, res) => {
  const resumen = contarPorEstado();
  res.json(resumen);
});

app.listen(3003, () => console.log("PB22_dashboard corriendo en http://localhost:3003"));
