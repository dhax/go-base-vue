// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('login', account => {
  Cypress.log({
    name: 'login with link',
    message: account.email
  })

  cy.server()
  cy.route({
    method: 'POST',
    url: '/auth/token',
    status: 200,
    response: account.jwt
  }).as('postLoginRequest')

  cy.visit('/login/12345678')

  return cy.wait('@postLoginRequest')
})

Cypress.Commands.add('loginWithForm', account => {
  Cypress.log({
    name: 'login with form',
    message: account.email
  })

  cy.location('pathname').then(path => {
    if (path != '/login') {
      Cypress.log({
        name: 'go to login',
        message: path
      })
      cy.get('a[name=login]').click()
    }
  })

  cy.location().should(loc => {
    expect(loc.pathname).to.eq('/login')
  })

  cy.server()
  cy.route({
    method: 'POST',
    url: '/auth/token',
    status: 200,
    response: account.jwt
  }).as('postLoginRequest')

  cy.get('input[name=input]').type('12345678')
  cy.get('button[name=submit]').click()

  return cy
    .wait('@postLoginRequest')
    .its('requestBody')
    .should('deep.eq', {
      grant_type: 'token',
      token: '12345678'
    })
})
