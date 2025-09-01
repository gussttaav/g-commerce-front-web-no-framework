/**
 * Este objeto contiene la configuración de la aplicación
 * 
 * Los marcadores #{VALUE}# se reemplazan desde el archivo
 * generate-config.js
 * usando los valores de las variables de entorno en el archivo .env
 * 
 * Se genera un nuevo archivo
 * config.js
 * con este objeto y los valores de la variable de entorno. Este
 * archivo se incluirá en los documentos html donde se usen estos valores.
 */

window.APP_CONFIG = {
    // URL de la API que se utilizará en la aplicación
    API_URL: '#{API_URL}#'
};