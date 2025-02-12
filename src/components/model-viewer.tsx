"use client";

import React from 'react'

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { LoadingOverlay } from '@/components/loading-overlay';

const FBXViewer = dynamic(
  () => import('@/components/fbx-viewer').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <LoadingOverlay />
  }
);

export default function ModelViewer() {
  return (
    <main>
    <Suspense fallback={<LoadingOverlay />}>
      <FBXViewer modelPath={"/models/model0.fbx"} />
    </Suspense>
  </main>
  )
}