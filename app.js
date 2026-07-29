import express from 'express';
import { executarAgente } from './agente.js';

const app = express();
app.use(express.json());

// Porta padrão que o Render exige para o projeto ficar verde (Live)
const PORT = process.env.PORT || 3000;

// Rota inicial simples para testar no navegador
app.get('/', (req, res) => {
    res.send('🤖 O Agente de IA da Alura está online e funcionando no Render!');
});

// Rota que recebe mensagens do chat e envia para o agente.js responder
app.post('/chat', async (req, res) => {
    const { mensagem } = req.body;
    if (!mensagem) {
        return res.status(400).json({ error: 'Por favor, envie uma mensagem.' });
    }
    
    console.log(`👤 Pergunta do Cliente: "${mensagem}"`);
    const resposta = await executarAgente(mensagem);
    res.json({ resposta });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor contínuo rodando com sucesso na porta ${PORT}`);
});
