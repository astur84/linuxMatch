# DistroMatch — TODO

## Backend
- [x] Schema de BD: tabla `distros` con todos los campos requeridos
- [x] Migración SQL aplicada
- [x] DB helpers en server/db.ts para CRUD de distros
- [x] tRPC router: listar distros con filtros (búsqueda, RAM, dificultad, propósito, arquitectura)
- [x] tRPC router: crear distro (protegido, solo admin)
- [x] tRPC router: editar distro (protegido, solo admin)
- [x] tRPC router: eliminar distro (protegido, solo admin)
- [x] API interna Wikipedia integrada en tRPC (distros.fetchWikipedia)
- [x] Seed de datos iniciales con 20 distribuciones populares

## Frontend
- [x] Estilos globales Ubuntu oscuro en index.css (fondo oscuro, acentos, sin border-radius)
- [x] Navbar con logo, enlace login y botón "Añadir Distro" (solo autenticados)
- [x] Página principal con grid de tarjetas de distribuciones
- [x] Barra de búsqueda en tiempo real
- [x] Filtro RAM mínima (slider)
- [x] Filtro dificultad (Principiante, Intermedio, Avanzado)
- [x] Filtro propósito (General, Gaming, Servidores, Seguridad, PCs Antiguos)
- [x] Filtro arquitectura (64-bit, ARM64, 32-bit)
- [x] Componente DistroCard con todos los campos
- [x] Estado vacío cuando no hay resultados
- [x] Login via Manus OAuth
- [x] Panel de administración protegido (/admin)
- [x] Formulario de admin: crear/editar distro con todos los campos
- [x] Botón "Autocargar desde Wikipedia" en formulario admin
- [x] Lista de distros en admin con acciones editar/eliminar
- [x] Rutas protegidas para /admin (guard de rol admin)

## Tests
- [x] Test tRPC router distros.list
- [x] Test tRPC router distros.create (admin only)
- [x] Test tRPC router distros.delete (admin only)

## Calidad
- [x] Responsive design
- [x] Estados de carga (skeletons)
- [x] Manejo de errores
