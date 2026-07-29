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
        const contextoProdutos = await carregarDadosCSV(caminhoCSV);
        
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error("⚠️ AVISO CRÍTICO: A variável OPENROUTER_API_KEY está vazia!");
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

        // Faz a chamada HTTP utilizando o Llama 3 Gratuito (Muito mais estável para JSON)
        const response = await fetch("https://openrouter.ai", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3-8b-instruct:free", // Modelo alterado para estabilidade
                messages: [
                    { role: 'system', content: promptSistema },
                    { role: 'user', content: perguntaUsuario }
                ]
            })
        });

        const textoPuro = await response.text();

        // Evita que o JSON.parse quebre se a resposta vier vazia do servidor
        if (!textoPuro || textoPuro.trim() === "") {
            console.error("❌ O servidor do OpenRouter retornou uma resposta vazia.");
            return "O servidor de IA demorou para responder. Por favor, tente novamente.";
        }

        if (textoPuro.trim().startsWith("<!DOCTYPE")) {
            console.error(`❌ Servidor recusou com HTML. Status: ${response.status}`);
            return "Serviço de IA indisponível temporariamente.";
        }

        const data = JSON.parse(textoPuro);

        // Extração dos dados do JSON
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        } else if (data && data.error) {
            console.error("❌ Erro da API do OpenRouter:", data.error.message);
            return `Erro da API: ${data.error.message}`;
        } else {
            console.error("❌ Formato JSON desconhecido:", textoPuro);
            return "Erro no formato de resposta da IA.";
        }

    } catch (error) {
        console.error('💥 Falha fatal no agente:', error.message || error);
        return "Houve um erro ao processar sua resposta.";
    }
}

export { executarAgente };
