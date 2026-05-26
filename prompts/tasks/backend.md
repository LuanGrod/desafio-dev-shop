# Tasks de Back-end - Visualizacao de Pedidos

Baseado em `prompts/backend-instructions.md` e no contrato em `prompts/api-contract.md`.

Use `[ ]` para pendente e troque para `[x]` quando a task ou criterio estiver concluido.

## Escopo inicial

Esta primeira etapa deve implementar a consulta de pedidos em `GET /orders/:order_id`, preparando a base de dominio em memoria para que o endpoint de checkout possa reutilizar os mesmos tipos, repositorios e casos de uso depois.

O agente deve trabalhar em ciclos pequenos: escrever ou ajustar testes, implementar apenas o necessario para o proximo comportamento, rodar os testes daquele ponto e so entao seguir para a proxima task.

## Tasks

[x] Task 1: Mapear o contrato do endpoint de visualizacao de pedidos

Arquivos para criar:

- Nenhum.

Arquivos para consultar:

- `prompts/backend-instructions.md`
- `prompts/api-contract.md`
- `backend/src/app.module.ts`
- `backend/test/app.e2e-spec.ts`
- `backend/package.json`

Criterios de aceitacao:

[x] O agente confirmou que o endpoint esperado e `GET /orders/:order_id`.
[x] O agente confirmou que pedido encontrado deve retornar `200 OK`.
[x] O agente confirmou que pedido inexistente deve retornar `404 Not Found` com `{ "message": "Pedido não encontrado." }`.
[x] O agente confirmou que os status de pedido aceitos sao `PROCESSING`, `APPROVED` e `REJECTED`.
[x] O agente confirmou que a resposta de pedido encontrado deve conter `order_id`, `status` e `message`.
[x] O agente confirmou qual ferramenta de teste sera usada para endpoint, preferencialmente o e2e ja existente com `supertest` em `backend/test/app.e2e-spec.ts`.

Validacao antes de seguir:

[x] Rodar `npm run test:e2e` dentro de `backend` para conhecer o estado inicial dos testes.

[x] Task 2: Criar testes e2e para `GET /orders/:order_id`

Arquivos para criar:

- `backend/test/orders.e2e-spec.ts`

Criterios de aceitacao:

[x] Existe teste para pedido inexistente retornando `404 Not Found`.
[x] O teste de pedido inexistente valida o body `{ "message": "Pedido não encontrado." }`.
[x] Existe teste para pedido encontrado com status `PROCESSING`, retornando `200 OK`.
[x] O teste de pedido `PROCESSING` valida `order_id`, `status: "PROCESSING"` e `message: "Pedido recebido e está sendo processado."`.
[x] Existe teste para pedido encontrado com status final `APPROVED`, retornando `200 OK`.
[x] O teste de pedido `APPROVED` valida `order_id`, `status: "APPROVED"` e `message: "Compra aprovada com sucesso."`.
[x] Existe teste para pedido encontrado com status final `REJECTED`, retornando `200 OK`.
[x] O teste de pedido `REJECTED` valida `order_id`, `status: "REJECTED"` e uma mensagem amigavel de rejeicao, como `Não há estoque suficiente para essa quantidade.`.
[x] Existe teste para `order_id` invalido, por exemplo texto ou numero nao positivo, retornando erro amigavel e codigo HTTP adequado.
[x] Os testes deixam claro como os pedidos em memoria serao preparados antes da chamada HTTP, sem depender do `POST /checkout` ainda.

Validacao antes de seguir:

[x] Rodar `npm run test:e2e` dentro de `backend` e confirmar que os novos testes falham pelo motivo esperado: o endpoint e as dependencias ainda nao existem.

[x] Task 3: Criar os tipos de dominio de pedido

Arquivos para criar:

- `backend/src/orders/domain/order-status.enum.ts`
- `backend/src/orders/domain/order.entity.ts`

Arquivos para alterar:

- Nenhum obrigatorio.

Criterios de aceitacao:

