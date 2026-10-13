# FORMA 3D — Plataforma Web CAD/BIM Paramétrica, Documentación Técnica y Exportación Profesional

Plataforma web avanzada e independiente de modelado 3D CAD/BIM paramétrico, generación automática de documentación técnica (plantas, secciones, fachadas, cuadros de superficies y láminas de entrega) y exportación profesional multi-formato (`.forma3d`, `GLB`, `STL`, `DXF`, `PDF`, `IFC`).

Desarrollada con **React 19**, **TypeScript**, **Vite 8**, **Three.js**, **jsPDF** y un backend local desacoplado persistido en `db.json` con soporte opcional para **Supabase**.

---

## 1. Visión General y Arquitectura

FORMA 3D respeta la separación estricta de responsabilidades:
- **BIM & Model Data (`src/types/bim.ts`, `src/types/cad.ts`):** Definición paramétrica de objetos arquitectónicos (niveles, losas, muros, columnas, aberturas, cotas) y ensamblajes industriales independiente del motor gráfico. El modelo de datos es la única fuente de verdad.
- **Procedural Generators (`src/engine3d/bim/`, `src/engine3d/parametric/`):** Algoritmos que construyen la geometría analítica a partir de parámetros dimensionales reales (sin deformar mallas con `scale`).
- **Scene Graph Three.js (`src/components/cad/CADCanvas.tsx`):** Renderizado en tiempo real con sombreado de aristas técnicas, iluminación de estudio y gizmos de manipulación.
- **Motor de Documentación 2D (`src/engine3d/bim/documentationEngine.ts`):** Proyección ortogonal y planos de corte (corte horizontal a 1,20 m, secciones transversales, alzados) y cálculo de cuadros de superficies, materiales y carpinterías.
- **Centro de Láminas (`src/components/bim/documentation/DocumentationModal.tsx`):** Composición de planos en hojas A0, A1, A2, A3 y A4 con cajetín técnico, escalas normalizadas (1:100, 1:200, 1:50) y notas de proyecto.
- **Centro de Exportación:** Serializadores especializados e independientes para cada estándar de la industria.
- **Backend Local (`server/server.js` & `server/db.json`):** Servidor HTTP REST con autenticación basada en sesiones, hashing criptográfico de contraseñas (SHA-256 + salt) y aislamiento estricto de proyectos por usuario.

---

## 2. Puesta en Marcha Rápida

### Requisitos:
- Node.js versión `>= 18.0.0` (recomendado Node 20 o superior).
- Gestor de paquetes `npm`.

### 1. Instalación de dependencias:
```bash
npm install
```

### 2. Ejecutar el Servidor Backend Local (Persistencia y Autenticación con `db.json`):
En una primera terminal:
```bash
npm run server
```
*El servidor iniciará en `http://localhost:3001` conectado a `server/db.json`.*

### 3. Ejecutar la Aplicación Web (Frontend Vite):
En una segunda terminal:
```bash
npm run dev
```
*Abre tu navegador en `http://127.0.0.1:5173/`.*

### 4. Compilación y Validación de Tipos para Producción:
```bash
npm run build
```

---

## 3. Plantilla Emblemática: Torre de Oficinas Corporativa (30 Pisos)

Al iniciar la plataforma, FORMA 3D carga automáticamente el modelo paramétrico de demostración técnica:
- **30 niveles** con altura entre pisos de **3,60 m** (altura total sobre rasante: **108,00 m**).
- **Planta de referencia:** 36,00 m de ancho $\times$ 30,00 m de fondo (**1.080 m² brutos por nivel**, 32.400 m² construidos totales).
- **Núcleo central:** Muros de hormigón armado de 12,00 $\times$ 10,00 m que albergan la batería de ascensores, escaleras de evacuación presurizadas y montantes técnicos.
- **Retícula estructural:** Modulación de pórticos cada **6,00 m** con columnas de hormigón de $80 \times 80\text{ cm}$ en niveles inferiores, adaptándose progresivamente en altura.
- **Losas de entrepiso:** Hormigón armado de 35 cm de espesor con hueco central coordinado para el núcleo.
- **Fachada continua:** Muro cortina de vidrio templado reflectivo con montantes de aluminio anodizado.
- **Podio de acceso:** Vestíbulo de doble altura con marquesina perimetral en voladizo (4,00 m de proyección).
- **Cubierta técnica:** Parapeto perimetral de seguridad y sala de máquinas de ascensores / climatización.

> **Aviso Técnico:** Este modelo es de carácter conceptual y demostrativo de las capacidades CAD/BIM de la plataforma, no apto para construcción sin validación y cálculo de ingeniería profesional colegiada.

---

## 4. Documentación Técnica Automática Generada

Desde el botón **"Planos & Láminas"** de la barra superior o la pestaña **"Torre BIM"** del panel izquierdo, se accede al visor de documentación:

1. **Plantas Arquitectónicas:**
   - *Planta de Acceso / Nivel 01 (Cota +0.00 m):* Podio, marquesina, atrio principal y control de accesos.
   - *Planta Tipo Oficinas (Pisos 03 al 30):* Plano de corte horizontal a 1,20 m sobre nivel de losa. Muestra delimitación de muros exteriores, núcleo, retícula de columnas, puertas de núcleo y cotas asociativas perimetrales.
   - *Planta de Cubierta Técnica (+108.00 m):* Zonas de mantenimiento, pretil y casetón de maquinaria.
