import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

// Imagen con respaldo: si la URL falla o está vacía se muestra un placeholder.
export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-sand text-ink/30 ${className}`} role="img" aria-label={alt}>
        <ImageOff className="h-10 w-10" />
      </div>
    );
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
