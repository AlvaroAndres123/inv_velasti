import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useEffect, useState } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para formatear fechas en formato amigable
export function formatearFecha(fecha: string | Date): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  // Verificar si la fecha es válida
  if (isNaN(fechaObj.getTime())) {
    return 'Fecha inválida';
  }

  // Formato: "26 de Junio, 2025 - 14:30"
  const opciones: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  return fechaObj.toLocaleDateString('es-ES', opciones);
}

// Función para formatear solo la fecha (sin hora)
export function formatearSoloFecha(fecha: string | Date): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  if (isNaN(fechaObj.getTime())) {
    return 'Fecha inválida';
  }

  // Formato: "26 de Junio, 2025"
  const opciones: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };

  return fechaObj.toLocaleDateString('es-ES', opciones);
}

// Función para formatear fecha corta
export function formatearFechaCorta(fecha: string | Date): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  if (isNaN(fechaObj.getTime())) {
    return 'Fecha inválida';
  }

  // Formato: "26/06/2025"
  const opciones: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };

  return fechaObj.toLocaleDateString('es-ES', opciones);
}

// Función para obtener fecha relativa (hace X tiempo)
export function fechaRelativa(fecha: string | Date): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const ahora = new Date();
  const diferencia = ahora.getTime() - fechaObj.getTime();
  
  if (isNaN(fechaObj.getTime())) {
    return 'Fecha inválida';
  }

  const minutos = Math.floor(diferencia / (1000 * 60));
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

  if (minutos < 1) {
    return 'Hace un momento';
  } else if (minutos < 60) {
    return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  } else if (horas < 24) {
    return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
  } else if (dias < 7) {
    return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  } else {
    return formatearSoloFecha(fechaObj);
  }
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}
