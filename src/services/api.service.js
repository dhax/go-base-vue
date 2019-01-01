import axios from 'axios'
import { TokenService } from '../services/storage.service'
import store from '../store'
import { AUTH_INIT, AUTH_REFRESH_REQUEST, AUTH_LOGOUT } from '../store/actions'

const ApiService = {
  init(baseURL) {
    axios.defaults.baseURL = baseURL
    axios.defaults.headers.common = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
    store.dispatch(AUTH_INIT)
  },

  setHeader() {
    axios.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${TokenService.getToken()}`
  },

  setRefreshHeader() {
    axios.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${TokenService.getRefreshToken()}`
  },

  removeHeader() {
    axios.defaults.headers.common = {}
  },

  get(resource, params) {
    return axios.get(resource, { params: params })
  },

  post(resource, data) {
    return axios.post(resource, data)
  },

  put(resource, data) {
    return axios.put(resource, data)
  },

  delete(resource) {
    return axios.delete(resource)
  },

  /**
   * Perform a custom Axios request.
   *
   * data is an object containing the following properties:
   *  - method
   *  - url
   *  - data ... request payload
   *  - auth (optional)
   *    - username
   *    - password
   **/
  customRequest(data) {
    return axios(data)
  },

  // Stores the 401 interceptor position
  _401interceptor: null,

  mount401Interceptor() {
    this._401interceptor = axios.interceptors.response.use(
      response => {
        return response
      },
      async error => {
        if (error.request.status == 401) {
          if (
            error.config.url.includes('/auth/refresh') ||
            error.config.url.includes('/auth/logout')
          ) {
            // Refresh token has failed. Logout the user locally.
            store.dispatch(AUTH_LOGOUT)
            throw error
          } else {
            // Refresh the access token
            try {
              await store.dispatch(AUTH_REFRESH_REQUEST)
              // Retry the original request
              return this.customRequest({
                method: error.config.method,
                url: error.config.url,
                data: error.config.data
              })
            } catch (e) {
              // Refresh has failed - reject the original request
              throw error
            }
          }
        }

        // If error was not 401 just reject as is
        throw error
      }
    )
  },

  unmount401Interceptor() {
    // Eject the interceptor
    axios.interceptors.response.eject(this._401interceptor)
  }
}

export default ApiService
