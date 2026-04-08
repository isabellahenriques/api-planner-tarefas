const { faker } = require('@faker-js/faker');

module.exports = {
  createUser: () => {
    return {
      email: `${faker.internet.email().toLowerCase()}`, // Gera um email aleatório e garante que seja em minúsculas
      senha: `${faker.internet.password()}`, // Garante uma senha forte
    };
  }
};
 