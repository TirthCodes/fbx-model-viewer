"use client";

import React from 'react'

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { LoadingOverlay } from '@/components/loading-overlay';

const ModelViewerWrapper = dynamic(
  () => import('@/components/model-viewer-wrapper').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <LoadingOverlay />
  }
);

export default function ModelViewer() {
  return (
    <main>
    <Suspense fallback={<LoadingOverlay />}>
      <ModelViewerWrapper modelPath={"/models/radhe5.glb"} />
    </Suspense>
  </main>
  )
}