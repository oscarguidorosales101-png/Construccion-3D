# FORMA 3D — Plataforma Web de Modelado CAD Paramétrico e Industrial

Plataforma web independiente de diseño, ingeniería y construcción tridimensional paramétrica inspirada en sistemas CAD industriales y en la fabricación de recipientes y tanques de almacenamiento metálicos (API-650).

Desarrollada con **React**, **TypeScript**, **Vite**, **Three.js** y **Supabase**.

---

## 1. Visión General del Proyecto

FORMA 3D combina dos paradigmas esenciales de ingeniería:
1. **Modelado Paramétrico:** Construcción de ensamblajes y geometrías mediante parámetros físicos, dimensiones, restricciones y relaciones dimensionales. La modificación de cotas principales (p. ej. diámetro, altura o número de virolas) recalcula y regenera reactivamente todas las piezas dependientes (virolas, chapas curvadas desfasadas, escalera helicoidal de caracol, techo autoportante, anillos de viento y boquillas con bridas).
2. **Modelado Libre:** Manipulación interactiva con precisión milimétrica en el espacio 3D (traslación, rotación, escala, duplicación, cambio de visibilidad, bloqueo y eliminación) asistida por gizmos y ajuste magnético (snapping a cuadrícula y ángulos).

---

## 2. Tecnologías y Stack Técnico

- **Frontend Core:** React 19 + TypeScript (ES2023, strict mode)
- **Empaquetador & Dev Server:** Vite 8
- **Motor 3D:** Three.js con integración React Three Fiber (`@react-three/fiber`) y controles de cámara/gizmos (`@react-three/drei`)
- **Iconografía:** Lucide React
- **Estilos:** Sistema de diseño CAD Vanilla CSS (paleta grafito/obsidiana con acentos ámbar y cian)
- **Base de Datos & Auth:** Supabase Auth (correo/contraseña) y Supabase PostgreSQL con Row Level Security (RLS)
- **Interoperabilidad 3D:** Three.js `GLTFExporter`, `STLExporter` y serializador nativo JSON versionado (`.forma3d`)

---

## 3. Arquitectura del Proyecto