[x] Existe um enum ou objeto tipado para os status `PROCESSING`, `APPROVED` e `REJECTED`.
[x] Existe um tipo/interface de pedido em memoria com pelo menos `order_id`, `status`, `message` e `items`.
[x] O tipo de pedido aceita itens com `product_id` e `quantity`, alinhado ao contrato de checkout.
[x] O dominio nao depende de detalhes HTTP, decorators do NestJS ou `supertest`.
[x] Os nomes dos campos expostos no endpoint preservam o contrato snake_case, especialmente `order_id`.

Validacao antes de seguir:

[x] Rodar `npm run test` dentro de `backend` para garantir que os tipos compilam dentro da suite unit.

[x] Task 4: Criar repository em memoria para pedidos

Arquivos para criar:

- `backend/src/orders/repositories/orders.repository.ts`

Arquivos para alterar:

- Nenhum obrigatorio nesta task.

Criterios de aceitacao:

[x] Existe um repository in-memory responsavel por armazenar e consultar pedidos.
[x] O repository expoe um metodo para buscar pedido por `order_id`.
[x] O repository expoe um metodo simples para salvar ou semear pedidos em memoria, para uso dos testes e do futuro checkout.
[x] O repository nao usa banco de dados real, ORM, Docker ou dependencias externas.
[x] O estado em memoria pode ser reiniciado entre testes para evitar vazamento de dados entre cenarios.
[x] O repository preserva os dados de status e mensagem sem traduzir regras de HTTP.

Validacao antes de seguir:

[x] Rodar `npm run test` dentro de `backend`.

[x] Task 5: Criar usecase de visualizacao de pedidos

Arquivos para criar:

- `backend/src/orders/use-cases/get-order.use-case.ts`

Arquivos para alterar:

- Nenhum obrigatorio nesta task.

Criterios de aceitacao:

[x] O usecase recebe um `order_id` ja convertido para numero.
[x] O usecase consulta o `OrdersRepository`.
[x] Quando o pedido existe, o usecase retorna os dados necessarios para o controller responder `order_id`, `status` e `message`.
[x] Quando o pedido nao existe, o usecase sinaliza erro de negocio claro para o controller transformar em `404 Not Found`.
[x] O usecase valida `order_id` invalido ou nao positivo e sinaliza erro amigavel antes de consultar o repository.
[x] O usecase nao conhece `Request`, `Response`, `supertest` ou detalhes de roteamento do NestJS.

Validacao antes de seguir:

[x] Rodar `npm run test` dentro de `backend`.

[x] Task 6: Criar controller do endpoint `GET /orders/:order_id`

Arquivos para criar:

- `backend/src/orders/orders.controller.ts`

Arquivos para alterar:

- Nenhum obrigatorio nesta task, se o modulo de orders ficar para a proxima task.

Criterios de aceitacao:

[x] O controller registra a rota `GET /orders/:order_id`.
[x] O controller converte `order_id` da URL para numero antes de chamar o usecase.
[x] Para pedido encontrado, o controller retorna `200 OK` com `order_id`, `status` e `message`.
[x] Para pedido inexistente, o controller retorna `404 Not Found` com `{ "message": "Pedido não encontrado." }`.
[x] Para `order_id` invalido, o controller retorna erro HTTP adequado com mensagem amigavel, sem stack trace.
[x] O controller nao acessa diretamente estruturas internas de armazenamento; ele usa o usecase.

Validacao antes de seguir:

[x] Rodar `npm run test` dentro de `backend`.

[x] Task 7: Registrar o modulo de orders na aplicacao NestJS

Arquivos para criar:

- `backend/src/orders/orders.module.ts`

Arquivos para alterar:

- `backend/src/app.module.ts`

Criterios de aceitacao:

[x] Existe um `OrdersModule` registrando `OrdersController`, `GetOrderUseCase` e `OrdersRepository`.
[x] `AppModule` importa `OrdersModule`.
[x] O endpoint `GET /orders/:order_id` fica disponivel na aplicacao e2e.
[x] A implementacao nao quebra a rota scaffold existente sem necessidade; se ela for removida, os testes antigos devem ser ajustados com intencao clara.
[x] Providers sao registrados com escopo simples e compativel com armazenamento em memoria para esta mini-tarefa.

Validacao antes de seguir:

