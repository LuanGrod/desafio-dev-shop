# Pergunta 5 — Uso de IA no desenvolvimento

Se você fosse implementar a solução para o Problema 2 (Furo de Estoque) usando IA:

## Que perguntas ou instruções você daria à IA?

Primeiramente eu iria tentar entender o problema, pedir para analisar o problema e depois com base no problema encontrado propor soluções.

Considerando que temos um ambiente de homologação próprio para testes, eu iria criar um usuário de testes que tenha todos os privilégios necessários para realizar esse fluxo e fornecer para o agente, assim como todas as entidades no banco relacionadas a esse problema, passar o nome da tabela e a especificação das colunas que são utilizadas, isso para ele nao ficar supondo uma estrutura que não existe.

Depois com base nessas credenciais iria pedir para gerar um relatório em markdown com a descrição do problema encontrado, fornecendo palavras-chave como race condition, validação do estoque e concorrência.

Se tivesse acesso ao código do backend pediria para ele me explicar o fluxo completo, começando da rota, indicando quais camadas ele passa até o final do caminho, pesquisando que patterns são usados na codebase, quais estratégias são comuns nesse sistema. Tendo um conhecimento melhor dessa parte já começaria a resolver o problema, com perguntas como:

- Me indique onde no código esta acontecendo a validação do estoque, em que parte esta limitando a compra caso não exista estoque suficiente.
- Verifique em que parte do código esta acontecendo a baixa do estoque e me monte uma solução usando transactions para garantir que a baixa só acontece de forma atômica com a validação do estoque.
- Me de um exemplo de update condicional para mysql, um em que só atualiza o estoque se a quantidade descrita na compra for menor que a disponível no estoque.
- Revise o código de forma sistematica para verificar se existe ainda algum ponto crítico de falha caso o estoque esteja indisponível.

Após corrigir o problema iria pedir para ela gerar testes unitários cobrindo essas alterações que eu fiz, bem como um teste funcional cobrindo esse caminho feliz da compra bem sucedida e outro somente com o caminho do estoque insuficiente, visto que o único problema relatado é este do furo do estoque.

Finalmente após os testes escritos iria rodar toda a pipeline de testes antes de subir pra produção.