```text
├── supabase/
│   └── schema.sql                   # Esquema DDL de PostgreSQL y políticas de seguridad RLS
├── src/
│   ├── types/
│   │   ├── cad.ts                   # Tipos de objetos CAD, parámetros, materiales, vistas y transformaciones
│   │   ├── project.ts               # Estructura del formato nativo versionado (.forma3d)
│   │   └── auth.ts                  # Perfiles de usuario y estados de autenticación
│   ├── engine3d/
│   │   ├── parametric/
│   │   │   ├── tankGenerator.ts     # Generador procedural del tanque industrial API-650
│   │   │   └── primitiveGenerators.ts # Generador de BufferGeometry de primitivas CAD
│   │   ├── materials/
│   │   │   └── cadMaterials.ts      # Biblioteca de materiales de ingeniería con propiedades PBR y densidad
│   │   ├── camera/
│   │   │   └── viewpoints.ts        # Presets de cámara (Perspectiva, Isométrica, Planta, Frontal, Lateral)
│   │   └── history/
│   │       └── historyManager.ts    # Historial de comandos Undo / Redo serializable
│   ├── services/
│   │   ├── supabase/
│   │   │   ├── client.ts            # Inicialización con detección de entorno
│   │   │   ├── authService.ts       # Registro, Login, Recuperación y Sesión con Supabase
│   │   │   └── projectService.ts    # Persistencia remota en PostgreSQL con fallback a caché local
│   │   └── export/
│   │       ├── gltfExport.ts        # Exportador a .glb / .gltf
│   │       ├── stlExport.ts         # Exportador a .stl para impresión 3D
│   │       └── nativeExport.ts      # Serializador/Deserializador del formato nativo .forma3d
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Navbar.tsx           # Barra superior con nombre de proyecto, vistas, exportación y sync
│   │   │   └── Modal.tsx            # Componente modal accesible
│   │   ├── auth/
│   │   │   ├── AuthModal.tsx        # Modal de inicio de sesión, registro y restablecimiento de contraseña
│   │   │   └── SupabaseSetupGuide.tsx # Guía interactiva de configuración de Supabase
│   │   ├── dashboard/
│   │   │   ├── ProjectDashboard.tsx # Panel de gestión, búsqueda, duplicación y apertura de proyectos
│   │   │   └── LandingPage.tsx      # Portada pública de presentación
│   │   └── cad/
│   │       ├── CADCanvas.tsx        # Lienzo Three.js/R3F, iluminación de estudio, rejilla y gizmos
│   │       ├── SceneObjects.tsx     # Renderizador de piezas y despiece de ensamblaje con bordes CAD
│   │       ├── LeftSidebar/
│   │       │   ├── LeftPanel.tsx    # Contenedor de herramientas colapsable
│   │       │   ├── TankBuilderTab.tsx # Controles paramétricos en vivo del tanque
│   │       │   ├── PrimitivesTab.tsx  # Primitivas industriales (cubo, cilindro, tubo, placa, etc.)
│   │       │   └── OutlinerTab.tsx    # Árbol jerárquico de componentes (visibilidad, bloqueo, renombrado)
│   │       ├── RightSidebar/
│   │       │   ├── RightPanel.tsx   # Contenedor de propiedades colapsable
│   │       │   ├── TransformInspector.tsx # Inspector de coordenadas X, Y, Z numérico
│   │       │   ├── ParametricProperties.tsx # Modificación dimensional de piezas seleccionadas
│   │       │   ├── MaterialPicker.tsx # Selector de materiales y propiedades PBR
│   │       │   └── EngineeringMetrics.tsx # Cálculo reactivo de volumen, área y peso estimado
│   │       └── bottom/
│   │           └── StatusBar.tsx    # Barra de estado inferior con herramientas, snap y unidades
│   ├── App.tsx                      # Orquestador principal de estado y atajos de teclado
│   ├── index.css                    # Sistema de diseño CAD oscuro
│   └── main.tsx                     # Punto de entrada de React
├── .env.example                     # Plantilla de variables de entorno
└── package.json
```

---

## 4. Requisitos Previos e Instalación

### Requisitos:
- Node.js versión `>= 18.0.0` (recomendado Node 20 o superior).
- Gestor de paquetes `npm`.

### Instalación de dependencias:
```bash
npm install
```

### Ejecución en Modo Desarrollo:
```bash
npm run dev
```
La aplicación estará disponible localmente en `http://127.0.0.1:5173/`.

### Compilación para Producción:
```bash
npm run build
```
Genera la carpeta optimizada y minificada `/dist`.

---

## 5. Configuración de Supabase (Base de Datos & Auth)

FORMA 3D está diseñada para funcionar **inmediatamente de forma local** (con almacenamiento en IndexedDB / LocalStorage) sin bloquear al usuario si Supabase no está configurado.

