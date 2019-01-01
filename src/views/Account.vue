<template>
  <v-container class="elevation-6">
    <v-snackbar v-model="snack" :timeout="3000" top :color="snackColor" class="text-capitalize">
      {{ snackText }}
      <v-btn @click="snack = false" outline>
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>

    <v-tabs fixed-tabs color="secondary" dark icons-and-text>
      <v-tabs-slider color="accent"></v-tabs-slider>

      <v-tab href="#account">Account
        <v-icon>account_box</v-icon>
      </v-tab>
      <v-tab href="#token">Token
        <v-icon>vpn_key</v-icon>
      </v-tab>

      <v-tab-item value="account">
        <v-container>
          <v-form ref="accountForm" v-model="valid">
            <v-text-field v-model="editAccount.name" label="Name" :rules="nameRules"/>
            <v-text-field v-model="editAccount.email" label="Email" :rules="emailRules"/>
          </v-form>
          <div>
            <v-chip v-for="role in account.roles" :key="role">{{role}}</v-chip>
          </div>
        </v-container>
        <v-toolbar>
          <v-btn @click="deleteAccount" color="error">Delete Account</v-btn>
          <v-spacer></v-spacer>
          <v-btn v-if="editing" @click="cancelEdit">Cancel</v-btn>
          <v-btn v-if="editing" @click="updateAccount" :disabled="!valid" color="warning">Save</v-btn>
        </v-toolbar>
      </v-tab-item>

      <v-tab-item value="token">
        <Token :token="account.token" @update-token="updateToken" @delete-token="deleteToken"/>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import { AccountService } from '@/services/account.service'
import Token from '@/components/account/Token'

export default {
  name: 'account',
  components: { Token },
  data() {
    return {
      account: {},
      editAccount: {},
      valid: true,
      editing: false,
      errors: {},
      snack: false,
      snackColor: '',
      snackText: '',
      nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 100) || 'Name must be less than 100 characters',
        () => !this.errors.name || this.errors.name
      ],
      emailRules: [
        v => !!v || 'E-mail is required',
        v =>
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          'E-mail must be valid',
        () => !this.errors.email || this.errors.email
      ]
    }
  },
  computed: {
    origAccount() {
      return {
        name: this.account.name,
        email: this.account.email
      }
    }
  },
  watch: {
    origAccount: function() {
      this.cancelEdit()
    },
    editAccount: {
      handler() {
        this.editing = true
      },
      deep: true
    }
  },
  methods: {
    cancelEdit() {
      this.editAccount = { ...this.origAccount }
      this.errors = {}
      setTimeout(() => {
        this.editing = false
      }, 100)
    },
    async updateAccount() {
      try {
        this.errors = {}
        if (this.$refs.accountForm.validate()) {
          this.account = await AccountService.updateAccount(this.editAccount)
          this.snackSuccess('account updated')
        }
      } catch (error) {
        this.errors = { ...error.fields }
        this.$refs.accountForm.validate()
        this.snackError(error.message)
      }
    },
    async deleteAccount() {
      if (
        await this.$root.$confirm('Delete', 'Are you sure?', {
          color: 'red'
        })
      ) {
        try {
          await AccountService.deleteAccount()
          this.snackSuccess('account deleted')
        } catch (error) {
          this.snackError(error.message)
        }
      }
    },

    updateToken(token) {
      const idx = this.account.token.findIndex(v => v.id === token.id)
      this.$set(this.account.token, idx, token)
      // equivalent to: this.account.token.splice(idx, 1, token)
      this.snackSuccess('token updated')
    },
    deleteToken(id) {
      this.account.token = this.account.token.filter(v => v.id !== id)
      this.snackSuccess('token deleted')
    },
    snackSuccess(message) {
      this.snack = true
      this.snackColor = 'success'
      this.snackText = message
    },
    snackError(message) {
      this.snack = true
      this.snackColor = 'error'
      this.snackText = message
    }
  },

  async created() {
    try {
      this.account = await AccountService.getAccount()
    } catch (error) {
      console.log('could not get account data')
    }
  }
}
</script>

<style>
</style>
