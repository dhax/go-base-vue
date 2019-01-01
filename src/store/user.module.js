import { UserService, ProfileError } from '@/services/profile.service'
import { USER_REQUEST, USER_ERROR, USER_SUCCESS } from './actions'

const state = { status: '', profile: {} }

const getters = {
  getProfile: state => state.profile,
  isProfileLoaded: state => !!state.profile
}

const actions = {
  async [USER_REQUEST]({ commit }) {
    console.log('dispatch USER REQUEST')
    commit(USER_REQUEST)

    try {
      const profile = await UserService.getProfile()
      commit(USER_SUCCESS, profile)
    } catch (e) {
      if (e instanceof ProfileError) {
        commit(USER_ERROR, {
          errorCode: e.errorCode,
          errorMessage: e.message
        })
      }
      return false
    }
  }
}

const mutations = {
  [USER_REQUEST]: state => {
    console.log('USER REQUEST')
    state.status = 'loading'
  },
  [USER_SUCCESS]: (state, data) => {
    console.log('USER_SUCCESS')
    state.profile = data
  },
  [USER_ERROR]: (state, { errorCode, errorMessage }) => {
    console.log('USER_ERROR')
    state.errorCode = errorCode
    state.errorMessage = errorMessage
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
