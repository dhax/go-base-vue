<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4>
        <v-alert
          class="elevation-12 text-uppercase"
          :value="alert.msg"
          :type="alert.type"
          dismissible
          transition="scale-transition"
        >{{alert.msg}}</v-alert>

        <v-card class="elevation-12">
          <v-toolbar class="elevation-4">
            <v-toolbar-title>Login</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-tooltip top nudge-top>
              <v-btn slot="activator" icon @click="help = !help">
                <v-icon>help</v-icon>
              </v-btn>
              <span>Help</span>
            </v-tooltip>
          </v-toolbar>

          <v-slide-y-transition>
            <v-card v-show="help" dark>
              <v-card-text>
                <p class="body-2 text-xs-center">Submit your email to receive a login token.</p>
                <p class="body-2 text-xs-center">Enter received token here to login.</p>
              </v-card-text>
            </v-card>
          </v-slide-y-transition>

          <v-card-text>
            <v-form ref="loginForm" v-model="valid" @submit.prevent="submit">
              <v-text-field
                name="input"
                v-model="input"
                :rules="inputRules"
                label="Email or Token"
                required
                autofocus
              ></v-text-field>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              name="submit"
              color="primary"
              :disabled="!valid || authenticating"
              @click="submit"
              :loading="authenticating"
              class="elevation-12"
            >Submit</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { AUTH_TOKEN_REQUEST, AUTH_LOGIN_REQUEST } from '@/store/actions'

export default {
  name: 'login',
  data() {
    return {
      help: false,
      valid: false,
      input: '',
      inputRules: [
        v => !!v || 'required',
        () => this.isEmail || this.isToken || ''
      ]
    }
  },

  computed: {
    ...mapGetters([
      'authenticating',
      'authenticationStatus',
      'authenticationError',
      'authenticationErrorCode'
    ]),
    isEmail() {
      return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.input)
    },
    isToken() {
      return this.input && this.input.length == 8 && !/@/.test(this.input)
    },
    alert() {
      return {
        msg: this.authenticationError || this.authenticationStatus,
        type: this.authenticationError ? 'error' : 'info'
      }
    }
  },

  methods: {
    ...mapActions([AUTH_TOKEN_REQUEST, AUTH_LOGIN_REQUEST]),

    submit() {
      console.log('send token')
      if (this.$refs.loginForm.validate()) {
        if (this.isEmail) {
          this.AUTH_TOKEN_REQUEST(this.input)
        }
        if (this.isToken) {
          this.AUTH_LOGIN_REQUEST(this.input)
        }
        this.clearForm()
      }
    },

    clearForm() {
      this.$refs.loginForm.reset()
    }
  },

  mounted() {
    const token = this.$route.params.token
    if (token) {
      this.input = token
      setTimeout(() => {
        this.submit()
      }, 300)
    }
  }
}
</script>

<style lang="stylus">
.v-progress-circular {
  margin: 1rem;
}
</style>
