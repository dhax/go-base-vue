<template>
  <v-container>
    <v-snackbar v-model="snack" :timeout="3000" top :color="snackColor" class="text-capitalize">
      {{ snackText }}
      <v-btn @click="snack = false" outline>
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>

    <v-toolbar flat color="white" class="elevation-1">
      <v-toolbar-title>Accounts</v-toolbar-title>
      <v-divider class="mx-2" inset vertical></v-divider>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px">
        <v-btn slot="activator" color="primary" dark class="mb-2">New Account</v-btn>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-form wrap ref="accountForm" v-model="valid">
                <v-text-field v-model="editedAccount.name" label="Name" :rules="nameRules"></v-text-field>
                <v-text-field v-model="editedAccount.email" label="Email" :rules="emailRules"></v-text-field>
                <v-switch v-model="editedAccount.active" label="Active" color="primary"></v-switch>
                <v-checkbox
                  multiple
                  v-model="editedAccount.roles"
                  label="Admin"
                  value="admin"
                  color="primary"
                ></v-checkbox>
                <v-checkbox
                  multiple
                  v-model="editedAccount.roles"
                  label="User"
                  value="user"
                  color="primary"
                ></v-checkbox>
              </v-form>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="close">Cancel</v-btn>
            <v-btn color="primary" @click="save" :disabled="!valid">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>

    <v-data-table
      :headers="headers"
      :items="accounts"
      :pagination.sync="pagination"
      :total-items="totalAccounts"
      :loading="loading"
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <tr>
          <td class="columnIcon">
            <v-icon>{{props.item.active ? 'check_box':'check_box_outline_blank'}}</v-icon>
          </td>
          <td class="columnIcon">
            <v-icon v-if="props.item.roles.includes('admin')">security</v-icon>
          </td>
          <td @click="props.expanded = !props.expanded">{{ props.item.name }}</td>
          <td>{{ props.item.email }}</td>
          <td>{{ props.item.last_login | formatDate }}</td>
          <td class="justify-center layout px-0">
            <v-icon small class="mr-2" @click="editAccount(props.item)">edit</v-icon>
            <v-icon small @click="deleteAccount(props.item)">delete</v-icon>
          </td>
        </tr>
      </template>
      <template slot="expand" slot-scope="props">
        <v-card flat>
          <v-card-text>Created: {{ props.item.created_at | formatDate }}</v-card-text>
          <v-card-text>Last Login: {{ props.item.last_login | formatDate }}</v-card-text>
        </v-card>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { AdminService } from '@/services/admin.service'

export default {
  name: 'admin-accounts',
  data() {
    return {
      accounts: [],
      totalAccounts: 0,
      loading: true,
      pagination: {},
      headers: [
        { text: 'Active', value: 'active', sortable: true },
        { text: 'Admin', value: 'admin', sortable: false },
        { text: 'Name', align: 'left', value: 'name' },
        { text: 'Email', align: 'left', value: 'email' },
        { text: 'Last Login', align: 'left', value: 'last_login' }
      ],
      dialog: false,
      editedIndex: -1,
      editedAccount: {
        name: '',
        email: '',
        roles: ['user'],
        active: true
      },
      valid: true,
      defaultAccount: {
        name: '',
        email: '',
        roles: ['user'],
        active: true
      },
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
  watch: {
    dialog(val) {
      val || this.close()
    },
    pagination: {
      async handler() {
        const data = await this.getAccounts()
        this.accounts = data.accounts
        this.totalAccounts = data.count
      },
      depp: true
      // immediate: true
    }
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Account' : 'Edit Account'
    }
  },
  methods: {
    async getAccounts() {
      this.loading = true
      try {
        const { sortBy, descending, page, rowsPerPage } = this.pagination
        const filter = {
          page: page,
          limit: rowsPerPage === -1 ? 0 : rowsPerPage,
          order: (sortBy ? sortBy : '') + (descending ? ' desc' : '')
        }

        let { accounts, count } = await AdminService.getAccounts(filter)
        return { accounts, count }
      } catch (error) {
        console.log('could not get accounts data', error)
      } finally {
        this.loading = false
      }
    },

    editAccount(account) {
      this.editedIndex = this.accounts.indexOf(account)
      this.editedAccount = Object.assign({}, account)
      this.dialog = true
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedAccount = Object.assign({}, this.defaultAccount)
        this.editedIndex = -1
        this.$refs.accountForm.reset()
      }, 250)
    },

    async save() {
      if (this.editedIndex > -1) {
        try {
          const account = await AdminService.updateAccount(
            Object.assign({}, this.editedAccount)
          )
          Object.assign(this.accounts[this.editedIndex], account)
          this.close()
          this.snackSuccess('account updated')
        } catch (error) {
          this.errors = { ...error.fields }
          this.$refs.accountForm.validate()
          this.snackError(error.message)
        }
      } else {
        try {
          const account = await AdminService.createAccount(
            Object.assign({}, this.editedAccount)
          )
          this.accounts.push(account)
          this.close()
          this.snackSuccess('account created')
        } catch (error) {
          this.errors = { ...error.fields }
          this.$refs.accountForm.validate()
          this.snackError(error.message)
        }
      }
    },

    async deleteAccount(account) {
      if (
        await this.$root.$confirm('Delete', 'Are you sure?', {
          color: 'warning'
        })
      ) {
        try {
          const index = this.accounts.indexOf(account)
          const id = this.accounts[index].id
          await AdminService.deleteAccount(id)
          this.accounts = this.accounts.filter(v => v.id !== id)
          this.totalAccounts--
          this.snackSuccess('account deleted')
        } catch (error) {
          this.snackError('could not delete account')
        }
      }
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
  }
}
</script>

<style lang="stylus" scoped>
.columnIcon {
  width: 5rem;
}
</style>
