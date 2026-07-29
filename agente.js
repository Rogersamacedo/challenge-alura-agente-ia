import fs from 'fs';
import csv from 'csv-parser';
import { OpenAI } from "openai";

// 1. Configura o acesso com a URL oficial do OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai",
  apiKey: process.env.OPENROUTER_API_KEY, 
});

// 2. Função para ler o arquivo CSV e transformá-lo em texto legível para a IA
function carregarDadosCSV(caminhoArquivo) {
    return new Promise((resolve, reject) => {
        const linhas = [];
        fs.createReadStream(caminhoArquivo)
            .pipe(csv())
            .on('data', (data) => {
                linhas.push(
                    `ID: ${data.id} | Produto: ${data.produto} | Categoria: ${data.categoria} | ` +
                    `Preço: R$${data.preco} | Estoque: ${data.estoque} unidades | ` +
                    `Avaliação: ${data.avaliacao_clientes}/5 | Garantia: ${data.politica_garantia}`
                );
            })
            .on('end', () => resolve(linhas.join('\n')))
            .on('error', (error) => reject(error));
    });
}

// 3. Função principal do Agente de IA integrada ao OpenRouter
async function executarAgente(perguntaUsuario) {
    try {
        const caminhoCSV = './data/produtos.csv';
                
        // Carrega o contexto dos produtos
        const contextoProdutos = await carregarDadosCSV(caminhoCSV);
        
        // Estrutura o Prompt do Sistema instruindo o comportamento do Agente
        const promptSistema = 
            `Você é o assistente virtual de atendimento ao cliente de um E-commerce de Eletrônicos.\n` +
            `Sua tarefa é responder a pergunta do usuário utilizando ESTRITAMENTE as informações da base de dados abaixo.\n\n` +
            `[BASE DE DADOS DE PRODUTOS]\n${contextoProdutos}\n\n` +
            `[REGRAS DE ATENDIMENTO]\n` +
            `1. Seja educado, profissional e direto.\n` +
            `2. Se o produto não estiver na base de dados ou a informação não existir, diga gentilmente que não possui essa informação.\n` +
            `3. Nunca invente dados de estoque, preços ou políticas de garantia.\n` +
            `4. Se o estoque estiver zerado (0), avise que o produto está esgotado.`;

        // Chama o modelo do OpenRouter com os parâmetros corretos
        const response = await openai.chat.completions.create({
            model: "google/gemini-1.5-flash", 
            messages: [
                { role: 'system', content: promptSistema },
                { role: 'user', content: perguntaUsuario }
            ],
        });

        // Verificação segura do retorno da API com o OpenRouter (padrão array choices)
        if (response && response.choices && response.choices[0]) {
            const respostaTexto = response.choices[0].message.content;
            console.log('\n🤖 Resposta do Agente:\n', respostaTexto);
            return respostaTexto;
        } else {
            throw new Error("A API do OpenRouter não retornou uma resposta válida.");
        }

    } catch (error) {
        console.error('Erro ao executar o agente:', error.message || error);
    }
}

// --- SIMULAÇÃO DE PERGUNTA PARA TESTE ---
const perguntaTeste = "O fone de ouvido bluetooth tem garantia se o bluetooth parar de funcionar?";
console.log(`👤 Pergunta: "${perguntaTeste}"`);
executarAgente(perguntaTeste);

// 4. Exportação usando o padrão ES Modules (compatível com seu "type": "module")
export { executarAgente };
