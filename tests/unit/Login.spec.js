import { expect, spy } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Login from '@/views/Login.vue'
import router from '@/router'
import { AUTH_TOKEN_REQUEST, AUTH_LOGIN_REQUEST } from '@/store/actions'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Login.vue', () => {
  let getters
  let actions
  let store
  let localStorageMock

  beforeEach(() => {
    localStorageMock = {
      getItem: () => {},
      setItem: () => {},
      clear: () => {}
    }
    global.localStorage = localStorageMock

    getters = {
      loggedIn: () => false,
      authenticating: () => false,
      accessToken: () => 'accesstoken',
      authenticationErrorCode: () => 0,
      authenticationError: () => '',
      authenticationStatus: () => ''
    }
    actions = {
      [AUTH_TOKEN_REQUEST]: () => spy(),
      [AUTH_LOGIN_REQUEST]: () => spy()
    }
    store = new Vuex.Store({
      state: {},
      getters,
      actions
    })
  })

  it('renders login form', () => {
    // localVue.$route.params = { token: '12345678' }

    const wrapper = shallowMount(Login, { router, store, localVue })
    expect(wrapper.text()).to.include('Login')
  })
})
