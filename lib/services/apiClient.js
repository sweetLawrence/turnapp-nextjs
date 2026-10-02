import axios from 'axios'

const rawEnvUrl =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL
    : undefined

export const API_BASE_URL =
  rawEnvUrl && rawEnvUrl !== 'undefined'
    ? rawEnvUrl
    : 'https://api.turnapp.events/api'

export const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '')

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
}

const handleUnauthorized = error => {
  if (error.response?.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
  return Promise.reject(error)
}

const attachAuthToken = config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
}

export const createApiClient = ({
  baseURL = API_BASE_URL,
  withAuth = true,
  handle401 = true
} = {}) => {
  const instance = axios.create({
    baseURL,
    headers: JSON_HEADERS
  })

  if (withAuth) {
    instance.interceptors.request.use(attachAuthToken, error =>
      Promise.reject(error)
    )
  }

  if (handle401) {
    instance.interceptors.response.use(response => response, handleUnauthorized)
  }

  return instance
}

const api = createApiClient()

export const getAuthHeaders = () => {
  if (typeof window === 'undefined') {
    return { headers: { ...JSON_HEADERS } }
  }
  const token = localStorage.getItem('auth_token')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      ...JSON_HEADERS
    }
  }
}

export default api