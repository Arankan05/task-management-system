export const APP_NAME = 'TASKPULSE'
export const LOGO_SRC = '/taskpulse-logo.png'
export const APP_TAGLINE = 'Track & Achieve — plan, organize, and deliver work with clarity.'
export const SUPPORT_EMAIL = 'taskpulse0@gmail.com'

const SIZES = {
  sm: { box: 'w-8 h-8', text: 'text-base', border: 'border' },
  md: { box: 'w-10 h-10', text: 'text-lg', border: 'border-2' },
  lg: { box: 'w-12 h-12', text: 'text-xl', border: 'border-2' },
  nav: { box: 'w-12 h-12', text: 'text-lg', border: 'border-2' },
}

function BrandLogo({
  size = 'md',
  showName = true,
  className = '',
  nameClassName = '',
  lightText = false,
}) {
  const s = SIZES[size] || SIZES.md

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${s.box} rounded-full overflow-hidden ${s.border} border-primary/30 shrink-0 bg-theme-surface`}>
        <img src={LOGO_SRC} alt={APP_NAME} className="w-full h-full object-cover" />
      </div>
      {showName && (
        <span className={`${s.text} font-bold ${lightText ? 'text-white' : 'text-theme'} ${nameClassName}`}>
          {APP_NAME}
        </span>
      )}
    </div>
  )
}

export default BrandLogo
