"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Bounds, Center, Environment, OrbitControls } from "@react-three/drei";
import {
  DoubleSide,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  Object3D,
} from "three";
import { LoadingOverlay } from "@/components/loading-overlay";
import { extend } from "@react-three/fiber";
import { FBXLoader } from "three-stdlib";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
extend({ OrbitControls });

interface FBXViewerProps {
  modelPath: string;
}

function useModelLoader(modelPath: string) {
  // const isGLB = modelPath.toLowerCase().endsWith(".glb");
  // const isFBX = modelPath.toLowerCase().endsWith(".fbx");

  // Always call both hooks to maintain consistent hook order
  // const gltf = useGLTF(modelPath);
  const fbxModel = useLoader(FBXLoader, modelPath) as Group;

  return fbxModel;
}

const roseGoldMaterial = new MeshPhysicalMaterial({
  color: "#e7ba9a", // Base rose gold color
  metalness: 0.9, // High metalness for metallic look
  roughness: 0.2, // Slightly polished finish
  clearcoat: 0.8, // Subtle clearcoat for shine
  clearcoatRoughness: 0.2,
  envMapIntensity: 2.0, // Strong environment reflections
  specularIntensity: 1.2,
  reflectivity: 0.8,
  sheen: 0.4, // Warm sheen characteristic of rose gold
  sheenColor: "#ffd8b5", // Subtle pink sheen
  sheenRoughness: 0.4,
  anisotropy: 0.5, // Strong brushed metal effect
  anisotropyRotation: Math.PI / 2, // Rotate the anisotropic highlights
  side: DoubleSide,
});

const diamondMaterial = new MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0.1,
  roughness: 0.01,
  transmission: 0.6,
  ior: 2.418,
  thickness: 2,
  clearcoat: 1,
  clearcoatRoughness: 0.01,
  envMapIntensity: 4.5,
  specularIntensity: 2.5,
  emissive: 0xffffff,
  emissiveIntensity: 0.2,
  reflectivity: 1,
  transparent: true,
  opacity: 0.9,
  depthWrite: true,
  side: DoubleSide,
});

// const roseGoldMaterial = new MeshPhysicalMaterial({
//   color: "#e7ba9a",
//   metalness: 0.98, // Slightly reduced for better color representation
//   roughness: 0.15, // Polished metal finish
//   clearcoat: 1,
//   clearcoatRoughness: 0.05,
//   envMapIntensity: 2.5,
//   specularIntensity: 1.8,
//   sheen: 0.3, // Adds warm sheen characteristic of rose gold
//   sheenColor: "#ffd8b5",
//   sheenRoughness: 0.3,
//   anisotropy: 0.2, // For brushed metal effect
// });

// const diamondMaterial = new MeshPhysicalMaterial({
//   color: 0xffffff,
//   metalness: 0,
//   roughness: 0.05, // Reduced for smoother surface
//   transmission: 0.92, // Better reflection/refraction balance
//   ior: 2.418, // More precise diamond IOR
//   thickness: 0.75, // Increased for better light interaction
//   clearcoat: 1,
//   clearcoatRoughness: 0.03,
//   envMapIntensity: 3.5, // Stronger environment reflections
//   specularIntensity: 2.0,
//   emissive: 0xffffff,
//   emissiveIntensity: 0.15,
//   sheen: 0.1, // Add subtle sheen
//   anisotropy: 0.25, // For diamond crystal structure effect
// });

function FBXModel({ modelPath }: { modelPath: string }) {
  const model = useModelLoader(modelPath);
  const { scene } = useThree();

  const clonedModel = useMemo(() => {
    const cloned = model.clone();

    cloned.traverse((child: Object3D) => {
      if (child instanceof Mesh) {
        console.log(child.name, "child");
        if (
          child.name.toLowerCase().includes("diamond") ||
          child.name === "Object_1" ||
          child.name === "Object_3"
        ) {
          child.material = diamondMaterial;
        } else {
          child.material = roseGoldMaterial;
        }
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.transparent = false;
        child.material.opacity = 1;
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

  return <primitive object={clonedModel} scale={[0.3, 0.3, 0.3]} />;
}

export default function ModelViewerWrapper({ modelPath }: FBXViewerProps) {
  return (
    <div className="h-screen w-full">
      <Canvas
        shadows
        camera={{ position: [0, 0, 10], fov: 25, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Environment files="/scene3.hdr" background blur={0.5} />

        {/* <directionalLight
          position={[5, 5, 5]}
          intensity={2.5}
          color="#ffffff"
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-camera-near={0.1}
          shadow-camera-far={50}
        /> */}
        
        <ambientLight intensity={0.25} color="#ffefe0" />

        <directionalLight
          position={[5, 5, 5]}
          intensity={2.5}
          color="#ffffff"
          castShadow
          shadow-mapSize={4096}
        />

        <directionalLight
          position={[-5, 3, -5]}
          intensity={1.2}
          color="#ffefe0"
          castShadow
        />

        <pointLight position={[2, 5, 2]} intensity={30} color="#ffffff" />
        <pointLight position={[-2, -5, -2]} intensity={30} color="#ffffff" />

        {/* <Html> */}
        <Bounds fit clip margin={1}>
          <Suspense fallback={null}>
            <Center>
              <FBXModel modelPath={modelPath} />
              <EffectComposer>
                <Bloom
                  mipmapBlur
                  luminanceThreshold={0.4}
                  luminanceSmoothing={0.7}
                  intensity={1.5}
                  radius={0.85}
                  levels={8}
                />
              </EffectComposer>
            </Center>
          </Suspense>
        </Bounds>
        {/* </Html> */}
        <OrbitControls
          enableRotate={true}
          enableZoom={true}
          enableDamping
          dampingFactor={0.05}
          enablePan={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          minDistance={1}
          maxDistance={50}
          makeDefault
        />
      </Canvas>
      <Suspense fallback={<LoadingOverlay />}>
        <div /> {/* Empty suspense fallback */}
      </Suspense>
    </div>
  );
}
