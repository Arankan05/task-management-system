import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

let storeRef = null

export function setupApiInterceptors(store) {
  storeRef = store

  api.interceptors.request.use((config) => {
    const token = storeRef?.getState()?.auth?.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && storeRef) {
        storeRef.dispatch({ type: 'auth/logout' })
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    }
  )
}

export default api
