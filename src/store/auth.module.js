import { AuthService, AuthenticationError } from '@/services/auth.service'
import { TokenService } from '@/services/storage.service'
import router from '@/router'

import {
  AUTH_INIT,
  AUTH_TOKEN_REQUEST,
  AUTH_TOKEN_REQUEST_SUCCESS,
  AUTH_LOGIN_REQUEST,
  AUTH_REFRESH_REQUEST,
  AUTH_ERROR,
  AUTH_SUCCESS,
  AUTH_LOGOUT,
  AUTH_LOGOUT_ERROR
} from './actions'

const state = {
  authenticating: false,
  accessToken: TokenService.getToken(),
  refreshToken: TokenService.getRefreshToken(),
  authenticationErrorCode: 0,
  authenticationError: '',
  tokenRequestEmail: '',
  subject: '',
  roles: []
}

const getters = {
  loggedIn: state => (state.accessToken ? true : false),

  subject: state => state.subject,

  roles: state => state.roles,

  hasRole: state => role => state.roles.includes(role),

  authenticationStatus: state =>
    state.tokenRequestEmail ? 'Token sent to ' + state.tokenRequestEmail : '',

  authenticationErrorCode: state => state.authenticationErrorCode,

  authenticationError: state => state.authenticationError,

  authenticating: state => state.authenticating,

  localTokenID: state => decode(state.refreshToken).id
}

const actions = {
  [AUTH_INIT]: ({ commit, state, dispatch }) => {
    console.log('AUTH_INIT')
    if (!state.accessToken || !state.refreshToken) return
    if (!isExpired(state.accessToken)) {
      commit(AUTH_SUCCESS, {
        access_token: state.accessToken,
        refresh_token: state.refreshToken
      })
      return
    }
    if (!isExpired(state.refreshToken)) {
      dispatch(AUTH_REFRESH_REQUEST)
      return
    }
    dispatch(AUTH_LOGOUT)
  },

  async [AUTH_TOKEN_REQUEST]({ commit }, email) {
    commit(AUTH_TOKEN_REQUEST, email)
    try {
      await AuthService.requestEmailToken(email)
      commit(AUTH_TOKEN_REQUEST_SUCCESS, email)
    } catch (e) {
      if (e instanceof AuthenticationError) {
        commit(AUTH_ERROR, {
          errorCode: e.errorCode,
          errorMessage: e.message
        })
      }
      return false
    }
  },

  async [AUTH_LOGIN_REQUEST]({ commit }, token) {
    commit(AUTH_LOGIN_REQUEST)
    try {
      const jwt = await AuthService.requestJWT(token)
      commit(AUTH_SUCCESS, jwt)
      router.push(router.history.current.query.redirect || '/')
    } catch (e) {
      if (e instanceof AuthenticationError) {
        commit(AUTH_ERROR, {
          errorCode: e.errorCode,
          errorMessage: e.message
        })
      }
      return false
    }
  },

  async [AUTH_LOGOUT]({ commit }) {
    console.log('dispatch AUTH_LOGOUT')
    try {
      if (!isExpired(TokenService.getRefreshToken())) {
        // logout remotely with refreshtoken
        await AuthService.logout()
      }
    } catch (e) {
      if (e instanceof AuthenticationError) {
        commit(AUTH_LOGOUT_ERROR, {
          errorCode: e.errorCode,
          errorMessage: e.message
        })
      }
    } finally {
      commit(AUTH_LOGOUT)
      router.push('/')
    }
  },

  [AUTH_REFRESH_REQUEST]({ commit, state }) {
    console.log('dispatch AUTH_REFRESH')
    // If this is the first time the refreshToken has been called, make a request
    // otherwise return the same promise to the caller
    if (!state.refreshTokenPromise) {
      const p = AuthService.refreshToken()
      commit('refreshTokenPromise', p)

      // Wait for the AuthService.refreshToken() to resolve. On success set the token and clear promise. Clear the promise on error as well.
      p.then(
        jwt => {
          commit('refreshTokenPromise', null)
          commit(AUTH_SUCCESS, jwt)
        },
        e => {
          commit('refreshTokenPromise', null)
          commit(AUTH_ERROR, {
            errorCode: e.errorCode,
            errorMessage: e.message
          })
        }
      )
    }

    return state.refreshTokenPromise
  }
}

const mutations = {
  [AUTH_TOKEN_REQUEST]: state => {
    console.log('AUTH_TOKEN_REQUEST')
    state.authenticating = true
    state.authenticationError = ''
    state.authenticationErrorCode = 0
    state.tokenRequestEmail = ''
  },
  [AUTH_TOKEN_REQUEST_SUCCESS]: (state, email) => {
    console.log('AUTH_TOKEN_REQUEST_SUCCESS')
    state.authenticating = false
    state.authenticationError = ''
    state.authenticationErrorCode = 0
    state.tokenRequestEmail = email
  },
  [AUTH_LOGIN_REQUEST]: state => {
    console.log('AUTH_LOGIN_REQUEST')
    state.authenticating = true
    state.authenticationError = ''
    state.authenticationErrorCode = 0
    state.tokenRequestEmail = ''
  },
  [AUTH_SUCCESS]: (state, { access_token, refresh_token }) => {
    console.log('AUTH_SUCCESS')
    state.accessToken = access_token
    state.refreshToken = refresh_token
    state.authenticating = false
    state.authenticationError = ''
    const decoded = decode(access_token)
    state.subject = decoded.sub
    state.roles = decoded.roles
  },
  [AUTH_ERROR]: (state, { errorCode, errorMessage }) => {
    console.log('AUTH_ERROR')
    state.authenticating = false
    state.authenticationErrorCode = errorCode
    state.authenticationError = errorMessage
  },
  [AUTH_LOGOUT]: state => {
    console.log('AUTH_LOGOUT')
    state.authenticationErrorCode = ''
    state.authenticationError = ''
    state.accessToken = ''
    state.refreshToken = ''
    state.subject = ''
    state.roles = []
  },
  [AUTH_LOGOUT_ERROR]: (state, { errorCode, errorMessage }) => {
    console.log('AUTH_LOGOUT_ERROR')
    state.authenticating = false
    state.authenticationErrorCode = errorCode
    state.authenticationError = errorMessage
  },

  refreshTokenPromise(state, promise) {
    state.refreshTokenPromise = promise
  }
}

export default {
  namespaced: false,
  state,
  getters,
  actions,
  mutations
}

// JWT helper
var decode = token => {
  if (!token) return {}
  const parts = token.split('.')
  var encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  switch (encoded.length % 4) {
    case 0:
      break
    case 2:
      encoded += '=='
      break
    case 3:
      encoded += '='
      break
  }
  return JSON.parse(decodeURIComponent(atob(encoded)))
}

var getDeadline = token => {
  const decoded = decode(token)
  if (typeof decoded.exp === 'undefined') return null
  var deadline = new Date(0)
  deadline.setUTCSeconds(decoded.exp)
  return deadline
}

var isExpired = token => {
  const deadline = getDeadline(token)
  if (deadline === null) return true
  const now = new Date()
  return deadline.valueOf() <= now.valueOf()
}
