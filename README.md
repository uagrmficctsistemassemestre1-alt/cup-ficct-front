# CUP-FICCT Frontend

Frontend del sistema CUP-FICCT (Next.js App Router + TypeScript) que consume la API Laravel.
Implementa el módulo de **Authentication**: login, recuperación de contraseña, cambio de
contraseña forzado, perfil, control de acceso por permisos (RBAC) y gestión de usuarios y roles.

## Stack

- Next.js (App Router) + React + TypeScript (modo estricto).
- Cliente HTTP central tipado con Axios (interceptores de token y refresh).
- Estado de autenticación con Zustand (sesión persistente + auto-refresh).
- Tailwind CSS.
- Docker (multi-stage, salida `standalone`).

## Variables de entorno

Toda la configuración vive en `.env` (no se versiona). Copiá `.env.example` y completá:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

`NEXT_PUBLIC_API_URL` es la **única** variable: la URL base de la API (incluye `/api`).
La usan tanto el navegador como el server de Next (proxy de fotos `/api/foto/...`),
así que debe ser alcanzable desde el **host** (el navegador nunca resuelve nombres de
servicio de Docker). Valores según cómo corras:

| Entorno | NEXT_PUBLIC_API_URL |
| --- | --- |
| `npm run dev` (todo en el host) | `http://localhost:8000/api` |
| Docker (backend con puerto publicado, escuchando `0.0.0.0`) | `http://host.docker.internal:8000/api` |
| Backend público / producción | `https://cup-ficct-backend.onrender.com/api` |

La foto de perfil llega vía 302 a una URL firmada de R2 sin CORS; el proxy la resuelve
en el servidor y la sirve al mismo origen para usarla como `src` de imagen.

## Desarrollo local

```bash
npm install
npm run dev
```

App en http://localhost:3000.

## Docker

```bash
docker compose up --build
```

Levanta el frontend en el puerto `3000` leyendo `.env`.

## Despliegue

El backend de producción vive en `https://cup-ficct-backend.onrender.com`.

1. Definí las variables en la plataforma (Render/Vercel). `NEXT_PUBLIC_API_URL` es
   **build-time**, así que debe estar disponible al construir:

   ```
   NEXT_PUBLIC_API_URL=https://cup-ficct-backend.onrender.com/api
   ```

   En local podés usar `.env.production` (no se versiona) para un build de producción
   con `npm run build && npm run start`.

2. En el **backend**, agregá el dominio del frontend desplegado a `CORS_ALLOWED_ORIGINS`
   (o `FRONTEND_URL`); si no, el navegador bloquea las llamadas por CORS.

## Estructura

```
src/
  app/                 Rutas (App Router)
    login/             Inicio de sesión
    forgot-password/   Solicitud de recuperación
    reset-password/    Restablecimiento con token
    change-password/   Cambio de contraseña forzado
    (protected)/       Layout protegido + páginas con sesión
      dashboard/
      perfil/
      usuarios/        CRUD usuarios (permiso user.manage)
      roles/           CRUD roles + permisos (permiso role.manage)
  components/          UI y guardas (AuthProvider, Can, nav)
  hooks/              Hooks de autenticación
  lib/                Cliente HTTP, tipos y helpers de error
  services/           Llamadas a la API por dominio
  store/              Store de autenticación (Zustand)
```