Para conectar la persistencia en la nube y la autenticación multiusuario:

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **Project Settings → API** y copia la **Project URL** y la clave pública **anon key**.
3. Crea un archivo `.env` en la raíz del proyecto (basado en `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-public-key
   ```
4. Abre el **SQL Editor** en el panel de Supabase y ejecuta el script contenido en `supabase/schema.sql`.

### Esquema y Políticas RLS implementadas:
- Tabla `public.projects`: Almacena el identificador UUID, `user_id` del propietario, nombre, descripción, versión y el contenido del modelo JSONB.
- **Row Level Security (RLS) habilitado:**
  - `SELECT`: `USING (auth.uid() = user_id)`
  - `INSERT`: `WITH CHECK (auth.uid() = user_id)`
  - `UPDATE`: `USING (auth.uid() = user_id)`
  - `DELETE`: `USING (auth.uid() = user_id)`
- Los proyectos de un usuario son estrictamente invisibles e inaccesibles para otros usuarios.

---

## 6. Constructor Paramétrico de Tanques Industriales

Inspirado en el video de referencia y estándares industriales (API-650 / API-620), el generador procedural produce:
1. **Virolas de chapas cilíndricas curvadas:** Diámetro y altura configurables con juntas verticales desfasadas (staggered seams) en cursos alternos.
2. **Placa anular de fondo:** Base plana con ala anular perimetral sobresaliente.
3. **Techo:** Opciones de techo cónico autoportante (pendiente configurable), techo domo geodésico o techo abierto.
4. **Anillos rigidizadores de viento (Wind girders):** Refuerzos anulares horizontales soldados para resistencia a carga de viento.
5. **Barandilla perimetral de seguridad:** Barandilla tubular de 1050 mm de altura en la corona del techo.
6. **Escalera helicoidal de caracol:** Trayectoria en espiral externa con peldaños individuales, radio exterior y barandilla tubular.
7. **Puerta de limpieza / Manhole DN900:** Boca de hombre con proyección y cuello en la base del curso 1.
8. **Boquillas de proceso (Nozzles):** Boquillas parametrizables en elevación, ángulo azimutal (0-360°) y diámetro nominal con bridas soldadas.
9. **Cálculo de ingeniería en tiempo real:** Volumen nominal en $m^3$, capacidad en litros, superficie total de chapa en $m^2$ y peso estimado en toneladas según el material asignado.

---

## 7. Formatos de Importación y Exportación

| Formato | Tipo | Uso principal |
|---|---|---|
| **.forma3d** | Nativo (JSON versionado) | Conserva la totalidad del árbol paramétrico, dependencias, cotas, historial, materiales y configuración de escena. |
| **.glb** | Binario glTF 2.0 | Intercambio de geometría, mallas y materiales con Blender, Three.js, visores web y motores gráficos. |
| **.stl** | Estereolitografía 3D | Fabricación aditiva, prototipado e impresión 3D directa de las mallas. |

---

## 8. Atajos de Teclado del Editor CAD

- **Ctrl + Z / Cmd + Z:** Deshacer operación
- **Ctrl + Y / Ctrl + Shift + Z:** Rehacer operación
- **Ctrl + S:** Guardar proyecto
- **Q:** Herramienta de Selección
- **W:** Herramienta de Mover (Gizmo de traslación)
- **E:** Herramienta de Rotar (Gizmo de rotación)
- **R:** Herramienta de Escalar (Gizmo de escala)
- **G:** Alternar visualización de rejilla
- **Delete / Supr:** Eliminar objeto o ensamblaje seleccionado
- **Botón Izquierdo + Arrastrar:** Orbitar cámara 3D
- **Botón Derecho + Arrastrar:** Desplazar cámara 3D (Pan)
- **Rueda del Ratón:** Zoom in / Zoom out

---

## 9. Despliegue en Producción (Vercel / Netlify)

1. Enlaza el repositorio a Vercel o Netlify.
2. Configura las variables de entorno del despliegue:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Comando de compilación: `npm run build`
4. Directorio de salida: `dist`
5. En el panel de Supabase Auth, agrega la URL de producción a **Authentication → URL Configuration → Redirect URLs**.

---

## 10. Limitaciones Conocidas y Alcance Técnico

- **Cálculo estructural:** El constructor paramétrico genera geometrías de ingeniería proporcionales con estimaciones dimensionales. No realiza análisis de elementos finitos (FEA), cálculo de fatiga ni certificación legal de presiones API-650.
- **Formatos CAD neutros:** Formatos como STEP o IGES requieren librerías OpenCASCADE WASM no incluidas en este paquete inicial; para intercambio se utilizan GLTF, STL y el formato nativo `.forma3d`.
