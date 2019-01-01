<template>
  <v-container>
    <v-card>
      <v-data-table :headers="headers" :items="token" :custom-sort="sortByDate" hide-actions>
        <template slot="items" slot-scope="props">
          <tr :class="{accent: props.item.id == localTokenID}">
            <td class="justify-center layout px-0">
              <v-icon>{{props.item.mobile ? 'phone_iphone' : 'desktop_mac'}}</v-icon>
            </td>
            <td>
              <v-edit-dialog
                :return-value.sync="props.item.identifier"
                large
                lazy
                persistent
                @save="save(props.item)"
              >
                <div class="subheading">{{props.item.identifier}}</div>

                <v-text-field
                  slot="input"
                  v-model="props.item.identifier"
                  :rules="[max60chars]"
                  label="Edit"
                  single-line
                  counter="60"
                  autofocus
                ></v-text-field>
              </v-edit-dialog>
            </td>
            <td class="subheading">{{props.item.created_at | formatDate}}</td>
            <td class="justify-center">
              <v-tooltip v-if="props.item.id != localTokenID" top>
                <v-icon slot="activator" @click="deleteItem(props.item)">delete</v-icon>
                <span>Delete</span>
              </v-tooltip>
              <v-tooltip v-else top>
                <v-icon slot="activator">location_on</v-icon>
                <span>This Device</span>
              </v-tooltip>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import AccountService from '@/services/account.service'

export default {
  props: {
    token: Array
  },
  data() {
    return {
      dialog: false,
      headers: [
        {
          text: '',
          value: 'mobile',
          sortable: false
        },
        {
          text: 'Identifier',
          value: 'identifier',
          sortable: false
        },
        { text: 'Created At', value: 'create_at' }
      ],
      max60chars: v => v.length <= 60 || 'Input too long!'
    }
  },
  computed: {
    localTokenID() {
      return this.$store.getters.localTokenID
    }
  },
  methods: {
    sortByDate(items, idx, desc) {
      return items.sort((a, b) => {
        const dateA = new Date(a.created_at)
        const dateB = new Date(b.created_at)
        return desc ? dateA - dateB : dateB - dateA
      })
    },
    async save(token) {
      try {
        await AccountService.updateToken({
          id: token.id,
          identifier: token.identifier
        })
        this.$emit('update-token', token)
      } catch (error) {
        console.log('failed to update token', error)
      }
    },

    async deleteItem(item) {
      if (
        await this.$root.$confirm('Delete', 'Are you sure?', {
          color: 'warning'
        })
      ) {
        try {
          const index = this.token.indexOf(item)
          await AccountService.deleteToken(this.token[index].id)
          this.$emit('delete-token', this.token[index].id)
        } catch (error) {
          console.log('failed to delete token', error)
        }
      }
    }
  }
}
</script>

<style>
</style>
