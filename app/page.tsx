// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/Loginscreen'); // 👈 redirects to login page first
  return null;
}
