export default function Photo({
  src,
  widths,
  ratio,
  sizes,
  alt,
  isLazy = false,
  className,
}: {
  src: string
  widths: number[]
  ratio: number
  sizes: string
  alt: string
  isLazy?: boolean
  className?: string
}) {
  const width = Math.max(...widths)
  const sourceSet = (format: string) =>
    widths.map((size) => `${src}-${size}.${format} ${size}w`).join(', ')

  return (
    <picture className="contents">
      <source type="image/avif" srcSet={sourceSet('avif')} sizes={sizes} />
      <img
        src={`${src}-${widths[0]}.jpg`}
        srcSet={sourceSet('jpg')}
        sizes={sizes}
        width={width}
        height={Math.round(width / ratio)}
        alt={alt}
        loading={isLazy ? 'lazy' : 'eager'}
        decoding="async"
        draggable={false}
        className={className}
      />
    </picture>
  )
}
