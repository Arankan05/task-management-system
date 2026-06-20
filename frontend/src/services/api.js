import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let storeRef = null
let refreshPromise = null

const AUTH_SKIP_REFRESH = ['/auth/login', '/auth/logout', '/auth/refresh', '/auth/register']

const shouldSkipRefresh = (url = '') =>
  AUTH_SKIP_REFRESH.some((path) => url.includes(path))

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = api.post('/auth/refresh').finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export function setupApiInterceptors(store) {
  storeRef = store

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      const status = error.response?.status
      const requestUrl = originalRequest?.url || ''

      if (
        status !== 401
        || !originalRequest
        || originalRequest._retry
        || shouldSkipRefresh(requestUrl)
      ) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        await refreshSession()
        return api(originalRequest)
      } catch (refreshError) {
        if (storeRef) {
          storeRef.dispatch({ type: 'auth/logout' })
        }

        const path = window.location.pathname
        if (path !== '/login' && path !== '/') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }
  )
}

export default api
