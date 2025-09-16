// server.js (VERSÃO COMPLETA COM AUTENTICAÇÃO)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Para criptografar senhas
const jwt = require('jsonwebtoken'); // Para criar tokens de autenticação
require('dotenv').config();

const app = express();
const port = 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Conexão com o Banco de Dados ---
const dbURI = process.env.MONGODB_URI;
if (!dbURI) {
  console.error('Erro: MONGODB_URI não definida no arquivo .env');
  process.exit(1);
}
mongoose.connect(dbURI)
  .then(() => console.log('Conectado ao MongoDB com sucesso!'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// --- Schema e Model do Usuário (com campo de senha) ---
const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true } // Campo de senha adicionado
});
const Usuario = mongoose.model('Usuario', usuarioSchema);

// --- ROTAS DE AUTENTICAÇÃO ---

// ROTA DE CADASTRO (POST /cadastro)
app.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Criptografa a senha antes de salvar
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = new Usuario({
      nome,
      email,
      senha: senhaCriptografada
    });

    const usuarioSalvo = await novoUsuario.save();
    res.status(201).json({ message: "Usuário cadastrado com sucesso!", usuario: usuarioSalvo });
  } catch (err) {
    // Verifica se o erro é de email duplicado
    if (err.code === 11000) {
        return res.status(400).json({ error: 'Este email já está em uso.' });
    }
    res.status(500).json({ error: 'Erro ao criar usuário: ' + err.message });
  }
});

// ROTA DE LOGIN (POST /login)
app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Encontra o usuário pelo email
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(404).json({ error: 'Email ou senha inválidos.' });
        }

        // 2. Compara a senha enviada com a senha criptografada no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }

        // 3. Gera um token JWT se a senha estiver correta
        // Usaremos uma "chave secreta" para assinar o token. Coloque isso no seu .env!
        const token = jwt.sign(
            { id: usuario._id, nome: usuario.nome }, // Dados que queremos guardar no token
            process.env.JWT_SECRET || 'seu_segredo_super_secreto', // Chave secreta
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        res.json({ message: 'Login bem-sucedido!', token: token });

    } catch (err) {
        res.status(500).json({ error: 'Erro ao fazer login: ' + err.message });
    }
});


// ROTA PROTEGIDA PARA OBTER DADOS DO USUÁRIO (GET /me)
// Exemplo de como usar o token para acessar uma rota protegida
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"
    
    if (!token) return res.sendStatus(401); // Não autorizado se não houver token

    jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_super_secreto', (err, user) => {
        if (err) return res.sendStatus(403); // Proibido se o token for inválido
        req.user = user;
        next();
    });
}

app.get('/me', verificarToken, (req, res) => {
    // O middleware `verificarToken` já validou o token e adicionou os dados do usuário em `req.user`
    res.json({ username: req.user.nome });
});


// --- Iniciando o Servidor ---
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${3000}`);
});