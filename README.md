## 🌐 Documentación del Backend: URL Shortener Multi-Usuario
Este documento describe la arquitectura e implementación del backend del acortador de URLs, centrándose en la migración a un sistema seguro de gestión de enlaces multiusuario utilizando GitHub OAuth 2.0 y JSON Web Tokens (JWT).

## 🚀 1. Arquitectura y Visión General
El proyecto utiliza Node.js con el framework Express como columna vertebral. La base de datos es MongoDB a través de Mongoose.
El cambio principal se centró en la seguridad y la segmentación de datos:
Autenticación: Implementada mediante Passport.js y la estrategia de GitHub OAuth, permitiendo a los usuarios registrarse o iniciar sesión con un solo clic.
Autorización: Manejada por JWT, lo que garantiza un estado stateless (sin estado) y permite al servidor verificar la identidad del usuario en cada solicitud protegida.
Propiedad de Datos: Todas las operaciones de URL están restringidas al usuario propietario del token, asegurando que los datos de un usuario nunca sean accesibles por otro.

## 🔑 2. Flujo de Autenticación con GitHub
La autenticación sigue el protocolo OAuth 2.0, gestionado por Passport.js.

### 1. Inicio de Sesión
El usuario inicia el proceso navegando a la URL /api/auth/github. El servidor redirige al usuario a la página de autorización de GitHub, solicitando permiso para acceder al perfil básico y al correo electrónico del usuario.

### 2. Callback y Generación de JWT
Tras la autorización, GitHub redirige al usuario de vuelta al backend a la ruta de callback: /api/auth/github/callback.

### 3. Verificación: 
Passport intercepta la solicitud, utiliza la estrategia de GitHub para recibir los datos del perfil y:

* Si el usuario ya existe (githubId), lo carga.

* Si no, crea un nuevo registro en la base de datos.

### 4. Generación de Token: 
El backend genera un JSON Web Token (JWT) que contiene el ID de MongoDB del usuario.

### 5. Redirección Final:
El servidor redirige el navegador del usuario al frontend y adjunta el JWT como un parámetro de consulta (?token=...).

## 🗄️ 3. Modelado de Datos y Autorización
Se han implementado dos modelos clave:

* **A. Modelo User**
Almacena la información esencial obtenida de GitHub:


**githubId:** Identificador único de GitHub (utilizado como clave primaria para el login).


**username:** Nombre de usuario público.


**email:** Dirección de correo electrónico (si está disponible).

* **B. Modelo Url (Modificado)**
Se modificó para asegurar la pertenencia de los enlaces:

userId: Una referencia (ObjectId) al modelo User. Este campo es obligatorio (required: true) y vincula directamente el enlace al usuario que lo creó.


## 🛡️ 4. Middleware de Protección
El archivo middleware/auth.js define la función protect, esencial para asegurar todas las rutas sensibles.


**Extracción del Token:** protect busca el JWT en el header Authorization: Bearer <token>.


**Verificación:** Utiliza el JWT_SECRET (variable de entorno) para verificar la autenticidad del token.


**Adjuntar ID:** Si el token es válido, extrae el ID del usuario y lo adjunta al objeto req como req.user.id.


**Control de Acceso:** Si el token falta o es inválido, detiene la solicitud y devuelve un código 401 Unauthorized.

## 🗺️ 5. Definición de Rutas API
Todas las rutas están agrupadas bajo el prefijo /api. Las rutas se dividen claramente entre las que requieren autenticación (protect) y las que son de acceso público.

### Rutas de Autenticación (/api)
| Método |   URL    | Descripción |
|--------|----------|----------|
| GET    | /auth/github   | Redirige al usuario a GitHub para la autorización.   |
| GET    | /auth/github/callback   | Recibe la respuesta de GitHub, autentica al usuario, genera el JWT y redirige al frontend con el token.   |

### Rutas de URLs (/api)
| Método |   URL    | Descripción |
|--------|----------|----------|
| POST   | /shorten   | Crea una nueva URL corta. El controlador guarda el enlace con el userId del token. |
| GET    | /urls   | Devuelve solo la lista de URLs creadas por el usuario autenticado (filtrado por userId). |
| GET    | /details/:shortUrl | Obtiene los datos detallados de una URL específica. Verifica que el enlace pertenezca al usuario antes de devolver la información. |
| DELETE | /delete/:shortUrl | Elimina una URL corta. La eliminación solo se ejecuta si el shortUrl y el userId coinciden. |
| GET    | /:shortUrl | Ruta de redirección principal. Localiza el originalUrl, incrementa el contador de clics y redirige al usuario. No requiere autenticación. |
