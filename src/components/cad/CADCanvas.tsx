import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  TransformControls,
  Grid,
  GizmoHelper,
  GizmoViewport,
} from '@react-three/drei';
import * as THREE from 'three';
import type {
  CADObjectNode,
  CADTransform,
  RenderShadingMode,
  TransformMode,
  ViewOrientation,
} from '../../types/cad';
import { SceneObjects } from './SceneObjects';
import { CAMERA_PRESETS } from '../../engine3d/camera/viewpoints';

interface CADCanvasProps {
  objects: Record<string, CADObjectNode>;
  rootIds: string[];
  selectedId: string | null;
  transformMode: TransformMode;
  snapToGrid: boolean;
  gridSnapSize: number;
  angleSnapDeg: number;
  viewOrientation: ViewOrientation;
  shadingMode: RenderShadingMode;
  showGrid: boolean;
  showAxes: boolean;
  onSelect: (id: string | null) => void;
  onChangeTransform: (id: string, newTransform: CADTransform) => void;
  onSceneReady?: (scene: THREE.Scene) => void;
}

export const CADCanvas: React.FC<CADCanvasProps> = ({
  objects,
  rootIds,
  selectedId,
  transformMode,
  snapToGrid,
  gridSnapSize,
  angleSnapDeg,
  viewOrientation,
  shadingMode,
  showGrid,
  showAxes,
  onSelect,
  onChangeTransform,
  onSceneReady,
}) => {
  const [isGizmoDragging, setIsGizmoDragging] = useState(false);

  // Determine which node is being transformed
  // If selectedId is a subcomponent, transform its root parent or standalone node
  const selectedNode = selectedId ? objects[selectedId] : null;
  const transformTargetId = selectedNode?.parentId && objects[selectedNode.parentId]?.type === 'tank-assembly'
    ? selectedNode.parentId
    : selectedId;
  const targetNode = transformTargetId ? objects[transformTargetId] : null;

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        position: 'relative',
        backgroundColor: '#090b0e',
        overflow: 'hidden',
      }}
      onClick={(e) => {
        // Deselect if clicking directly on canvas background
        if (e.target === e.currentTarget) {
          onSelect(null);
        }
      }}
    >
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        camera={{ position: [14, 11, 16], fov: 45, near: 0.1, far: 1000 }}
        style={{ width: '100%', height: '100%' }}
        onPointerDown={(e) => {
          if (e.target === (e.currentTarget as any)) {
            onSelect(null);
          }
        }}
      >
        <color attach="background" args={['#090b0e']} />

        {/* Studio Lighting */}
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[20, 30, 20]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-20, 15, -20]} intensity={0.4} />
        <directionalLight position={[0, -10, 0]} intensity={0.2} />

        {/* Engineering Floor Grid */}
        {showGrid && (
          <Grid
            position={[0, -0.001, 0]}
            args={[60, 60]}
            cellSize={1}
            cellThickness={0.6}
            cellColor="#1a2333"
            sectionSize={5}
            sectionThickness={1.2}
            sectionColor="#2563eb"
            fadeDistance={75}
            fadeStrength={1.5}
          />
        )}

        {/* Scene Objects */}
        <SceneObjects
          objects={objects}
          rootIds={rootIds}
          selectedId={selectedId}
          shadingMode={shadingMode}
          onSelect={(id) => onSelect(id)}
        />

        {/* Transform Controls (Translate / Rotate / Scale Gizmo) */}
        {targetNode && !targetNode.locked && transformMode !== 'select' && (
          <TransformControlsHandler
            targetNode={targetNode}
            mode={transformMode}
            snapToGrid={snapToGrid}
            gridSnapSize={gridSnapSize}
            angleSnapDeg={angleSnapDeg}
            onDragStart={() => setIsGizmoDragging(true)}
            onDragEnd={() => setIsGizmoDragging(false)}
            onChangeTransform={(newTransform) => onChangeTransform(targetNode.id, newTransform)}
          />
        )}

        {/* Camera viewpoint synchronization */}
        <CameraController viewOrientation={viewOrientation} />

        {/* Orbit Controls (smooth CAD camera) */}
        <OrbitControls
          makeDefault
          enabled={!isGizmoDragging}
          enableDamping
          dampingFactor={0.06}
          minDistance={1}
          maxDistance={300}
          target={[0, 3, 0]}
        />

        {/* Viewport Gizmo (XYZ Axes in corner) */}
        {showAxes && (
          <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
            <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="#ffffff" />
          </GizmoHelper>
        )}

        {/* Scene Export Capture Hook */}
        <SceneReporter onSceneReady={onSceneReady} />
      </Canvas>
    </div>
  );
};

