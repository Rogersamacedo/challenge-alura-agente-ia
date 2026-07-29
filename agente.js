// 1. Importa a biblioteca correta para o OpenRouter
const { OpenAI } = require("openai");

// 2. Configura o acesso com a URL do OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai",
  apiKey: process.env.OPENROUTER_API_KEY, 
});

// 3. Função principal do agente
async function executarAgente(mensagemUsuario) {
  try {
    // IMPORTANTE: O nome oficial do modelo no OpenRouter é este abaixo
    const response = await openai.chat.completions.create({
      model: "google/gemini-1.5-flash", 
      messages: [
        { role: "user", content: mensagemUsuario }
      ],
    });

    // Retorna a resposta do texto limpa
    return response.choices[0].message.content;

  } catch (error) {
    console.error("Erro ao executar o agente:", error);
    throw error;
  }
}

// Exporta a função caso seu arquivo principal (ex: app.js ou server.js) precise dela
module.exports = { executarAgente };
