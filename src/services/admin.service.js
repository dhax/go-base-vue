import ApiService from './api.service'

class AdminError extends Error {
  constructor(errorCode, message, errorFields) {
    super(message)
    this.name = this.constructor.name
    this.errorCode = errorCode
    this.message = message
    this.fields = errorFields
  }
}

const AdminService = {
  getAccounts: async function(params) {
    try {
      const response = await ApiService.get('/admin/accounts', params)
      return response.data
    } catch (e) {
      throw new AdminError(e.response.status, e.response.data.error)
    }
  },

  createAccount: async function(account) {
    try {
      const response = await ApiService.post('/admin/accounts', account)
      return response.data
    } catch (e) {
      throw new AdminError(
        e.response.status,
        e.response.data.error,
        e.response.data.errors
      )
    }
  },

  updateAccount: async function(account) {
    try {
      const response = await ApiService.put(
        `/admin/accounts/${account.id}`,
        account
      )
      return response.data
    } catch (e) {
      throw new AdminError(
        e.response.status,
        e.response.data.error,
        e.response.data.errors
      )
    }
  },

  deleteAccount: async function(id) {
    try {
      const response = await ApiService.delete(`/admin/accounts/${id}`)
      return response.data
    } catch (e) {
      throw new AdminError(e.response.status, e.response.data.error)
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
      throw new AdminError(e.response.status, e.response.data.error)
    }
  },

  deleteToken: async function(id) {
    try {
      const response = await ApiService.delete(`/api/account/token/${id}`)
      return response.data
    } catch (e) {
      throw new AdminError(e.response.status, e.response.data.error)
    }
  }
}

export default AdminService

export { AdminService, AdminError }