/**
 * Handles camera view orientation updates
 */
function CameraController({ viewOrientation }: { viewOrientation: ViewOrientation }) {
  const { camera } = useThree();

  useEffect(() => {
    const preset = CAMERA_PRESETS[viewOrientation];
    if (preset) {
      camera.position.set(...preset.position);
      camera.lookAt(...preset.target);
      camera.updateProjectionMatrix();
    }
  }, [viewOrientation, camera]);

  return null;
}

/**
 * Captures root THREE.Scene reference for exports
 */
function SceneReporter({ onSceneReady }: { onSceneReady?: (scene: THREE.Scene) => void }) {
  const { scene } = useThree();

  useEffect(() => {
    if (onSceneReady) {
      onSceneReady(scene);
    }
  }, [scene, onSceneReady]);

  return null;
}

/**
 * Interactive TransformControls handler with snap logic
 */
interface TransformControlsHandlerProps {
  targetNode: CADObjectNode;
  mode: 'translate' | 'rotate' | 'scale';
  snapToGrid: boolean;
  gridSnapSize: number;
  angleSnapDeg: number;
  onDragStart: () => void;
  onDragEnd: () => void;
  onChangeTransform: (newTransform: CADTransform) => void;
}

function TransformControlsHandler({
  targetNode,
  mode,
  snapToGrid,
  gridSnapSize,
  angleSnapDeg,
  onDragStart,
  onDragEnd,
  onChangeTransform,
}: TransformControlsHandlerProps) {
  const transformRef = useRef<any>(null);
  const targetGroupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (targetGroupRef.current) {
      targetGroupRef.current.position.set(...targetNode.transform.position);
      targetGroupRef.current.rotation.set(...targetNode.transform.rotation);
      targetGroupRef.current.scale.set(...targetNode.transform.scale);
    }
  }, [targetNode.transform]);

  useEffect(() => {
    const controls = transformRef.current;
    if (!controls) return;

    const handleDraggingChanged = (e: any) => {
      if (e.value) {
        onDragStart();
      } else {
        onDragEnd();
        // Update state on drag finish
        if (targetGroupRef.current) {
          const pos: [number, number, number] = [
            Math.round(targetGroupRef.current.position.x * 100) / 100,
            Math.round(targetGroupRef.current.position.y * 100) / 100,
            Math.round(targetGroupRef.current.position.z * 100) / 100,
          ];
          const rot: [number, number, number] = [
            Math.round(targetGroupRef.current.rotation.x * 100) / 100,
            Math.round(targetGroupRef.current.rotation.y * 100) / 100,
            Math.round(targetGroupRef.current.rotation.z * 100) / 100,
          ];
          const scl: [number, number, number] = [
            Math.round(targetGroupRef.current.scale.x * 100) / 100,
            Math.round(targetGroupRef.current.scale.y * 100) / 100,
            Math.round(targetGroupRef.current.scale.z * 100) / 100,
          ];
          onChangeTransform({ position: pos, rotation: rot, scale: scl });
        }
      }
    };

    controls.addEventListener('dragging-changed', handleDraggingChanged);
    return () => {
      controls.removeEventListener('dragging-changed', handleDraggingChanged);
    };
  }, [onChangeTransform, onDragStart, onDragEnd]);

  // Snapping values
  const translationSnap = snapToGrid ? (gridSnapSize || 0.25) : null;
  const rotationSnap = snapToGrid ? (angleSnapDeg * Math.PI) / 180 : null;

  return (
    <>
      <group ref={targetGroupRef} />
      {targetGroupRef.current && (
        <TransformControls
          ref={transformRef}
          object={targetGroupRef.current}
          mode={mode}
          size={0.75}
          translationSnap={translationSnap}
          rotationSnap={rotationSnap}
        />
      )}
    </>
  );
}