[x] Rodar `npm run test:e2e` dentro de `backend`.
[x] Confirmar que os testes de pedido encontrado e pedido inexistente passam ou identificar exatamente o proximo ajuste necessario.

[x] Task 8: Preparar mecanismo de seed/reset para testes de pedidos

Arquivos para criar:

- Nenhum obrigatorio, se o metodo ficar no repository criado.

Arquivos para alterar:

- `backend/src/orders/repositories/orders.repository.ts`
- `backend/test/app.e2e-spec.ts` ou `backend/test/orders.e2e-spec.ts`

Arquivos que podem ser criados se o agente preferir separar utilitarios de teste:

- `backend/test/helpers/orders-test.helper.ts`

Criterios de aceitacao:

[x] Os testes conseguem inserir pedidos `PROCESSING`, `APPROVED` e `REJECTED` diretamente no repository em memoria.
[x] Cada teste inicia com repository limpo ou dados controlados.
[x] Nao existe dependencia do endpoint `POST /checkout` para testar `GET /orders/:order_id`.
[x] O helper de teste, se criado, fica dentro de `backend/test/` e nao vaza para o codigo de producao.
[x] A forma de seed escolhida continua simples para reaproveitar quando o checkout for implementado.

Validacao antes de seguir:

[x] Rodar `npm run test:e2e` dentro de `backend`.

[x] Task 9: Revisar mensagens e contrato HTTP do endpoint

Arquivos para criar:

- Nenhum.

Arquivos para alterar:

- `backend/src/orders/orders.controller.ts`
- `backend/src/orders/use-cases/get-order.use-case.ts`
- `backend/test/app.e2e-spec.ts` ou `backend/test/orders.e2e-spec.ts`

Criterios de aceitacao:

[x] Pedido `PROCESSING` retorna exatamente a mensagem `Pedido recebido e está sendo processado.`.
[x] Pedido `APPROVED` retorna exatamente a mensagem `Compra aprovada com sucesso.`.
[x] Pedido `REJECTED` retorna mensagem amigavel coerente com o motivo salvo no pedido.
[x] Pedido inexistente retorna exatamente `{ "message": "Pedido não encontrado." }`.
[x] Nenhuma resposta do endpoint retorna stack trace, classe de erro, caminho interno, mensagem tecnica ou detalhes de implementacao.
[x] O formato final esta alinhado a `prompts/api-contract.md`.

Validacao antes de seguir:

[x] Rodar `npm run test:e2e` dentro de `backend`.

[x] Task 10: Rodar validacoes tecnicas finais do backend

Arquivos para criar:

- Nenhum.

Arquivos para alterar:

- Apenas os arquivos necessarios para corrigir problemas encontrados nas validacoes.

Criterios de aceitacao:

[x] `npm run test` passa dentro de `backend`.
[x] `npm run test:e2e` passa dentro de `backend`.
[x] `npm run build` passa dentro de `backend`.
[x] Se o lint for executado, `npm run lint` nao deixa problemas relevantes no codigo final.
[x] O endpoint `GET /orders/:order_id` esta implementado sem banco real, autenticacao, pagamento, Docker ou integracao externa.
[x] O codigo final deixa uma base clara para implementar depois `POST /checkout` usando o mesmo repository e os mesmos tipos de pedido.
[x] O arquivo `prompts/backend-instructions.md` permanece respeitado para o escopo desta etapa.

## Observacoes para a proxima etapa

A implementacao de `POST /checkout` deve ser planejada em tasks separadas usando a base criada aqui. Ela deve incluir DTOs de checkout, validacoes de payload e header `Idempotency-Key`, estoque em memoria, idempotencia, processamento assincrono simulado, retries de ERP e atualizacao dos pedidos consultados por `GET /orders/:order_id`.

## Proxima etapa: Checkout

Esta etapa deve implementar o fluxo principal do backend em `POST /checkout`, reaproveitando a base ja criada para pedidos em memoria. A abordagem continua sendo incremental: primeiro criar um teste e2e geral do fluxo de checkout que falha pelo motivo esperado, depois implementar uma fatia pequena por vez, sempre validando antes de seguir.

