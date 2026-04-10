# Beauty Center Polanco — Web

Sitio web y panel de administración del Beauty Center Polanco, construido con Next.js 16, Tailwind CSS v4 y TypeScript.

## Stack

| Tecnología | Uso |
|---|---|
| [Next.js 16](https://nextjs.org) | Framework (App Router) |
| [Tailwind CSS v4](https://tailwindcss.com) | Estilos |
| [TypeScript](https://www.typescriptlang.org) | Tipado |
| [Lucide React](https://lucide.dev) | Íconos del dashboard |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Utilidad `cn()` para clases condicionales |

## Requisitos previos

- Node.js 18+
- Backend corriendo en `http://localhost:8000` (ver `.env.example`)

## Instalación

```bash
npm install
```

Copia el archivo de entorno y ajusta la URL del backend:

```bash
cp .env.example .env.local
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend (sin slash final) | `http://localhost:8000` |

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/login/       # Página de login
│   ├── (dashboard)/        # Panel protegido (requiere auth)
│   │   └── dashboard/      # Rutas del panel: clientes, citas, etc.
│   └── (main)/             # Sitio público con header y footer
├── components/
│   ├── dashboard/Sidebar   # Sidebar del panel
│   ├── Header / Footer     # Navegación pública
│   └── RoleGuard           # Control de acceso por rol
├── context/AuthContext     # Estado de autenticación global
├── lib/
│   ├── api.ts              # Cliente fetch con token automático
│   └── utils.ts            # Utilidad cn() (clsx + tailwind-merge)
└── types/                  # Tipos TypeScript por entidad
```

## Roles

| Rol | Acceso |
|---|---|
| `admin` | Todo el panel |
| `receptionist` | Clientes, citas, ventas, servicios, productos, estilistas |
| `stylist` | Solo sus citas |
