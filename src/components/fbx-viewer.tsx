"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Bounds, Center, OrbitControls } from "@react-three/drei";
import { Group, Mesh, Object3D } from "three";
import { LoadingOverlay } from "@/components/loading-overlay";
import { extend } from "@react-three/fiber";
import { FBXLoader } from "three-stdlib";
extend({ OrbitControls });

interface FBXViewerProps {
  modelPath: string;
}

function FBXModel({ modelPath }: { modelPath: string }) {
  const fbx = useLoader(FBXLoader, modelPath) as Group;
  const { scene } = useThree();

  const clonedModel = useMemo(() => {
    const model = fbx.clone();

    // const box = new Box3().setFromObject(model);
    // const center = new Vector3();
    // box.getCenter(center);
    // model.position.sub(center);

    model.traverse((child: Object3D) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.transparent = false;
        child.material.opacity = 1;
      }
    });

    return model;
  }, [fbx]);

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

export default function FBXViewer({ modelPath }: FBXViewerProps) {
  return (
    <div className="h-screen w-full bg-black">
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1000} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* <Html> */}
        <Bounds fit clip margin={4}>
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
          minDistance={1}
          maxDistance={20}
        />
      </Canvas>
      <Suspense fallback={<LoadingOverlay />}>
        <div /> {/* Empty suspense fallback */}
      </Suspense>
    </div>
  );
}
