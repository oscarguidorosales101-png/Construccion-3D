# Documento de Arquitectura Técnica — FORMA 3D

## 1. Introducción y Paradigma de Diseño

FORMA 3D está concebida bajo el principio de **desacoplamiento estricto** entre:
1. **Lógica de Definición Paramétrica** (Model Data): Declaración abstracta de parámetros, dimensiones y dependencias independientes de Three.js.
2. **Motor de Renderizado Tridimensional** (Scene Graph): Mallas Three.js procedurales calculadas a partir de las definiciones paramétricas.
3. **Persistencia y Serialización** (Store & Services): Almacenamiento local resiliente y sincronización remota protegida con RLS en Supabase.
4. **Capa Visual e Interfaz de Usuario** (React + CSS Modular): Paneles desacoplados con inspección bidireccional.

```mermaid
graph TD
    A[Usuario / Editor UI] -->|Modifica Parámetro| B[CADSceneState]
    B -->|Registra en| C[HistoryManager (Undo/Redo)]
    B -->|Invoca| D[Procedural Generators]
    D -->|BufferGeometry| E[Three.js Scene Graph]
    B -->|Auto-guardado| F[ProjectService]
    F -->|Caché Inmediata| G[LocalStorage / IndexedDB]
    F -->|Sync Remoto RLS| H[Supabase PostgreSQL]
```

---

## 2. Motor Geométrico Paramétrico

A diferencia de los visores 3D convencionales que escalan objetos mediante matrices de transformación `scale`, FORMA 3D **reconstruye la topología de la malla** en cada alteración de parámetro:

- **Placas cilíndricas curvadas (`createCurvedPlateGeometry`):**
  Extruye un `THREE.Shape` a lo largo del radio medio del tanque considerando el arco angular $\theta = \frac{2\pi}{N_{placas}}$, el espesor radial de chapa $t$ y la altura de la virola $h$. El desfase de juntas en cursos alternos se calcula como $\phi_{offset} = (c \pmod 2) \cdot \frac{\theta}{2}$.
- **Fondo anular (`createAnnularRingGeometry`):**
  Genera la corona anular con su radio interior y el ala perimetral exterior que sobresale de la pared del manto cilíndrico.
- **Escalera Helicoidal:**
  Calcula paso a paso las coordenadas polares $(R_{stair}, \theta(s), Y(s))$ distribuyendo peldaños de dimensiones estandarizadas y barandillas superiores.
- **Boquillas y Bridas:**
  Genera el cuello cilíndrico de penetración con brida de cuello para soldar orientada de forma normal a la superficie cilíndrica según la elevación y el acimut.

---

## 3. Sistema de Materiales y Telemetría

Cada material CAD define:
- Parámetros ópticos PBR (`roughness`, `metalness`, `opacity`, `transparent`).
- Densidad volumétrica física ($\rho$ en $kg/m^3$).

El módulo `EngineeringMetrics` calcula:
$$V = f(\text{geometría})$$
$$M = V \times \rho$$
$$A = \text{Área superficial de desarrollo de chapa}$$

Esto permite que un diseñador modifique el espesor de 8 mm a 12 mm o cambie de Acero al Carbono (7,850 $kg/m^3$) a Aluminio (2,700 $kg/m^3$) y observe inmediatamente el impacto en el tonelaje del equipo.

---

## 4. Persistencia y Seguridad

- **Modo Local:** Guarda estados completos en `localStorage` con clave `forma3d_projects_v1`.
- **Modo Remoto (Supabase):** Guarda en la tabla `projects` utilizando JSONB para soportar estructuras de ensamble complejas y consultas indexadas por `user_id`.
- **Aislamiento RLS:** Nadie puede leer ni modificar proyectos de otro usuario; el token JWT del usuario inyectado en el cliente garantiza que `auth.uid() = user_id`.
