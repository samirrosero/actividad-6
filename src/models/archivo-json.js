// Utilidad de los modelos: guarda y lee arreglos en archivos JSON de /data.
// Solo la usan los modelos; controladores y rutas no saben que existe.
const fs = require('node:fs');
const path = require('node:path');

const CARPETA_DATOS = path.join(__dirname, '..', '..', 'data');

function guardar(nombreArchivo, datos) {
  fs.mkdirSync(CARPETA_DATOS, { recursive: true });
  fs.writeFileSync(path.join(CARPETA_DATOS, nombreArchivo), JSON.stringify(datos, null, 2));
}

// Lee el archivo; si no existe, lo crea con los datos iniciales
function cargar(nombreArchivo, datosIniciales) {
  const ruta = path.join(CARPETA_DATOS, nombreArchivo);
  if (!fs.existsSync(ruta)) {
    guardar(nombreArchivo, datosIniciales);
    return datosIniciales;
  }
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  } catch (error) {
    // No se sobrescribe el archivo para no perder datos: hay que corregirlo a mano
    console.error(`El archivo data/${nombreArchivo} no tiene un JSON válido: ${error.message}`);
    process.exit(1);
  }
}

// El siguiente id es el mayor id guardado + 1
const siguienteId = (lista) => lista.reduce((max, item) => Math.max(max, item.id), 0) + 1;

module.exports = { cargar, guardar, siguienteId };
