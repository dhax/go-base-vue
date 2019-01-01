const routes = {
  home: '/',
  login: '/login',
  public: '/about',
  restricted: '/account',
  admin: '/admin/accounts'
}

const loginToken = '12345678'

const accounts = {
  user: {
    email: 'user@boot.io',
    jwt: {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjUxNDU2OTg2NDksImlhdCI6MTU0NTcwMjI0OSwiaWQiOjIsInJvbGVzIjpbInVzZXIiXSwic3ViIjoiVXNlciBCb290In0.-zEn5B--dmfes3piG8bTLQjFNDZ3e0BLekx19yVxyY4',
      refresh_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjUxNDU2OTg2NDksImlhdCI6MTU0NTcwMjI0OSwiaWQiOjEyMiwidG9rZW4iOiIzYjcxZmY5MS0yNGJkLTQ3ZjEtYjZkOS1kZWYxMWI1MTM1Y2UifQ.P1hcin1Dx-2-MKEYahAUzkL6vk1d0bvuoY8HwUlehUY'
    }
  },
  admin: {
    email: 'admin@boot.io',
    jwt: {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjUxNDU2OTg2OTksImlhdCI6MTU0NTcwMjI5OSwiaWQiOjEsInJvbGVzIjpbImFkbWluIl0sInN1YiI6IkFkbWluIEJvb3QifQ.rhCKVpvO_ZvZCfVYrt29Wd0MTAcHEQj_fW64Bo1_iDk',
      refresh_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjUxNDU2OTg2OTksImlhdCI6MTU0NTcwMjI5OSwiaWQiOjEyMywidG9rZW4iOiIyMWVkMzE2NC0wYzU5LTQ3YzYtYWRjYS02NTQ2NmFhZWYwMmUifQ.ddOrYjiUYJlBe9wqNP4_Q775Lif2-tTGE3XkfAkTVTU'
    }
  }
}

describe('Form', function() {
  context('Validation', function() {
    beforeEach(function() {
      cy.visit(routes.login)
      cy.get('button[name=submit]').as('submit')
      cy.get('input[name=input]').as('input')
    })

    it('validates input before submit', function() {
      expect(this.submit).to.be.disabled
      expect(this.input).to.be.enabled

      cy.get('@input')
        .type('1234')
        .then(function() {
          expect(this.submit).to.be.disabled
        })

      cy.get('@input')
        .type('5678')
        .then(function() {
          expect(this.submit).to.be.enabled
        })

      cy.get('@input')
        .type('{backspace}@')
        .then(function() {
          expect(this.submit).to.be.disabled
        })

      cy.get('@input')
        .type('domain.tld')
        .then(function() {
          expect(this.submit).to.be.enabled
        })
    })
  })

  context('Submission', function() {
    beforeEach(function() {
      cy.visit(routes.login)
      cy.get('button[name=submit]').as('submit')
      cy.get('input[name=input]').as('input')
      cy.get('div.v-alert').as('alert')
    })

    it('displays errors on invalid email', function() {
      cy.server()
      cy.route('POST', '/auth/login').as('postTokenRequest')

      cy.get('@input').type('none@sen.se')
      cy.get('@submit').click()

      cy.wait('@postTokenRequest')
        .its('requestBody')
        .should('deep.eq', {
          grant_type: 'email',
          email: 'none@sen.se'
        })

      cy.get('@alert').should('be.visible')
      cy.get('@alert').should('have.class', 'error')

      cy.url().should('include', routes.login)
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(routes.login)
      })
    })

    it('displays errors on invalid token', function() {
      cy.server()
      cy.route('POST', '/auth/token').as('postLoginRequest')
      cy.get('@input').type(loginToken)
      cy.get('@submit').click()
      cy.wait('@postLoginRequest')
        .its('requestBody')
        .should('deep.eq', {
          grant_type: 'token',
          token: loginToken
        })

      cy.get('@alert').should('be.visible')
      cy.get('@alert').should('have.class', 'error')

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(routes.login)
        expect(loc.search).to.eq('')
      })
    })

    it('displays success on valid email', function() {
      cy.server()
      cy.route('POST', '/auth/login').as('postTokenRequest')

      cy.get('@input').type(accounts.user.email)
      cy.get('@submit').click()

      cy.wait('@postTokenRequest')
        .its('requestBody')
        .should('deep.eq', {
          grant_type: 'email',
          email: accounts.user.email
        })

      cy.get('@alert').should('be.visible')
      cy.get('@alert').should('have.class', 'info')

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(routes.login)
      })
    })
  })
})

describe('Login', function() {
  context('Token', function() {
    beforeEach(function() {})

    it('set tokens locally on success', function() {
      cy.login(accounts.user)

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(routes.home)
      })

      cy.contains('div', 'Account')
      cy.contains('div', 'Logout')
    })
  })

  context('Login Link', function() {
    beforeEach(function() {})

    it('declines invalid token', function() {
      cy.visit('/login/12345678')

      cy.location().should(loc => {
        expect(loc.pathname).to.eq('/login/12345678')
      })
      cy.get('div.v-alert')
        .as('alert')
        .then(function() {
          cy.get('@alert').should('be.visible')
          cy.get('@alert').should('have.class', 'error')
        })
    })

    it('accepts valid token', function() {
      cy.server()
      cy.route({
        method: 'POST',
        url: '/auth/token',
        status: 200,
        response: accounts.user.jwt
      }).as('postLoginRequest')

      cy.visit('/login/12345678')

      cy.wait('@postLoginRequest')
        .its('requestBody')
        .should('deep.eq', {
          grant_type: 'token',
          token: loginToken
        })

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(routes.home)
      })
      cy.get('div.v-alert').should('not.exist')
      cy.contains('div', 'Logout')
    })
  })

  context('Redirecting', function() {
    beforeEach(function() {
      cy.visit(routes.home)
    })

    it('redirect to login page for restricted route', function() {
      cy.visit(routes.restricted)
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(routes.login)
        expect(loc.search).to.eq('?redirect=%2Faccount')
      })
    })

    it('redirects to home page after login', function() {
      cy.loginWithForm(accounts.user)
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(routes.home)
        expect(loc.search).to.eq('')
      })
    })

    it('redirects to requested page after login', function() {
      cy.visit(routes.restricted)
      cy.loginWithForm(accounts.user)
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(routes.restricted)
        expect(loc.search).to.eq('')
      })
    })

    it('can access login after logout', function() {
      cy.login(accounts.user)

      cy.get('button[name=menuAccount]').click()
      cy.get('button[name=logout]').click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(routes.home)
        expect(loc.search).to.eq('')
      })

      cy.get('a[name=login]').click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(routes.login)
        expect(loc.search).to.eq('')
      })
    })
  })
})

describe('Roles', function() {
  context('restricted routes', function() {
    beforeEach(function() {
      // cy.visit(routes.home)
    })

    it('restricted if role missing', function() {
      cy.login(accounts.user)
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(routes.home)
      })
      cy.visit(routes.admin).then(function() {
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(routes.home)
        })
      })
    })

    it('allowed if role present', function() {
      cy.login(accounts.admin)
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(routes.home)
      })
      cy.visit(routes.admin)
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(routes.admin)
      })
    })

    it('menu navigation available if role present', function() {
      cy.login(accounts.admin)
      cy.get('button[name=menu]').click()
      cy.get('a[name=accounts]').click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(routes.admin)
      })
    })
  })
})
