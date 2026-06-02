import { redirect } from 'next/navigation';

export default function Home() {
  // Immediately redirect to the Generate Labels page
  redirect('/generate');
  return null;
}
