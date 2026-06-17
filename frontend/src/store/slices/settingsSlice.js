import { createSlice } from '@reduxjs/toolkit'

export const FONT_FAMILIES = {
  inter: { label: 'Inter', value: "'Inter', system-ui, sans-serif" },
  poppins: { label: 'Poppins', value: "'Poppins', system-ui, sans-serif" },
  roboto: { label: 'Roboto', value: "'Roboto', system-ui, sans-serif" },
  system: { label: 'System UI', value: "system-ui, -apple-system, sans-serif" },
}

export const FONT_SIZES = {
  small: { label: 'Small', base: '14px' },
  medium: { label: 'Medium', base: '16px' },
  large: { label: 'Large', base: '18px' },
}

const initialState = {
  darkMode: false,
  fontFamily: 'inter',
  fontSize: 'medium',
  notificationsEnabled: true,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDarkMode: (state, action) => {
      state.darkMode = action.payload
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
    },
    setFontFamily: (state, action) => {
      state.fontFamily = action.payload
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload
    },
    setNotificationsEnabled: (state, action) => {
      state.notificationsEnabled = action.payload
    },
    restoreSettings: (state, action) => {
      Object.assign(state, { ...initialState, ...action.payload })
    },
  },
})

export const {
  setDarkMode,
  toggleDarkMode,
  setFontFamily,
  setFontSize,
  setNotificationsEnabled,
  restoreSettings,
} = settingsSlice.actions

export default settingsSlice.reducer
