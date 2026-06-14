/**
 * Redux-persist storage adapter for Vite/ESM.
 * Avoids broken default import from redux-persist/lib/storage in Vite.
 */
const storage = {
  getItem(key) {
    return Promise.resolve(localStorage.getItem(key))
  },
  setItem(key, value) {
    return Promise.resolve(localStorage.setItem(key, value))
  },
  removeItem(key) {
    return Promise.resolve(localStorage.removeItem(key))
  },
}

export default storage
