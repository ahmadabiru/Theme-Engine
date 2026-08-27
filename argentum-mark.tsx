export function ArgentumMark({
  size = 40,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      role="img"
      aria-label="Argentum emblem"
      className={className}
      style={{
        display: 'block',
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        maskImage: 'url(/argentum-emblem.png)',
        WebkitMaskImage: 'url(/argentum-emblem.png)',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
      }}
    />
  )
}
