# Tasks de Back-end - Visualizacao de Pedidos

Baseado em `prompts/backend-instructions.md` e no contrato em `prompts/api-contract.md`.

Use `[ ]` para pendente e troque para `[x]` quando a task ou criterio estiver concluido.

## Escopo inicial

Esta primeira etapa deve implementar a consulta de pedidos em `GET /orders/:order_id`, preparando a base de dominio em memoria para que o endpoint de checkout possa reutilizar os mesmos tipos, repositorios e casos de uso depois.

O agente deve trabalhar em ciclos pequenos: escrever ou ajustar testes, implementar apenas o necessario para o proximo comportamento, rodar os testes daquele ponto e so entao seguir para a proxima task.

## Tasks

[ ] Task 1: Mapear o contrato do endpoint de visualizacao de pedidos

Arquivos para criar:

- Nenhum.

Arquivos para consultar:

- `prompts/backend-instructions.md`
- `prompts/api-contract.md`
- `backend/src/app.module.ts`
- `backend/test/app.e2e-spec.ts`
- `backend/package.json`

Criterios de aceitacao:

[ ] O agente confirmou que o endpoint esperado e `GET /orders/:order_id`.
[ ] O agente confirmou que pedido encontrado deve retornar `200 OK`.
[ ] O agente confirmou que pedido inexistente deve retornar `404 Not Found` com `{ "message": "Pedido não encontrado." }`.
[ ] O agente confirmou que os status de pedido aceitos sao `PROCESSING`, `APPROVED` e `REJECTED`.
[ ] O agente confirmou que a resposta de pedido encontrado deve conter `order_id`, `status` e `message`.
[ ] O agente confirmou qual ferramenta de teste sera usada para endpoint, preferencialmente o e2e ja existente com `supertest` em `backend/test/app.e2e-spec.ts`.

Validacao antes de seguir:

[ ] Rodar `npm run test:e2e` dentro de `backend` para conhecer o estado inicial dos testes.

[ ] Task 2: Criar testes e2e para `GET /orders/:order_id`

Arquivos para criar:

- `backend/test/orders.e2e-spec.ts`

Criterios de aceitacao:

[ ] Existe teste para pedido inexistente retornando `404 Not Found`.
[ ] O teste de pedido inexistente valida o body `{ "message": "Pedido não encontrado." }`.
[ ] Existe teste para pedido encontrado com status `PROCESSING`, retornando `200 OK`.
[ ] O teste de pedido `PROCESSING` valida `order_id`, `status: "PROCESSING"` e `message: "Pedido recebido e está sendo processado."`.
[ ] Existe teste para pedido encontrado com status final `APPROVED`, retornando `200 OK`.
[ ] O teste de pedido `APPROVED` valida `order_id`, `status: "APPROVED"` e `message: "Compra aprovada com sucesso."`.
[ ] Existe teste para pedido encontrado com status final `REJECTED`, retornando `200 OK`.
[ ] O teste de pedido `REJECTED` valida `order_id`, `status: "REJECTED"` e uma mensagem amigavel de rejeicao, como `Não há estoque suficiente para essa quantidade.`.
[ ] Existe teste para `order_id` invalido, por exemplo texto ou numero nao positivo, retornando erro amigavel e codigo HTTP adequado.
[ ] Os testes deixam claro como os pedidos em memoria serao preparados antes da chamada HTTP, sem depender do `POST /checkout` ainda.

Validacao antes de seguir:

[ ] Rodar `npm run test:e2e` dentro de `backend` e confirmar que os novos testes falham pelo motivo esperado: o endpoint e as dependencias ainda nao existem.

[ ] Task 3: Criar os tipos de dominio de pedido

Arquivos para criar:

- `backend/src/orders/domain/order-status.enum.ts`
- `backend/src/orders/domain/order.entity.ts`

Arquivos para alterar:

- Nenhum obrigatorio.

Criterios de aceitacao:

