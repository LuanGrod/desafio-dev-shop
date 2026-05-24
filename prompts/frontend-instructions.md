# Instruções de front-end - Parte 1.B

## Objetivo

Implementar uma tela simples para iniciar a compra de uma capinha de celular. A interface deve permitir que o usuário informe a quantidade desejada, envie a tentativa de compra e receba feedback claro sobre sucesso, erro e carregamento.

Não é necessário criar um layout elaborado. A prioridade é clareza, funcionamento do fluxo e tratamento correto dos estados da interface.

## Tela principal

A tela deve apresentar pelo menos um produto de capinha de celular com informações básicas:

- nome do produto;
- preço;
- estoque disponível, se fizer sentido para a experiência;
- campo para informar quantidade;
- botão para comprar.

## Fluxo da interface

1. O usuário visualiza o produto.
2. O usuário informa a quantidade desejada.
3. O usuário clica no botão de compra.
4. O front-end envia uma requisição para a API de checkout.
5. Enquanto a requisição está em andamento, a tela mostra um estado de carregamento.
6. Durante o carregamento, o botão de compra fica desabilitado.
7. Se a compra for aprovada, a tela exibe uma mensagem de sucesso.
8. Se ocorrer erro, a tela exibe uma mensagem compreensível.

## Estados obrigatórios

A interface deve tratar:

- estado inicial da tela;
- envio da compra em andamento;
- sucesso na compra;
- erro de validação;
- estoque insuficiente;
- falha ou indisponibilidade da API.

## Prevenção de ações duplicadas

Durante o processamento da compra, o botão de compra deve ficar desabilitado. Isso evita que o usuário envie a mesma tentativa várias vezes enquanto a requisição ainda está pendente.

## Mensagens para o usuário

As mensagens devem ser simples e úteis. Exemplos:

- "Compra realizada com sucesso."
- "Informe uma quantidade válida."
- "Não há estoque suficiente para essa quantidade."
- "Não foi possível concluir a compra agora. Tente novamente em instantes."

## Integração com a API

O front-end deve chamar o endpoint de checkout enviando:

- identificador do produto;
- quantidade desejada.

Exemplo de payload:

```json
{
  "productId": "case-iphone-15",
  "quantity": 2
}
```

O front-end deve interpretar as respostas da API e mostrar mensagens adequadas para cada caso, sem expor detalhes técnicos desnecessários ao usuário final.
