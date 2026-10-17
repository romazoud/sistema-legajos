# Legajos — versión estática para GitHub Pages

Esta versión está hecha con HTML, CSS y JavaScript para que puedas publicarla como una página estática, sin instalar Python.

## Cómo publicarla en GitHub Pages

1. Creá un repositorio en GitHub.
2. Subí el contenido de esta carpeta (los archivos y las carpetas `static` y `js`) a la raíz del repositorio.
3. Entrá a **Settings → Pages**.
4. En **Build and deployment**, elegí **Deploy from a branch**.
5. Seleccioná la rama `main` y la carpeta `/ (root)`, y guardá.
6. Esperá a que GitHub Pages publique el sitio y abrí la URL que te muestra.

El archivo principal debe llamarse `index.html` y estar en la raíz del repositorio.

## Qué incluye

- Buscador por legajo, nombre, apellido, sector y datos importados.
- Importación de varios Excel (`.xlsx`, `.xls`) y CSV desde el navegador.
- Combina filas que comparten número de legajo y conserva columnas desconocidas.
- Ficha individual por empleado.
- Exportación de CSV.
- Guarda la información en el almacenamiento local del navegador.

## MUY IMPORTANTE: limitaciones y privacidad

Esto es un **prototipo de demostración**, no un sistema empresarial seguro.

- Los datos se guardan en `localStorage` del navegador en ese dispositivo. No se sincronizan con otras computadoras ni con otros usuarios.
- Si la persona abre la web desde otra computadora o borra los datos del navegador, no tendrá esos legajos.
- No hay inicio de sesión real, control de permisos ni base de datos compartida.
- Los archivos Excel se procesan en el navegador. La librería para leer Excel se carga desde un CDN externo.
- No cargues datos reales de empleados, DNI, CUIL, domicilios, salud, salarios ni otra información confidencial en esta versión.
- No pongas archivos de Excel reales en el repositorio de GitHub, ni siquiera si el repositorio es privado, sin autorización y revisión de seguridad.

Para uso real con legajos laborales se necesita un backend con autenticación, permisos, base de datos persistente (por ejemplo PostgreSQL), HTTPS, copias de seguridad y revisión de seguridad. GitHub Pages solamente aloja la interfaz estática; no proporciona esas funciones.

## Columnas reconocidas

La importación intenta reconocer variantes comunes de: Legajo, Nombre, Apellido, Nombre completo, DNI, CUIL/CUIT, correo, teléfono, área/sector, puesto/cargo, fecha de ingreso, fecha de nacimiento, estado, sede, domicilio y jefe/responsable.

La columna del número de legajo es obligatoria para unir filas. Si tus archivos usan otro nombre, ajustá los alias en `js/app.js`.
