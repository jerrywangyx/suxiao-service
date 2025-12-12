'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MusicClient from './MusicClient';

function MusicPageContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || '';

  return <MusicClient initialName={name} />;
}

export default function MusicPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <MusicPageContent />
    </Suspense>
  );
}
