// server.js (VERSÃO ATUALIZADA PARA MySQL)

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Para criptografar senhas
const jwt = require('jsonwebtoken'); // Para criar tokens de autenticação
const db = require('./db'); // Importa nosso pool de conexões MySQL
require('dotenv').config();

const app = express();
const port = 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- ROTAS DE AUTENTICAÇÃO ---

// ROTA DE CADASTRO (POST /cadastro)
app.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Criptografa a senha antes de salvar
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Query SQL para inserir um novo usuário
    // Usamos '?' para prevenir SQL Injection
    const sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
    
    // Executa a query
    const [result] = await db.query(sql, [nome, email, senhaCriptografada]);

    res.status(201).json({ message: "Usuário cadastrado com sucesso!", userId: result.insertId });

  } catch (err) {
    // Verifica se o erro é de email duplicado (código de erro do MySQL)
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Este email já está em uso.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar usuário: ' + err.message });
  }
});

// ROTA DE LOGIN (POST /login)
app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Encontra o usuário pelo email
        const sql = "SELECT * FROM usuarios WHERE email = ?";
        const [rows] = await db.query(sql, [email]);

        // Se nenhum usuário for encontrado, rows será um array vazio
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }
        
        const usuario = rows[0];

        // 2. Compara a senha enviada com a senha criptografada no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }

        // 3. Gera um token JWT se a senha estiver correta
        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome }, // Dados que queremos guardar no token
            process.env.JWT_SECRET || 'seu_segredo_super_secreto', // Chave secreta
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        res.json({ message: 'Login bem-sucedido!', token: token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao fazer login: ' + err.message });
    }
});


// Middleware para verificar o token JWT
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"
    
    if (!token) return res.sendStatus(401); // Não autorizado se não houver token

    jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_super_secreto', (err, user) => {
        if (err) return res.sendStatus(403); // Proibido se o token for inválido
        req.user = user; // Adiciona os dados do payload (id, nome) na requisição
        next();
    });
}

// ROTA PROTEGIDA PARA OBTER DADOS DO USUÁRIO (GET /me)
app.get('/me', verificarToken, (req, res) => {
    // O middleware `verificarToken` já validou e colocou os dados em `req.user`
    res.json({ username: req.user.nome });
});

// server.js (adicionar este trecho)

// ROTA PARA BUSCAR TODOS OS PRODUTOS (VOCÊ JÁ DEVE TER ALGO PARECIDO)
app.get('/produtos', async (req, res) => {
    try {
        const sql = "SELECT * FROM produtos ORDER BY id DESC";
        const [produtos] = await db.query(sql);
        res.json(produtos);
    } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// --- NOVA ROTA PARA BUSCAR UM PRODUTO ESPECÍFICO PELO ID ---
app.get('/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID da URL (ex: /produtos/123)

        const sql = "SELECT * FROM produtos WHERE id = ?";
        const [rows] = await db.query(sql, [id]);

        // Se nenhum produto for encontrado, rows será um array vazio
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        // Retorna o primeiro (e único) resultado
        res.json(rows[0]);

    } catch (err) {
        console.error('Erro ao buscar produto:', err);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});


// --- Iniciando o Servidor ---
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${3306} e conectado ao MySQL!`);
});