O endpoint de checkout deve criar pedidos com status inicial `PROCESSING`, permitir consulta posterior pelo `GET /orders/:order_id`, respeitar idempotencia por header `Idempotency-Key`, validar estoque em memoria e simular processamento assincrono ate `APPROVED` ou `REJECTED`.

## Tasks de Checkout

[x] Task 11: Mapear o contrato do endpoint principal de checkout

Arquivos para criar:

- Nenhum.

Arquivos para consultar:

- `prompts/backend-instructions.md`
- `prompts/api-contract.md`
- `backend/src/app.module.ts`
- `backend/src/orders/orders.module.ts`
- `backend/src/orders/repositories/orders.repository.ts`
- `backend/src/orders/domain/order.entity.ts`
- `backend/test/orders.e2e-spec.ts`
- `backend/package.json`

Criterios de aceitacao:

[x] O agente confirmou que o endpoint esperado e `POST /checkout`.
[x] O agente confirmou que uma tentativa valida deve retornar `202 Accepted`.
[x] O agente confirmou que o request deve receber `items` como lista com `product_id` e `quantity`.
[x] O agente confirmou que o header `Idempotency-Key` e obrigatorio.
[x] O agente confirmou que a resposta de sucesso inicial deve conter `order_id`, `status: "PROCESSING"` e `message: "Pedido recebido e está sendo processado."`.
[x] O agente confirmou que o pedido criado pelo checkout deve poder ser consultado depois via `GET /orders/:order_id`.
[x] O agente confirmou que estoque, idempotencia, pedidos e processamento devem funcionar em memoria, sem banco real, fila real, pagamento, Docker ou ERP externo.
[x] O agente confirmou quais mensagens e status HTTP devem ser usados para payload invalido, quantidade invalida, produto inexistente, falta de idempotencia, estoque insuficiente e reutilizacao indevida da chave.

Validacao antes de seguir:

[x] Rodar `npm run test:e2e` dentro de `backend` para confirmar o estado inicial antes dos testes de checkout.

[x] Task 12: Criar teste e2e geral do fluxo feliz de checkout

Arquivos para criar:

- `backend/test/checkout.e2e-spec.ts`

Arquivos para alterar:

- Nenhum obrigatorio.

Criterios de aceitacao:

[x] Existe um teste e2e que chama `POST /checkout` com header `Idempotency-Key` e payload `{ "items": [{ "product_id": 1, "quantity": 2 }] }`.
[x] O teste valida `202 Accepted`.
[x] O teste valida body com `order_id` numerico positivo, `status: "PROCESSING"` e `message: "Pedido recebido e está sendo processado."`.
[x] O teste consulta `GET /orders/:order_id` usando o `order_id` retornado.
[x] O teste valida que o pedido consultado existe e retorna `order_id`, `status` e `message` coerentes com o estado atual do pedido.
[x] O teste deixa claro que este e o fluxo principal do backend e que o processamento final sera detalhado em tasks posteriores.
[x] O teste limpa o estado em memoria antes de cada caso, reaproveitando ou evoluindo o mecanismo de reset ja usado em `backend/test/orders.e2e-spec.ts`.

Validacao antes de seguir:

[x] Rodar `npm run test:e2e` dentro de `backend` e confirmar que o novo teste falha pelo motivo esperado: `POST /checkout` ainda nao existe.

[x] Task 13: Criar os tipos de dominio para checkout e produto

Arquivos para criar:

- `backend/src/checkout/domain/checkout-request.entity.ts`
- `backend/src/products/domain/product.entity.ts`

Arquivos para alterar:

- `backend/src/orders/domain/order.entity.ts`

Criterios de aceitacao:

[x] Existe um tipo de item de checkout com `product_id` e `quantity`, alinhado a `prompts/api-contract.md`.
[x] Existe um tipo de request de checkout com `items`.
[x] Existe um tipo de produto em memoria com pelo menos `id`, `name`, `price` e `stock`.
[x] O tipo de pedido passa a aceitar, se necessario, `idempotency_key`, `created_at` e metadados simples de processamento sem quebrar os testes existentes de `GET /orders/:order_id`.
[x] Os tipos de dominio nao dependem de decorators HTTP, `Request`, `Response`, `supertest` ou detalhes de controller.
[x] Os campos expostos no contrato preservam snake_case onde o contrato exige, especialmente `product_id` e `order_id`.

