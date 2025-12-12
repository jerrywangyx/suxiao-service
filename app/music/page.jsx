import MusicClient from './MusicClient';

export const runtime = 'edge';

export default async function MusicPage({ searchParams }) {
  const params = await searchParams;
  const name = params.name || '';

  return <MusicClient initialName={name} />;
}