2. **Secciones Verticales:**
   - *Sección Transversal A-A':* Corte vertical ortogonal a través del núcleo que evidencia las 30 losas, alturas de entrepiso y continuidad estructural.
3. **Alzados y Fachadas:**
   - Elevación Principal (Norte), Posterior (Sur), Lateral Este y Lateral Oeste con cotas de nivel y modulación de carpintería.
4. **Cotas Asociativas:**
   - Cotas horizontales, verticales y de nivel vinculadas a la geometría; cualquier ajuste en la modulación o altura de plantas actualiza reactivamente los planos.
5. **Cuadros y Memorias Técnicas:**
   - **Cuadro de Superficies:** 32.400 m² brutos construidos, 27.660 m² de superficie útil alquilable y 85,4% de eficiencia espacial media.
   - **Medición de Materiales:** 14.894 m³ de hormigón estructural estimado (~37.235 toneladas), acero corrugado de refuerzo y 14.256 m² de muro cortina.
   - **Inventario de Carpinterías:** Registro categorizado de puertas dobles de acceso, puertas cortafuegos RF-60 de núcleo y módulos de fachada.

---

## 5. Centro de Láminas (Hojas de Documentación)

Permite configurar planos de entrega profesional:
- **Formatos de papel normalizados:** A0 (1189 $\times$ 841 mm), A1 (841 $\times$ 594 mm), A2, A3 y A4.
- **Orientación:** Horizontal (Landscape) o Vertical (Portrait).
- **Cajetín de Ingeniería:** Nombre de proyecto, empresa, autor, fecha, número de plano (p. ej. `ARQ-01`, `ARQ-02`), revisión y escala asignada por vista (1:100, 1:200, 1:50).
- **Notas Generales y Cuadros:** Incorporación directa de especificaciones constructivas y leyendas normativas.

---

## 6. Formatos de Exportación Implementados y Probados

Cada formato cuenta con su propio exportador analítico probado:

| Formato | Tipo | Alcance e Integración |
|---|---|---|
| **`.forma3d`** | Nativo JSON | Guarda la totalidad del proyecto editable: geometría, jerarquía, parámetros BIM, vistas 2D, láminas, cámaras, materiales y metadatos. Permite guardar, cerrar y reabrir sin perder parametrización. |
| **`GLB`** | glTF 2.0 Binario | Escena 3D optimizada para intercambio con Blender, Unreal Engine, visualizadores web y WebGL. |
| **`STL`** | Malla Triangulada | Exportación adecuada para impresión 3D aditiva y prototipado rápido físico. |
| **`DXF`** | Vectorial 2D (ASCII R12/2000) | Planos 2D genuinos organizados en capas estándar AIA (`A-WALL-EXTR`, `A-WALL-CORE`, `A-COLS`, `A-GLAZ`, `A-GRID`, `A-ANNO-DIMS`, `A-TITL`), listos para abrir en AutoCAD, LibreCAD o DraftSight. |
| **`PDF`** | Vectorial de Impresión | Láminas completas a escala con recuadro perimetral, cajetín técnico, textos legibles, cotas y notas de proyecto generadas con `jspdf`. |
| **`IFC`** | Open BIM (IFC2X3) | Archivo físico conforme a la norma ISO 10303-21 STEP con jerarquía espacial (`IfcProject` $\rightarrow$ `IfcSite` $\rightarrow$ `IfcBuilding` $\rightarrow$ `IfcBuildingStorey`) y elementos semánticos (`IfcSlab`, `IfcColumn`, `IfcWallStandardCase`). Compatible con Solibri, BIM Vision, Revit y Blender BIM. |

---

## 7. Base de Datos Local con `db.json` y Autenticación Segura

El backend desacoplado (`server/server.js`) implementa:
- **Persistencia en `server/db.json`:** Colecciones para `users`, `projects`, `sessions`, `documents`, `exports` y `settings`.
- **Criptografía de Contraseñas:** Hashing con **SHA-256** combinando una **sal criptográfica aleatoria única por usuario**. En ningún caso se almacenan ni transmiten contraseñas en texto claro.
- **Tokens de Sesión:** Emisión de tokens de sesión con revocación en cierre de sesión (`/api/auth/logout`).
- **Aislamiento Multi-Usuario en Backend:** Cada petición valida el token; los proyectos de un usuario devuelven `403 Forbidden` ante intentos de acceso no autorizado por otros usuarios.
- **Ruta de Migración:** La interfaz de servicios (`src/services/api/localBackendService.ts` y `src/services/supabase/`) permite pasar fluidamente del entorno de desarrollo local con `db.json` a una base de datos PostgreSQL en producción con Supabase RLS.

---

## 8. Atajos de Teclado del Editor

- **Ctrl + Z / Cmd + Z:** Deshacer (Undo)
- **Ctrl + Y / Ctrl + Shift + Z:** Rehacer (Redo)
- **Ctrl + S:** Guardar proyecto
- **Q / W / E / R:** Herramientas de Selección, Mover, Rotar y Escalar
- **G:** Alternar rejilla de trabajo
- **Supr / Backspace:** Eliminar elemento seleccionado
- **Arrastrar Clic Izquierdo:** Orbitar cámara 3D
- **Arrastrar Clic Derecho:** Encuadre (Pan)
- **Rueda del Ratón:** Zoom