Validacao antes de seguir:

[x] Rodar `npm run test` dentro de `backend` para garantir que os tipos compilam dentro da suite unit.

[x] Task 14: Criar repository em memoria para produtos e estoque

Arquivos para criar:

- `backend/src/products/repositories/products.repository.ts`
- `backend/src/products/products.module.ts`

Arquivos para alterar:

- `backend/src/app.module.ts` ou `backend/src/checkout/checkout.module.ts`, se o modulo de checkout ja existir nesta altura.

Criterios de aceitacao:

[x] Existe um repository in-memory de produtos com pelo menos o produto `id: 1`, nome `Capinha Clear Case iPhone 15`, preco `79.9` e estoque inicial controlado.
[x] O repository expoe metodo para buscar produto por `product_id`.
[x] O repository expoe metodo para validar se ha estoque suficiente para uma quantidade.
[x] O repository expoe metodo para decrementar estoque de forma simples quando o pedido for aprovado.
[x] O repository expoe metodo de `reset` ou `seed` para testes.
[x] O repository nao usa banco de dados real, ORM, Docker ou dependencias externas.
[x] A implementacao evita expor referencias mutaveis internas para os testes ou usecases.

Validacao antes de seguir:

[x] Rodar `npm run test` dentro de `backend`.

[x] Task 15: Criar validacao inicial do payload de checkout

Arquivos para criar:

- `backend/src/checkout/use-cases/validate-checkout.use-case.ts`

Arquivos para alterar:

- Nenhum obrigatorio nesta task.

Criterios de aceitacao:

[x] Existe validacao para ausencia de `items`, retornando erro de negocio com mensagem `Dados da compra inválidos.`.
[x] Existe validacao para `items` vazio, retornando erro de negocio com mensagem `Dados da compra inválidos.`.
[x] Existe validacao para payload em formato diferente do contrato, retornando erro de negocio com mensagem `Dados da compra inválidos.`.
[x] Existe validacao para `product_id` ausente, invalido ou inexistente, retornando erro amigavel adequado.
[x] Existe validacao para `quantity` ausente, nao inteira ou menor ou igual a zero, retornando mensagem `Informe uma quantidade válida.`.
[x] A validacao suporta o formato de lista em `items`, mesmo que a implementacao aceite inicialmente apenas um item.
[x] O usecase nao conhece HTTP, controller ou `supertest`; ele apenas sinaliza erros de negocio claros para a camada HTTP.

Validacao antes de seguir:

[x] Criar ou ajustar testes unitarios focados para esta validacao, se houver suite unit adequada.
[x] Rodar `npm run test` dentro de `backend`.

[x] Task 16: Criar repository em memoria para idempotencia

Arquivos para criar:

- `backend/src/checkout/repositories/idempotency.repository.ts`

Arquivos para alterar:

- Nenhum obrigatorio nesta task.

Criterios de aceitacao:

[x] Existe um repository in-memory que armazena entradas por `Idempotency-Key`.
[x] Cada entrada guarda a chave, uma assinatura ou copia normalizada do payload original e o `order_id` criado.
[x] O repository permite consultar uma entrada por chave.
[x] O repository permite salvar uma nova entrada de forma simples.
[x] O repository permite resetar o estado entre testes.
[x] A comparacao de payloads iguais nao depende da ordem de propriedades do JSON bruto.
[x] O repository nao traduz regras HTTP; ele apenas preserva e consulta dados de idempotencia.

Validacao antes de seguir:

[x] Rodar `npm run test` dentro de `backend`.

[x] Task 17: Criar usecase de criacao inicial de pedido de checkout

Arquivos para criar:

- `backend/src/checkout/use-cases/create-checkout-order.use-case.ts`

Arquivos para alterar:

- `backend/src/orders/repositories/orders.repository.ts`
- `backend/src/orders/domain/order.entity.ts`

Criterios de aceitacao:

