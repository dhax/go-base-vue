import ApiService from './api.service'

class ProfileError extends Error {
  constructor(errorCode, message, errorFields) {
    super(message)
    this.name = this.constructor.name
    this.message = message
    this.errorCode = errorCode
    this.errorFields = errorFields
  }
}

const UserService = {
  getProfile: async function() {
    try {
      const response = await ApiService.get('/api/profile')

      return response.data
    } catch (e) {
      throw new ProfileError(
        e.response.status,
        e.response.data.error,
        e.response.data.errors
      )
    }
  }
}

export default UserService

export { UserService, ProfileError }
