import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import ApiService from './services/api.service'
import { TokenService } from './services/storage.service'

Vue.config.productionTip = false

ApiService.init(process.env.VUE_APP_ROOT_API)

if (TokenService.getToken()) {
  ApiService.setHeader()
  ApiService.mount401Interceptor()
}

Vue.filter('formatDate', value => {
  const date = new Date(value)
  return date.toLocaleDateString('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
    // hour: '2-digit',
    // minute: '2-digit'
  })
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
