// ============================================================
//  API REST - Lista de Tareas + Lista de Contactos
//  Node.js + Express (métodos GET, POST, PUT y DELETE)
//  server.js: crea la app, aplica middlewares y monta las rutas.
// ============================================================
const path = require('node:path');
const express = require('express');
const tareasRoutes = require('./routes/tareas.routes');
const contactosRoutes = require('./routes/contactos.routes');

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middleware para entender JSON en el cuerpo de las peticiones
app.use(express.json());

// Frontend (HTML, CSS y JS) desde la carpeta /public: en "/" se ve la lista de tareas
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rutas de la API
app.use('/tareas', tareasRoutes);
app.use('/contactos', contactosRoutes);

// Cualquier ruta que no exista → 404 en JSON (va de última)
app.use((req, res) => {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
});

// Errores: JSON mal escrito en el body → 400; cualquier otro → 500 (siempre en JSON)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`  Tareas:    http://localhost:${PORT}/  (API: /tareas)`);
  console.log(`  Contactos: http://localhost:${PORT}/contactos.html  (API: /contactos)`);
});
