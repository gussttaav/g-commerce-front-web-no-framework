const fs = require('fs'); // Módulo para trabajar con el sistema de archivos
const path = require('path'); // Módulo para manejar rutas de archivos
require('dotenv').config(); // Cargar variables de entorno desde el archivo .env

// Leer el contenido del archivo de plantilla de configuración
const template = fs.readFileSync(path.join(__dirname, 'config-template.js'), 'utf8');

// Reemplazar el marcador de posición #{API_URL}# con el valor de la variable de entorno API_URL
const config = template.replace('#{API_URL}#', process.env.API_URL || 'http://localhost:8080/api');

// Escribir el contenido de configuración en un nuevo archivo config.js
fs.writeFileSync(path.join(__dirname, 'config.js'), config);