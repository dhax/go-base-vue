<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawerRight" fixed right clipped app stateless>
      <v-list dense>
        <v-list-tile @click.stop="right = !right">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Open Temporary Drawer</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar dense color="primary" dark fixed app>
      <v-toolbar-side-icon v-if="loggedIn" name="menu" @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>
        <router-link to="/">
          <v-btn flat>GoBase</v-btn>
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-toolbar-items>
        <AuthMenu/>
      </v-toolbar-items>

      <v-toolbar-side-icon v-if="loggedIn" @click.stop="drawerRight = !drawerRight"></v-toolbar-side-icon>
    </v-toolbar>

    <v-navigation-drawer v-model="drawer" fixed app>
      <v-list dense>
        <v-list-tile @click.stop="left = !left">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Open Temporary Drawer</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-list v-if="hasRole('admin')" class="subheader">
        <v-divider></v-divider>
        <v-subheader>Admin Panel</v-subheader>
        <v-list-tile to="/admin/accounts" name="accounts">
          <v-list-tile-action>
            <v-icon>security</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Accounts</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-list v-else>
        <v-divider></v-divider>
        <v-subheader>Menu</v-subheader>
        <v-list-tile to="/login">
          <v-list-tile-action>
            <v-icon>account_box</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Login for Menu</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="left" temporary fixed></v-navigation-drawer>
    <v-content>
      <router-view/>
    </v-content>
    <v-navigation-drawer v-model="right" right temporary fixed></v-navigation-drawer>

    <v-footer class="black--text pa-4" app>
      <span>GoBase</span>
      <v-spacer></v-spacer>
      <span>&copy; 2019</span>
    </v-footer>
    <confirm ref="confirm"></confirm>
  </v-app>
</template>

<script>
import AuthMenu from '@/components/AuthMenu'
import confirm from '@/components/helper/confirmDialog'
import { mapGetters } from 'vuex'

export default {
  components: { AuthMenu, confirm },
  props: {
    source: String
  },
  data: () => ({
    drawer: null,
    drawerRight: null,
    right: false,
    left: false
  }),

  computed: {
    ...mapGetters(['loggedIn', 'subject', 'hasRole'])
  },

  mounted() {
    this.$root.$confirm = this.$refs.confirm.open
  }
}
</script>