[ ] Existe um enum ou objeto tipado para os status `PROCESSING`, `APPROVED` e `REJECTED`.
[ ] Existe um tipo/interface de pedido em memoria com pelo menos `order_id`, `status`, `message` e `items`.
[ ] O tipo de pedido aceita itens com `product_id` e `quantity`, alinhado ao contrato de checkout.
[ ] O dominio nao depende de detalhes HTTP, decorators do NestJS ou `supertest`.
[ ] Os nomes dos campos expostos no endpoint preservam o contrato snake_case, especialmente `order_id`.

Validacao antes de seguir:

[ ] Rodar `npm run test` dentro de `backend` para garantir que os tipos compilam dentro da suite unit.

[ ] Task 4: Criar repository em memoria para pedidos

Arquivos para criar:

- `backend/src/orders/repositories/orders.repository.ts`

Arquivos para alterar:

- Nenhum obrigatorio nesta task.

Criterios de aceitacao:

[ ] Existe um repository in-memory responsavel por armazenar e consultar pedidos.
[ ] O repository expoe um metodo para buscar pedido por `order_id`.
[ ] O repository expoe um metodo simples para salvar ou semear pedidos em memoria, para uso dos testes e do futuro checkout.
[ ] O repository nao usa banco de dados real, ORM, Docker ou dependencias externas.
[ ] O estado em memoria pode ser reiniciado entre testes para evitar vazamento de dados entre cenarios.
[ ] O repository preserva os dados de status e mensagem sem traduzir regras de HTTP.

Validacao antes de seguir:

[ ] Rodar `npm run test` dentro de `backend`.

[ ] Task 5: Criar usecase de visualizacao de pedidos

Arquivos para criar:

- `backend/src/orders/use-cases/get-order.use-case.ts`

Arquivos para alterar:

- Nenhum obrigatorio nesta task.

Criterios de aceitacao:

[ ] O usecase recebe um `order_id` ja convertido para numero.
[ ] O usecase consulta o `OrdersRepository`.
[ ] Quando o pedido existe, o usecase retorna os dados necessarios para o controller responder `order_id`, `status` e `message`.
[ ] Quando o pedido nao existe, o usecase sinaliza erro de negocio claro para o controller transformar em `404 Not Found`.
[ ] O usecase valida `order_id` invalido ou nao positivo e sinaliza erro amigavel antes de consultar o repository.
[ ] O usecase nao conhece `Request`, `Response`, `supertest` ou detalhes de roteamento do NestJS.

Validacao antes de seguir:

[ ] Rodar `npm run test` dentro de `backend`.

[ ] Task 6: Criar controller do endpoint `GET /orders/:order_id`

Arquivos para criar:

- `backend/src/orders/orders.controller.ts`

Arquivos para alterar:

- Nenhum obrigatorio nesta task, se o modulo de orders ficar para a proxima task.

Criterios de aceitacao:

[ ] O controller registra a rota `GET /orders/:order_id`.
[ ] O controller converte `order_id` da URL para numero antes de chamar o usecase.
[ ] Para pedido encontrado, o controller retorna `200 OK` com `order_id`, `status` e `message`.
[ ] Para pedido inexistente, o controller retorna `404 Not Found` com `{ "message": "Pedido não encontrado." }`.
[ ] Para `order_id` invalido, o controller retorna erro HTTP adequado com mensagem amigavel, sem stack trace.
[ ] O controller nao acessa diretamente estruturas internas de armazenamento; ele usa o usecase.

Validacao antes de seguir:

[ ] Rodar `npm run test` dentro de `backend`.

[ ] Task 7: Registrar o modulo de orders na aplicacao NestJS

Arquivos para criar:

- `backend/src/orders/orders.module.ts`

Arquivos para alterar:

- `backend/src/app.module.ts`

Criterios de aceitacao:

[ ] Existe um `OrdersModule` registrando `OrdersController`, `GetOrderUseCase` e `OrdersRepository`.
[ ] `AppModule` importa `OrdersModule`.
[ ] O endpoint `GET /orders/:order_id` fica disponivel na aplicacao e2e.
[ ] A implementacao nao quebra a rota scaffold existente sem necessidade; se ela for removida, os testes antigos devem ser ajustados com intencao clara.
[ ] Providers sao registrados com escopo simples e compativel com armazenamento em memoria para esta mini-tarefa.

