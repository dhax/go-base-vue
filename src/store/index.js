import Vue from 'vue'
import Vuex from 'vuex'
import user from './user.module'
import auth from './auth.module'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    auth
  },
  state: {},
  mutations: {},
  actions: {}
})
