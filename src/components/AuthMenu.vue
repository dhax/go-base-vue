<template>
  <v-btn v-if="!loggedIn" slot="activator" name="login" to="/login" flat>Login</v-btn>
  <v-menu v-else dark left>
    <v-btn slot="activator" name="menuAccount" flat>
      <v-icon>account_box</v-icon>
      <v-icon>more_vert</v-icon>
    </v-btn>
    <v-list>
      <v-list-tile class="elevation-6">
        <v-list-tile-title class="text-xs-center">{{subject}}</v-list-tile-title>
      </v-list-tile>
      <v-divider></v-divider>
      <v-list-tile>
        <v-btn name="account" to="/account" class="text-xs-center" block light>
          <v-icon left>account_box</v-icon>Account
        </v-btn>
      </v-list-tile>
      <v-divider></v-divider>
      <v-list-tile>
        <v-btn name="logout" @click="logout" class="text-xs-center warning" block>
          <v-icon left>logout</v-icon>Logout
        </v-btn>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { AUTH_LOGOUT } from '@/store/actions'

export default {
  name: 'AuthMenu',
  computed: {
    ...mapGetters(['loggedIn', 'subject'])
  },
  methods: {
    ...mapActions({
      logout: AUTH_LOGOUT
    })
  }
}
</script>
