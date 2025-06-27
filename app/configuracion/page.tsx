import { redirect } from 'next/navigation';

export default function ConfiguracionRedirect() {
  redirect('/perfil');
  return null;
} 