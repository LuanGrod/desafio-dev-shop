# Instruções gerais - Parte 1.B

## Contexto do desafio

A CaseCellShop é uma loja virtual fictícia especializada na venda de capinhas para celular. A empresa cresceu rapidamente e passou de milhares para milhões de acessos diários, o que expôs problemas importantes na jornada de compra.

A arquitetura atual depende de um ERP central monolítico, responsável por estoque, faturamento, financeiro e contabilidade. A loja virtual consome dados desse ERP por APIs REST síncronas. Como o ERP é o coração da operação e não pode ser alterado internamente, a solução do desafio deve ser simples, isolada e focada em demonstrar raciocínio técnico.

Na parte 1.B, o objetivo não é criar um e-commerce completo. O foco é implementar um pequeno fluxo de checkout para compra de capinhas de celular, usando dados em memória e uma experiência clara para o usuário.

## Problema que deve ser resolvido

O sistema deve permitir que um usuário selecione ou visualize um produto, informe a quantidade desejada e tente concluir uma compra.

Durante esse fluxo, a aplicação precisa lidar de forma compreensível com:

- compra realizada com sucesso;
- dados inválidos enviados pelo usuário;
- quantidade maior que o estoque disponível;
- indisponibilidade ou falha da API;
- tentativa de enviar a mesma compra mais de uma vez enquanto ela ainda está em processamento.

## Fluxo esperado do usuário

1. O usuário acessa uma tela simples de compra.
2. A tela apresenta pelo menos um produto de capinha de celular com informações básicas, como nome, preço e estoque disponível.
3. O usuário informa a quantidade que deseja comprar.
4. Ao clicar para comprar, o front-end envia uma requisição para a API de checkout.
5. Enquanto a compra está em andamento, a interface deve mostrar um estado de carregamento.
6. Durante o carregamento, o botão de compra deve ficar desabilitado para evitar cliques duplicados.
7. Se a compra for aprovada, o usuário deve ver uma mensagem clara de sucesso.
8. Se houver erro de validação, falta de estoque ou falha da API, o usuário deve ver uma mensagem simples explicando o problema.

## Qualidade esperada

A implementação deve priorizar simplicidade, clareza e organização. O avaliador deve conseguir entender rapidamente:

- onde está a API de checkout;
- onde estão os dados simulados de produtos e estoque;
- como as validações são feitas;
- como o front-end trata carregamento, sucesso e erro;
- como executar o projeto localmente.

## Trade-offs aceitáveis

Como a tarefa é pequena, é aceitável:

- usar dados em memória;
- simular indisponibilidade da API;
- manter apenas um ou poucos produtos cadastrados;
- não implementar autenticação;
- não implementar pagamento;
- não usar banco de dados real.
