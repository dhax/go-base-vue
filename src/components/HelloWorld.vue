<template>
  <v-container justify-center text-xs-center class="body-2 ma-4 pa-4">
    <div>
      <h1 class="display-2 font-weight-bold mb-3">GoBase Demo Application</h1>

      <p class="subheading font-weight-regular">
        <a href="https://github.com/dhax/go-base" target="_blank" rel="noopener">Check out on GitHub</a>
      </p>
    </div>
    <v-divider></v-divider>
    <div class="ma-4 pa-4">
      <h5 class="headline">What's this?</h5>

      <p>A Go REST API and Vue.js client demo using a passwordless authentication flow with Json Web Token (JWT)</p>
      <p>A registered email address requests and then receives a temporary token to login.</p>
      <p>On successful login an access and a refresh JWT are saved to this client.</p>
    </div>
    <v-divider></v-divider>
    <div class="ma-4 pa-4">
      <h5 class="headline">Available Logins</h5>
      <p>For these two emails grab the login token from console output.</p>
      <p>admin@boot.io (admin panel)</p>
      <p>user@boot.io (own account)</p>
      <p>Other registered addresses will recieve an email with login token.</p>
    </div>
    <v-divider></v-divider>
    <div class="ma-4 pa-4">
      <p>Database is reset every 24 hours in this demo.</p>
    </div>
  </v-container>
</template>
