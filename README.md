# 🤖 Challenge Alura - Agente de IA na Cloud

Este projeto consiste em um assistente virtual de atendimento ao cliente para um E-commerce de Eletrônicos, desenvolvido como parte do Desafio de Agentes de IA da Alura. O agente é capaz de responder dúvidas de clientes consumindo dados dinâmicos diretamente de um arquivo de banco de dados local.

## 🚀 Status do Projeto: Live & Online
O projeto está hospedado e rodando continuamente na nuvem do Render.
* **URL do Servidor:** https://onrender.com

## 🛠️ Tecnologias Utilizadas
* **Node.js** (Ambiente de execução)
* **Express** (Servidor web e criação de rotas de API)
* **Google Gemini API** (Modelo `gemini-flash-latest` para processamento de linguagem natural)
* **HTTPS Nativo** (Comunicação direta e de baixo nível com os servidores da Google, livre de bloqueios)
* **csv-parser** (Leitura e processamento da base de dados de produtos)
* **Render** (Plataforma Cloud para Deploy Contínuo via GitHub)

## 📦 Estrutura de Dados
O agente utiliza um arquivo CSV localizado em `./data/produtos.csv` que serve como o contexto estrito (Base de Conhecimento) para a IA. O prompt do sistema garante que o robô responda **apenas** utilizando as informações reais de preço, estoque e políticas contidas neste arquivo.

## 🧪 Como Testar a API
Você pode enviar uma requisição `POST` para a rota de chat do servidor utilizando ferramentas como Postman, Insomnia ou o comando `curl` no terminal:

```bash
curl -X POST "https://onrender.com/chat" \
     -H "Content-Type: application/json" \
     -d '{"mensagem": "Qual é o preço do fone bluetooth?"}'
```

### Exemplo de Resposta esperada:
```json
{
  "resposta": "Olá! O preço do Fone Bluetooth Bass+ é R\$ 350,00."
}
```

## 🧑‍💻 Autor
Desenvolvido por Rogério durante o desafio Alura de Inteligência Artificial.
