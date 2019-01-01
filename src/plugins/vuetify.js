import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  theme: {
    primary: '#13232B',
    secondary: '#2B4851',
    accent: '#B0BEC5',
    error: '#D6473A',
    info: '#7799B8',
    success: '#4CAF50',
    warning: '#E57436'
  },
  customProperties: true,
  iconfont: 'md'
})
