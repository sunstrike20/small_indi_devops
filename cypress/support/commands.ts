// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to select elements by data-cy attribute
Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy=${value}]`)
})

// Custom command for drag and drop functionality
Cypress.Commands.add('dragAndDrop', (source: string, target: string) => {
  const dataTransfer = new DataTransfer()

  cy.get(source)
    .trigger('dragstart', { dataTransfer })
    .then(() => {
      cy.get(target).trigger('drop', { dataTransfer })
    })
})

// Custom command for user login
Cypress.Commands.add('login', (email: string, password: string) => {
  // Assuming you have API endpoints for authentication
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email,
      password
    }
  }).then((response) => {
    // Store the auth token in localStorage or sessionStorage
    window.localStorage.setItem('accessToken', response.body.accessToken)
    // If you use cookies, you might need to set them manually
    if (response.body.refreshToken) {
      cy.setCookie('refreshToken', response.body.refreshToken)
    }
  })
})

// Additional helper commands for the burger constructor app

// Command to add ingredient to constructor
Cypress.Commands.add('addIngredientToConstructor', (ingredientType: string) => {
  cy.get(`[data-cy="ingredient-${ingredientType}"]`)
    .first()
    .trigger('dragstart')
  
  cy.get('[data-cy="constructor-drop-area"]')
    .trigger('drop')
})

// Command to create order
Cypress.Commands.add('createOrder', () => {
  cy.get('[data-cy="order-button"]').click()
})

// Command to wait for modal to open
Cypress.Commands.add('waitForModal', () => {
  cy.get('[data-cy="modal"]').should('be.visible')
})

// Command to close modal
Cypress.Commands.add('closeModal', () => {
  cy.get('[data-cy="modal-close"]').click()
  cy.get('[data-cy="modal"]').should('not.exist')
})

// Extend Cypress namespace with our custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      addIngredientToConstructor(ingredientType: string): Chainable<void>
      createOrder(): Chainable<void>
      waitForModal(): Chainable<void>
      closeModal(): Chainable<void>
    }
  }
} 