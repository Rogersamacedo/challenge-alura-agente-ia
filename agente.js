import fs from 'fs';
import csv from 'csv-parser';

// 1. Função para ler o arquivo CSV e transformá-lo em texto legível para a IA
function carregarDadosCSV(caminhoArquivo) {
    return new Promise((resolve, reject) => {
        const lines = [];
        fs.createReadStream(caminhoArquivo)
            .pipe(csv())
            .on('data', (data) => {
                lines.push(
                    `ID: ${data.id} | Produto: ${data.produto} | Categoria: ${data.categoria} | ` +
                    `Preço: R$${data.preco} | Estoque: ${data.estoque} unidades | ` +
                    `Avaliação: ${data.avaliacao_clientes}/5 | Garantia: ${data.politica_garantia}`
                );
            })
            .on('end', () => resolve(lines.join('\n')))
            .on('error', (error) => reject(error));
    });
}

// 2. Função principal do Agente de IA usando HTTP Fetch direto para o OpenRouter
async function executarAgente(perguntaUsuario) {
    try {
        const caminhoCSV = './data/produtos.csv';
                
        // Carrega o contexto dos produtos
        const contextoProdutos = await carregarDadosCSV(caminhoCSV);
        
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.log("⚠️ AVISO CRÍTICO: A variável OPENROUTER_API_KEY está vazia ou indefinida no Render!");
            return "Erro de configuração no servidor.";
        }

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

        // Faz a chamada HTTP utilizando o modelo universal gratuito do OpenRouter
        const response = await fetch("https://openrouter.ai", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [
                    { role: 'system', content: promptSistema },
                    { role: 'user', content: perguntaUsuario }
                ]
            })
        });

        const textoPuro = await response.text();

        if (textoPuro.trim().startsWith("<!DOCTYPE")) {
            console.log(`❌ O servidor recusou com Status HTTP: ${response.status}.`);
            return "Desculpe, o serviço de IA está temporariamente indisponível.";
        }

        const data = JSON.parse(textoPuro);

        if (data && data.choices && data.choices[0] && data.choices[0].message) {
            const respostaTexto = data.choices[0].message.content;
            return respostaTexto;
        } else {
            throw new Error("A API não retornou o formato esperado.");
        }

    } catch (error) {
        console.error('Erro ao executar o agente:', error.message || error);
        return "Houve um erro ao processar sua resposta.";
    }
}

// 3. Exportação usando o padrão ES Modules (Sem rodar o teste automático no final)
export { executarAgente };
