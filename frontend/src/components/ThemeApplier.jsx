import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FONT_FAMILIES, FONT_SIZES } from '../store/slices/settingsSlice'

function ThemeApplier() {
  const { darkMode, fontFamily, fontSize } = useSelector((state) => state.settings ?? {})

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', darkMode)

    const family = FONT_FAMILIES[fontFamily]?.value || FONT_FAMILIES.inter.value
    const size = FONT_SIZES[fontSize]?.base || FONT_SIZES.medium.base

    root.style.setProperty('--font-family', family)
    root.style.setProperty('--font-size-base', size)
    document.body.style.fontFamily = family
    document.body.style.fontSize = size
  }, [darkMode, fontFamily, fontSize])

  return null
}

export default ThemeApplier
