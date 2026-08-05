
/**
 * Script utilitário: gera um hash bcrypt para uma senha e imprime o
 * objeto JSON pronto para colar em dados/usuarios.json com role "admin".
 *
 * Uso:
 *   node scripts/criar-admin.js "Nome do Admin" "email@exemplo.com" "SenhaForte123"
 *
 * Depois de rodar, copie o objeto impresso para dentro do array em
 * dados/usuarios.json (mantendo a vírgula entre os itens).
 */
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
 
const [, , nome, email, senha] = process.argv;
 
if (!nome || !email || !senha) {
  console.error('Uso: node scripts/criar-admin.js "Nome" "email@exemplo.com" "SenhaForte123"');
  process.exit(1);
}
 
const senhaHash = bcrypt.hashSync(senha, 10);
 
const usuarioAdmin = {
  id: randomUUID(),
  nome,
  email: email.trim().toLowerCase(),
  senhaHash,
  role: 'admin',
  criadoEm: new Date().toISOString(),
};
 
console.log('\nAdicione este objeto ao array em dados/usuarios.json:\n');
console.log(JSON.stringify(usuarioAdmin, null, 2));
 