import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { CADObjectNode, RenderShadingMode, TankAssemblyParams } from '../../types/cad';
import { generatePrimitiveGeometry } from '../../engine3d/parametric/primitiveGenerators';
import { generateTankAssembly } from '../../engine3d/parametric/tankGenerator';
import { getCADMaterial } from '../../engine3d/materials/cadMaterials';

interface SceneObjectsProps {
  objects: Record<string, CADObjectNode>;
  rootIds: string[];
  selectedId: string | null;
  shadingMode: RenderShadingMode;
  onSelect: (id: string, e: any) => void;
  onMeshCreated?: (id: string, mesh: THREE.Mesh) => void;
}

export const SceneObjects: React.FC<SceneObjectsProps> = ({
  objects,
  rootIds,
  selectedId,
  shadingMode,
  onSelect,
}) => {
  return (
    <group>
      {rootIds.map((id) => {
        const node = objects[id];
        if (!node || !node.visible) return null;

        if (node.type === 'tank-assembly') {
          return (
            <TankAssemblyRenderer
              key={id}
              node={node}
              allObjects={objects}
              selectedId={selectedId}
              shadingMode={shadingMode}
              onSelect={onSelect}
            />
          );
        }

        return (
          <SingleObjectRenderer
            key={id}
            node={node}
            isSelected={selectedId === id}
            shadingMode={shadingMode}
            onSelect={onSelect}
          />
        );
      })}
    </group>
  );
};

interface SingleObjectRendererProps {
  node: CADObjectNode;
  isSelected: boolean;
  shadingMode: RenderShadingMode;
  onSelect: (id: string, e: any) => void;
}

const SingleObjectRenderer: React.FC<SingleObjectRendererProps> = ({
  node,
  isSelected,
  shadingMode,
  onSelect,
}) => {
  // Generate procedural buffer geometry on parameter change
  const geometry = useMemo(() => {
    return generatePrimitiveGeometry(node.type, node.params);
  }, [node.type, node.params]);

  const matData = getCADMaterial(node.materialId);

  const isWire = shadingMode === 'wireframe';
  const showEdges = shadingMode === 'shaded-wireframe' || isSelected;

  return (
    <group
      position={node.transform.position}
      rotation={node.transform.rotation}
      scale={node.transform.scale}
    >
      <mesh
        geometry={geometry}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id, e);
        }}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : matData.color}
          roughness={matData.roughness}
          metalness={matData.metalness}
          opacity={matData.opacity}
          transparent={matData.transparent}
          wireframe={isWire}
        />
      </mesh>

      {/* Engineering wireframe outline / edges */}
      {showEdges && (
        <lineSegments>
          <edgesGeometry attach="geometry" args={[geometry]} />
          <lineBasicMaterial
            attach="material"
            color={isSelected ? '#f59e0b' : '#38bdf8'}
            linewidth={isSelected ? 2 : 1}
          />
        </lineSegments>
      )}
    </group>
  );
};

interface TankAssemblyRendererProps {
  node: CADObjectNode;
  allObjects: Record<string, CADObjectNode>;
  selectedId: string | null;
  shadingMode: RenderShadingMode;
  onSelect: (id: string, e: any) => void;
}

const TankAssemblyRenderer: React.FC<TankAssemblyRendererProps> = ({
  node,
  allObjects,
  selectedId,
  shadingMode,
  onSelect,
}) => {
  const isAssemblySelected = selectedId === node.id;
  const isWire = shadingMode === 'wireframe';

  // Generate all subcomponent meshes procedurally
  const { meshes } = useMemo(() => {
    return generateTankAssembly(node.id, node.params as TankAssemblyParams, node.materialId);
  }, [node.id, node.params, node.materialId]);

  return (
    <group
      position={node.transform.position}
      rotation={node.transform.rotation}
      scale={node.transform.scale}
    >
      {meshes.map((item) => {
        const subNode = allObjects[item.id];
        // If subNode is explicitly hidden by user in outliner, don't render it
        if (subNode && !subNode.visible) return null;

        const isSubSelected = selectedId === item.id;
        const mat = getCADMaterial(item.materialId || node.materialId);
        const highlight = isSubSelected || isAssemblySelected;

        return (
          <group key={item.id} position={item.position} rotation={item.rotation}>
            <mesh
              geometry={item.geometry}
              onClick={(e) => {
                e.stopPropagation();
                // Select the specific sub-plate / piece, or the assembly if clicked
                onSelect(item.id, e);
              }}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={highlight ? (isSubSelected ? '#f59e0b' : '#38bdf8') : mat.color}
                roughness={mat.roughness}
                metalness={mat.metalness}
                opacity={mat.opacity}
                transparent={mat.transparent}
                wireframe={isWire}
              />
            </mesh>

            {/* Edge highlighting for CAD plate seams */}
            {(shadingMode === 'shaded-wireframe' || highlight) && (
              <lineSegments>
                <edgesGeometry attach="geometry" args={[item.geometry]} />
                <lineBasicMaterial
                  attach="material"
                  color={isSubSelected ? '#f59e0b' : isAssemblySelected ? '#38bdf8' : '#1e293b'}
                  linewidth={1}
                />
              </lineSegments>
            )}
          </group>
        );
      })}
    </group>
  );
};
