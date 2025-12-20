import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  sizes?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  loading = "lazy",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  ...props
}: OptimizedImageProps) => {
  // Extract filename without extension
  const baseName = src.replace(/\.[^/.]+$/, "");

  return (
    <picture className={cn("block", className)}>
      <source
        srcSet={`${baseName}.webp`}
        type="image/webp"
        sizes={sizes}
      />
      <img
        src={src}
        alt={alt}
        loading={loading}
        sizes={sizes}
        {...props}
      />
    </picture>
  );
};