Validacao antes de seguir:

[ ] Rodar `npm run test:e2e` dentro de `backend`.
[ ] Confirmar que os testes de pedido encontrado e pedido inexistente passam ou identificar exatamente o proximo ajuste necessario.

[ ] Task 8: Preparar mecanismo de seed/reset para testes de pedidos

Arquivos para criar:

- Nenhum obrigatorio, se o metodo ficar no repository criado.

Arquivos para alterar:

- `backend/src/orders/repositories/orders.repository.ts`
- `backend/test/app.e2e-spec.ts` ou `backend/test/orders.e2e-spec.ts`

Arquivos que podem ser criados se o agente preferir separar utilitarios de teste:

- `backend/test/helpers/orders-test.helper.ts`

Criterios de aceitacao:

[ ] Os testes conseguem inserir pedidos `PROCESSING`, `APPROVED` e `REJECTED` diretamente no repository em memoria.
[ ] Cada teste inicia com repository limpo ou dados controlados.
[ ] Nao existe dependencia do endpoint `POST /checkout` para testar `GET /orders/:order_id`.
[ ] O helper de teste, se criado, fica dentro de `backend/test/` e nao vaza para o codigo de producao.
[ ] A forma de seed escolhida continua simples para reaproveitar quando o checkout for implementado.

Validacao antes de seguir:

[ ] Rodar `npm run test:e2e` dentro de `backend`.

[ ] Task 9: Revisar mensagens e contrato HTTP do endpoint

Arquivos para criar:

- Nenhum.

Arquivos para alterar:

- `backend/src/orders/orders.controller.ts`
- `backend/src/orders/use-cases/get-order.use-case.ts`
- `backend/test/app.e2e-spec.ts` ou `backend/test/orders.e2e-spec.ts`

Criterios de aceitacao:

[ ] Pedido `PROCESSING` retorna exatamente a mensagem `Pedido recebido e está sendo processado.`.
[ ] Pedido `APPROVED` retorna exatamente a mensagem `Compra aprovada com sucesso.`.
[ ] Pedido `REJECTED` retorna mensagem amigavel coerente com o motivo salvo no pedido.
[ ] Pedido inexistente retorna exatamente `{ "message": "Pedido não encontrado." }`.
[ ] Nenhuma resposta do endpoint retorna stack trace, classe de erro, caminho interno, mensagem tecnica ou detalhes de implementacao.
[ ] O formato final esta alinhado a `prompts/api-contract.md`.

Validacao antes de seguir:

[ ] Rodar `npm run test:e2e` dentro de `backend`.

[ ] Task 10: Rodar validacoes tecnicas finais do backend

Arquivos para criar:

- Nenhum.

Arquivos para alterar:

- Apenas os arquivos necessarios para corrigir problemas encontrados nas validacoes.

Criterios de aceitacao:

[ ] `npm run test` passa dentro de `backend`.
[ ] `npm run test:e2e` passa dentro de `backend`.
[ ] `npm run build` passa dentro de `backend`.
[ ] Se o lint for executado, `npm run lint` nao deixa problemas relevantes no codigo final.
[ ] O endpoint `GET /orders/:order_id` esta implementado sem banco real, autenticacao, pagamento, Docker ou integracao externa.
[ ] O codigo final deixa uma base clara para implementar depois `POST /checkout` usando o mesmo repository e os mesmos tipos de pedido.
[ ] O arquivo `prompts/backend-instructions.md` permanece respeitado para o escopo desta etapa.

## Observacoes para a proxima etapa

A implementacao de `POST /checkout` deve ser planejada em tasks separadas usando a base criada aqui. Ela deve incluir DTOs de checkout, validacoes de payload e header `Idempotency-Key`, estoque em memoria, idempotencia, processamento assincrono simulado, retries de ERP e atualizacao dos pedidos consultados por `GET /orders/:order_id`.