[x] O usecase recebe payload validado e `Idempotency-Key`.
[x] O usecase rejeita ausencia de `Idempotency-Key` com mensagem `Não foi possível identificar a tentativa de compra. Tente novamente.`.
[x] O usecase valida estoque inicial antes de criar o pedido.
[x] Quando nao ha estoque suficiente no momento do `POST /checkout`, o usecase sinaliza conflito com mensagem `Não há estoque suficiente para essa quantidade.` e nao cria pedido.
[x] Quando a tentativa e valida, o usecase cria um pedido em memoria com `status: "PROCESSING"` e mensagem `Pedido recebido e está sendo processado.`.
[x] O `OrdersRepository` passa a conseguir gerar ou persistir `order_id` numerico positivo sem depender dos testes semearem IDs manualmente.
[x] O pedido salvo preserva os itens recebidos e a chave de idempotencia.
[x] O usecase retorna somente os dados necessarios para a resposta HTTP inicial: `order_id`, `status` e `message`.

Validacao antes de seguir:

[x] Rodar `npm run test` dentro de `backend`.

[x] Task 18: Implementar comportamento idempotente do checkout

Arquivos para alterar:

- `backend/src/checkout/use-cases/create-checkout-order.use-case.ts`
- `backend/src/checkout/repositories/idempotency.repository.ts`
- `backend/test/checkout.e2e-spec.ts`

Criterios de aceitacao:

[x] Existe teste e2e para repetir `POST /checkout` com a mesma `Idempotency-Key` e o mesmo payload.
[x] A repeticao com a mesma chave e mesmo payload retorna o mesmo `order_id`, sem criar pedido duplicado.
[x] A resposta idempotente retorna o status e mensagem atuais do pedido ja existente.
[x] Existe teste e2e para reutilizar a mesma `Idempotency-Key` com payload diferente.
[x] A reutilizacao com payload diferente retorna `400 Bad Request` com mensagem amigavel de validacao.
[x] O repository de idempotencia e resetado entre testes para evitar vazamento de dados.

Validacao antes de seguir:

[x] Rodar `npm run test:e2e` dentro de `backend` e confirmar que os testes de idempotencia passam.

[x] Task 19: Criar controller e modulo de checkout

Arquivos para criar:

- `backend/src/checkout/checkout.controller.ts`
- `backend/src/checkout/checkout.module.ts`

Arquivos para alterar:

- `backend/src/app.module.ts`
- `backend/src/orders/orders.module.ts`, se for necessario exportar novos providers.
- `backend/src/products/products.module.ts`, se for necessario exportar `ProductsRepository`.

Criterios de aceitacao:

[x] O controller registra a rota `POST /checkout`.
[x] O controller le o header `Idempotency-Key`.
[x] O controller le o body no formato do contrato.
[x] O controller chama o usecase de criacao de checkout sem acessar diretamente os Maps internos dos repositories.
[x] Tentativa valida retorna `202 Accepted` com `order_id`, `status` e `message`.
[x] Falta de `Idempotency-Key` retorna erro HTTP adequado com `{ "message": "Não foi possível identificar a tentativa de compra. Tente novamente." }`.
[x] Payload invalido retorna erro HTTP adequado com mensagem amigavel, sem stack trace.
[x] Estoque insuficiente inicial retorna `409 Conflict` com `{ "message": "Não há estoque suficiente para essa quantidade." }`.
[x] `CheckoutModule` registra controller, usecases e repositories necessarios, reaproveitando `OrdersRepository` em vez de criar armazenamento paralelo de pedidos.
[x] `AppModule` importa `CheckoutModule`.

Validacao antes de seguir:

[x] Rodar `npm run test:e2e` dentro de `backend`.
[x] Confirmar que o teste geral criado na Task 12 passa ou identificar exatamente o proximo ajuste necessario.

[x] Task 20: Cobrir validacoes HTTP de checkout com testes e2e

Arquivos para alterar:

- `backend/test/checkout.e2e-spec.ts`
- `backend/src/checkout/checkout.controller.ts`
- `backend/src/checkout/use-cases/validate-checkout.use-case.ts`
- `backend/src/checkout/use-cases/create-checkout-order.use-case.ts`

