"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Bounds, Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Group, Mesh, Object3D } from "three";
import { LoadingOverlay } from "@/components/loading-overlay";
import { extend } from "@react-three/fiber";
import { FBXLoader } from "three-stdlib";
extend({ OrbitControls });

interface FBXViewerProps {
  modelPath: string;
}

function useModelLoader(modelPath: string) {
  const isGLB = modelPath.toLowerCase().endsWith('.glb');
  const gltf = useGLTF(modelPath)
  
  const fbxModel = useLoader(FBXLoader, modelPath) as Group | { scene: Group };
  
  if(isGLB) {
    return gltf.scene
  }
  // if (isGLB && 'scene' in model) {
  // }
  
  return fbxModel as Group;
}

function FBXModel({ modelPath }: { modelPath: string }) {
  const model = useModelLoader(modelPath);
  const { scene } = useThree();

  const clonedModel = useMemo(() => {
    const cloned = model.clone();

    // const box = new Box3().setFromObject(model);
    // const center = new Vector3();
    // box.getCenter(center);
    // model.position.sub(center);

    cloned.traverse((child: Object3D) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.transparent = false;
        child.material.opacity = 1;
        // Ensure materials are properly lit
        child.material.needsUpdate = true;
      }
    });

    return cloned;
  }, [model]);

  useEffect(() => {
    return () => {
      scene.remove(clonedModel);
      clonedModel.traverse((child: Object3D) => {
        if (child instanceof Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
    };
  }, [clonedModel, scene]);

  return <primitive object={clonedModel} />;
}

export default function ModelViewerWrapper({ modelPath }: FBXViewerProps) {
  return (
    <div className="h-screen w-full bg-white">
      <Canvas
        shadows
        camera={{ position: [0, 0, 1], fov: 25,  near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Environment preset="warehouse" />
        {/* Increased ambient light for better overall illumination */}
        <ambientLight intensity={0.5} />
        
        {/* Adjusted point light for better highlights */}
        <pointLight position={[10, 10, 10]} intensity={1000} />
        
        {/* Added more directional lights for better coverage */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* <Html> */}
        <Bounds fit clip margin={0.5}>
          <Suspense fallback={null}>
          <Center>
            <FBXModel modelPath={modelPath} />
            </Center>
          </Suspense>
        </Bounds>
        {/* </Html> */}

        <OrbitControls
          target={[0, 0, 0]}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={20}
        />
      </Canvas>
      <Suspense fallback={<LoadingOverlay />}>
        <div /> {/* Empty suspense fallback */}
      </Suspense>
    </div>
  );
}
