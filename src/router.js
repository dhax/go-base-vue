import Vue from 'vue'
import Router from 'vue-router'
// import { TokenService } from './services/storage.service'
import store from './store'
import Home from './views/Home.vue'
import Login from './views/Login.vue'

Vue.use(Router)

const ifNotAuthenticated = (to, from, next) => {
  if (!store.getters.loggedIn) {
    next()
    return
  }
  next(false)
}

const ifHasRoleAdmin = (to, from, next) => {
  if (store.getters['hasRole']('admin')) {
    next()
    return
  }
  next(false)
}

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        public: true
      }
    },
    {
      path: '/about',
      name: 'about',
      meta: {
        public: true
      },
      component: () =>
        import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/login/:token',
      component: Login,
      meta: {
        public: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        public: true
      },
      beforeEnter: ifNotAuthenticated
    },
    {
      path: '/account',
      name: 'account',
      component: () =>
        import(/* webpackChunkName: "account" */ './views/Account.vue')
    },
    {
      path: '/admin',
      // name: 'admin',
      beforeEnter: ifHasRoleAdmin,
      component: () =>
        import(/* webpackChunkName: "admin" */ './views/Admin.vue'),
      children: [
        {
          path: 'accounts',
          component: () => import('./components/admin/Accounts.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const isPublic = to.matched.some(record => record.meta.public)
  const loggedIn = store.getters.loggedIn

  if (!isPublic && !loggedIn) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  next()
})

export default router
