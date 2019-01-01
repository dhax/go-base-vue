import ApiService from './api.service'

class AccountError extends Error {
  constructor(errorCode, message, errorFields) {
    super(message)
    this.name = this.constructor.name
    this.errorCode = errorCode
    this.message = message
    this.fields = errorFields
  }
}

const AccountService = {
  getAccount: async function() {
    try {
      const response = await ApiService.get('/api/account')
      return response.data
    } catch (e) {
      throw new AccountError(e.response.status, e.response.data.error)
    }
  },

  updateAccount: async function(account) {
    try {
      const response = await ApiService.put('/api/account', account)
      return response.data
    } catch (e) {
      throw new AccountError(
        e.response.status,
        e.response.data.error,
        e.response.data.errors
      )
    }
  },

  deleteAccount: async function() {
    try {
      const response = await ApiService.delete('/api/account')
      return response.data
    } catch (e) {
      throw new AccountError(e.response.status, e.response.data.error)
    }
  },

  // JWT Token
  updateToken: async function(token) {
    try {
      const response = await ApiService.put(
        `/api/account/token/${token.id}`,
        token
      )
      return response.data
    } catch (e) {
      throw new AccountError(e.response.status, e.response.data.error)
    }
  },

  deleteToken: async function(id) {
    try {
      const response = await ApiService.delete(`/api/account/token/${id}`)
      return response.data
    } catch (e) {
      throw new AccountError(e.response.status, e.response.data.error)
    }
  }
}

export default AccountService

export { AccountService, AccountError }
