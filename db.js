// db.js
const mysql = require('mysql2');
require('dotenv').config(); // Esta linha LÊ o seu arquivo .env e carrega as variáveis

// Aqui, o código usa as variáveis carregadas do .env para criar a conexão
const pool = mysql.createPool({
  host: process.env.DB_HOST,         // Pega o valor de DB_HOST do .env
  user: process.env.DB_USER,         // Pega o valor de DB_USER do .env
  password: process.env.DB_PASSWORD, // Pega o valor de DB_PASSWORD do .env
  database: process.env.DB_DATABASE, // Pega o valor de DB_DATABASE do .env
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Transforma o pool em uma versão baseada em Promises para usarmos async/await
const promisePool = pool.promise();

// Exporta a conexão para que o server.js possa usá-la para fazer queries
module.exports = promisePool;