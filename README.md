# Ocio Tracker

Web app mobile-first para trackear tu ocio: libros, juegos, películas, series y comics. Cada ítem tiene estado (pendiente, en curso, terminado) y fechas de creación/edición automáticas.

## Stack

- React + TypeScript + Vite
- Tailwind CSS (tema oscuro navy)
- Firebase Auth (anónimo) + Firestore para persistencia en la nube
- Fallback automático a `localStorage` si Firebase no está configurado
- Deploy en Vercel

## Desarrollo

```bash
npm install
npm run dev
```

## Configurar Firebase

1. Creá un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilitá **Authentication > Sign-in method > Google**.
3. Habilitá **Firestore Database** (modo producción) y aplicá las reglas de `firestore.rules`.
4. Copiá `.env.example` a `.env` y completá las credenciales de tu app web de Firebase:

```bash
cp .env.example .env
```

Sin estas variables, la app funciona igual pero guarda los datos solo en el navegador (localStorage) y no pide login. Con las variables cargadas, se requiere iniciar sesión con Google antes de usar la app.

## Deploy en Vercel

1. Subí el repo a GitHub.
2. Importá el proyecto en Vercel.
3. Cargá las variables de entorno `VITE_FIREBASE_*` en la configuración del proyecto en Vercel.
4. Deploy.

## Funcionalidades

- Categorías: Libros, Juegos, Películas, Series, Comics.
- Estados por ítem: Pendiente, En curso, Terminado.
- Alta, edición y borrado de ítems.
- Cambio rápido de estado desde la lista.
- Campo específico por categoría (autor, plataforma, director, creador).
- Notas opcionales por ítem.
- Fecha de creación y última edición automáticas.
- Filtro por categoría y por estado.
- Vista inicial ordenada por lo último agregado/editado.
- Botón flotante (+) para agregar rápido desde cualquier filtro.
- Diseño mobile-first en modo oscuro (paleta navy).