Criterios de aceitacao:

[x] Existe teste para ausencia de `Idempotency-Key`, retornando mensagem `Não foi possível identificar a tentativa de compra. Tente novamente.`.
[x] Existe teste para ausencia de `items`, retornando mensagem `Dados da compra inválidos.`.
[x] Existe teste para `items` vazio, retornando mensagem `Dados da compra inválidos.`.
[x] Existe teste para payload fora do formato do contrato, retornando mensagem `Dados da compra inválidos.`.
[x] Existe teste para produto inexistente em `product_id`, retornando erro amigavel e codigo HTTP adequado.
[x] Existe teste para `quantity` ausente.
[x] Existe teste para `quantity` nao inteira.
[x] Existe teste para `quantity` menor ou igual a zero.
[x] Os cenarios de quantidade invalida retornam `{ "message": "Informe uma quantidade válida." }`.
[x] Nenhum erro de validacao retorna stack trace, classe de erro, caminho interno, mensagem tecnica ou detalhes de implementacao.

Validacao antes de seguir:

[x] Rodar `npm run test:e2e` dentro de `backend`.

[x] Task 21: Criar processamento assincrono simulado do pedido

Arquivos para criar:

- `backend/src/checkout/services/checkout-processing.service.ts`

Arquivos para alterar:

- `backend/src/checkout/use-cases/create-checkout-order.use-case.ts`
- `backend/src/checkout/checkout.module.ts`
- `backend/src/orders/repositories/orders.repository.ts`
- `backend/src/orders/domain/order.entity.ts`
- `backend/test/checkout.e2e-spec.ts`

Criterios de aceitacao:

[x] A criacao valida do checkout agenda processamento assincrono em memoria apos criar o pedido `PROCESSING`.
[x] Enquanto o processamento ainda nao terminou, `GET /orders/:order_id` retorna `PROCESSING`.
[x] Ao processar, o servico verifica novamente o estoque antes de aprovar.
[x] Se ainda houver estoque suficiente na segunda verificacao, o pedido passa para `APPROVED`.
[x] Ao aprovar, o estoque em memoria e decrementado.
[x] Se nao houver estoque suficiente na segunda verificacao, o pedido passa para `REJECTED` com mensagem `Não há estoque suficiente para essa quantidade.`.
[x] O processamento nao usa fila real, mensageria externa, banco real ou ERP real.
[x] Os testes conseguem controlar atrasos de processamento para observar `PROCESSING` e depois status final de forma deterministica.

Validacao antes de seguir:

[x] Rodar `npm run test:e2e` dentro de `backend`.

[x] Task 22: Cobrir transicao para `APPROVED` no fluxo de checkout

Arquivos para alterar:

- `backend/test/checkout.e2e-spec.ts`
- `backend/src/checkout/services/checkout-processing.service.ts`
- `backend/src/products/repositories/products.repository.ts`
- `backend/src/orders/repositories/orders.repository.ts`

Criterios de aceitacao:

[x] Existe teste e2e que cria um checkout valido com estoque suficiente.
[x] O teste aguarda o processamento simulado de forma controlada.
[x] O teste consulta `GET /orders/:order_id` ate obter `status: "APPROVED"` ou usa um mecanismo deterministico equivalente.
[x] A resposta final contem `order_id`, `status: "APPROVED"` e `message: "Compra aprovada com sucesso."`.
[x] O teste confirma que a consulta por `GET /orders/:order_id` reflete a atualizacao feita pelo processamento.
[x] O teste nao depende de sleeps longos ou temporizacoes frageis.

Validacao antes de seguir:

[x] Rodar `npm run test:e2e` dentro de `backend`.

[x] Task 23: Cobrir rejeicao por estoque insuficiente no checkout

Arquivos para alterar:

- `backend/test/checkout.e2e-spec.ts`
- `backend/src/products/repositories/products.repository.ts`
- `backend/src/checkout/services/checkout-processing.service.ts`

Criterios de aceitacao:

