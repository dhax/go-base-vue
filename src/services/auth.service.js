import ApiService from './api.service'
import { TokenService } from './storage.service'

class AuthenticationError extends Error {
  constructor(errorCode, message) {
    super(message)
    this.name = this.constructor.name
    this.message = message
    this.errorCode = errorCode
  }
}

const AuthService = {
  requestEmailToken: async function (email) {
    const requestData = {
      method: 'post',
      url: 'auth/login',
      data: {
        grant_type: 'email',
        email: email
      }
    }

    try {
      const response = await ApiService.customRequest(requestData)
      // Only for Demo purpose receive and print login token to console
      console.log(response.data)
      return response.data
    } catch (e) {
      throw new AuthenticationError(e.response.status, e.response.data.error)
    }
  },

  requestJWT: async function (token) {
    const requestData = {
      method: 'post',
      url: 'auth/token',
      data: {
        grant_type: 'token',
        token: token
      }
    }

    try {
      const response = await ApiService.customRequest(requestData)

      TokenService.saveToken(response.data.access_token)
      TokenService.saveRefreshToken(response.data.refresh_token)

      ApiService.setHeader()
      ApiService.mount401Interceptor()

      return response.data
    } catch (e) {
      throw new AuthenticationError(e.response.status, e.response.data.error)
    }
  },

  refreshToken: async function () {
    const requestData = {
      method: 'post',
      url: 'auth/refresh',
      data: {
        grant_type: 'refresh'
      }
    }

    try {
      ApiService.setRefreshHeader()
      const response = await ApiService.customRequest(requestData)

      TokenService.saveToken(response.data.access_token)
      TokenService.saveRefreshToken(response.data.refresh_token)
      ApiService.setHeader()

      return response.data
    } catch (e) {
      throw new AuthenticationError(e.response.status, e.response.data.error)
    }
  },

  logout: async function () {
    try {
      const requestData = {
        method: 'post',
        url: 'auth/logout',
        headers: {
          Authorization: `Bearer ${TokenService.getRefreshToken()}`
        }
      }
      ApiService.setRefreshHeader()
      await ApiService.customRequest(requestData)
    } catch (e) {
      throw new AuthenticationError(e.response.status, e.response.data.error)
    } finally {
      ApiService.unmount401Interceptor()
      ApiService.removeHeader()
      TokenService.removeToken()
      TokenService.removeRefreshToken()
    }
  }
}

export default AuthService

export { AuthService, AuthenticationError }
