import type { AxiosRequestConfig } from "axios"
import axios from "axios"

const instance = axios.create({ baseURL: "/api" })

instance.interceptors.request.use((config) => {
  const initData = window.Telegram.WebApp.initData
  if (initData) config.headers.Authorization = `tma ${initData}`
  return config
})

type ApiError = { status: number | null; message: string }
type Result<T> = { data: T; error: null } | { data: null; error: ApiError }

async function request<T>(config: AxiosRequestConfig): Promise<Result<T>> {
  try {
    const { data } = await instance.request<T>(config)
    return { data, error: null }
  } catch (error) {
    if (!axios.isAxiosError(error)) return { data: null, error: { status: null, message: "Unknown error" } }
    const body = error.response?.data
    const message = typeof body === "string" && body ? body : (body?.message ?? error.message)
    return { data: null, error: { status: error.response?.status ?? null, message } }
  }
}

const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, url, method: "get" }),
  delete: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, url, method: "delete" }),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, url, method: "post", data: body }),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, url, method: "put", data: body }),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, url, method: "patch", data: body })
}

export default api