[x] Existe teste e2e para estoque insuficiente ja no `POST /checkout`.
[x] Quando o estoque inicial e insuficiente, o endpoint retorna `409 Conflict` com `{ "message": "Não há estoque suficiente para essa quantidade." }`.
[x] O teste confirma que nenhum pedido e criado quando o estoque inicial e insuficiente.
[x] Existe teste e2e para estoque ficar insuficiente entre a criacao do pedido e o processamento.
[x] Quando o estoque fica insuficiente durante o processamento, o pedido criado inicialmente permanece consultavel.
[x] A consulta final via `GET /orders/:order_id` retorna `status: "REJECTED"` e `message: "Não há estoque suficiente para essa quantidade."`.

Validacao antes de seguir:

[x] Rodar `npm run test:e2e` dentro de `backend`.

[x] Task 24: Implementar retries e timeout simulado de ERP

Arquivos para alterar:

- `backend/src/checkout/services/checkout-processing.service.ts`
- `backend/src/orders/domain/order.entity.ts`
- `backend/src/orders/repositories/orders.repository.ts`
- `backend/test/checkout.e2e-spec.ts`

Criterios de aceitacao:

[x] O processamento le configuracoes simples de ambiente ou valores padrao para `ERP_SIMULATE_TIMEOUT`, `ERP_PROCESSING_DELAY_MS`, `ERP_PROCESSING_TIMEOUT_MS`, `ERP_MAX_RETRIES` e `ERP_RETRY_DELAY_MS`.
[x] Quando `ERP_SIMULATE_TIMEOUT=true`, cada tentativa simula exceder o timeout esperado.
[x] Enquanto ainda houver retries disponiveis, o pedido permanece `PROCESSING`.
[x] O pedido mantem em memoria a quantidade de tentativas realizadas.
[x] Quando os retries sao esgotados, o pedido passa para `REJECTED`.
[x] A mensagem final de rejeicao por timeout e amigavel e indica que nao foi possivel processar o pedido apos novas tentativas.
[x] Existe teste e2e ou unitario controlado que cobre retries esgotados sem deixar a suite lenta.
[x] A implementacao nao retorna stack trace nem detalhes tecnicos do ERP simulado ao usuario final.

Validacao antes de seguir:

[x] Rodar `npm run test` dentro de `backend`.
[x] Rodar `npm run test:e2e` dentro de `backend`.

[x] Task 25: Revisar contrato final e validacoes tecnicas do checkout

Arquivos para criar:

- Nenhum.

Arquivos para alterar:

- Apenas os arquivos necessarios para corrigir problemas encontrados nas validacoes.

Criterios de aceitacao:

[x] `POST /checkout` recebe `items` e `Idempotency-Key` conforme `prompts/api-contract.md`.
[x] `POST /checkout` retorna `202 Accepted` para tentativa valida aceita para processamento.
[x] A resposta inicial contem `order_id`, `status: "PROCESSING"` e `message: "Pedido recebido e está sendo processado."`.
[x] O mesmo `Idempotency-Key` com o mesmo payload nao cria pedido duplicado.
[x] O mesmo `Idempotency-Key` com payload diferente retorna erro amigavel.
[x] Payloads invalidos retornam codigos HTTP adequados e mensagens amigaveis.
[x] Estoque insuficiente antes da criacao retorna `409 Conflict` e nao cria pedido.
[x] Pedido aprovado decrementa estoque em memoria.
[x] Pedido rejeitado por estoque ou timeout fica consultavel por `GET /orders/:order_id`.
[x] `GET /orders/:order_id` continua passando todos os cenarios ja implementados na etapa anterior.
[x] Nenhuma resposta retorna stack trace, classe de erro, caminho interno, mensagem tecnica ou detalhes de implementacao.
[x] A implementacao permanece em memoria e nao adiciona banco real, autenticacao, pagamento, Docker, fila real ou integracao externa.

Validacao antes de seguir:

[x] Rodar `npm run test` dentro de `backend`.
[x] Rodar `npm run test:e2e` dentro de `backend`.
[x] Rodar `npm run build` dentro de `backend`.
[x] Se o lint for executado, rodar `npm run lint` dentro de `backend` e corrigir problemas relevantes sem refatoracoes fora do escopo.
