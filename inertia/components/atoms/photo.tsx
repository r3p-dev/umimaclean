// One photo in WebP with a JPEG fallback, at the widths prepared in public/ (`<src>-<width>.<ext>`).
export default function Photo({
  src,
  widths,
  sizes,
  alt,
  isLazy = false,
  className,
}: {
  src: string
  widths: number[]
  sizes: string
  alt: string
  isLazy?: boolean
  className?: string
}) {
  const srcSet = (extension: string) =>
    widths.map((width) => `${src}-${width}.${extension} ${width}w`).join(', ')
  const largest = widths[widths.length - 1]

  return (
    <picture>
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img
        src={`${src}-${largest}.jpg`}
        srcSet={srcSet('jpg')}
        sizes={sizes}
        alt={alt}
        width={largest}
        height={largest}
        loading={isLazy ? 'lazy' : 'eager'}
        decoding="async"
        className={className}
      />
    </picture>
  )
}
