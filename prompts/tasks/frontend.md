# Tasks de Front-end - Checkout

Baseado em `prompts/frontend-instructions.md` e no contrato em `prompts/api-contract.md`.

Use `[ ]` para pendente e troque para `[x]` quando a task ou critério estiver concluído.

## Escopo

[x] Task 1: Configurar a rota principal de checkout

Critérios de aceitação:

[x] Existe uma rota `/checkout` registrada em `frontend/app/routes.ts`.
[x] A rota renderiza uma tela dedicada de checkout em `frontend/app/routes/checkout.tsx`.
[x] A home redireciona para `/checkout` ou a experiência principal abre diretamente no checkout.
[x] O título e metadados da tela deixam claro que se trata de checkout.
[x] A rota funciona em navegação direta por URL, sem depender de estado anterior.

[x] Task 2: Preparar o shell visual e layout responsivo da tela

Critérios de aceitação:

[x] A tela usa uma composição clara, limpa e direta, inspirada em `referencias/referencia1.png` e `referencias/referencia2.png`.
[x] Em desktop, o layout apresenta duas áreas principais: produto à esquerda e resumo/ação de compra à direita.
[x] Em telas menores, os blocos empilham verticalmente sem sobreposição de conteúdo.
[x] O espaçamento, alinhamento e hierarquia visual deixam produto, quantidade, resumo e ação principal fáceis de identificar.
[x] O layout evita excesso de elementos decorativos e mantém aparência de checkout moderno.
[x] A tela não exibe stack trace, mensagens técnicas cruas ou detalhes internos para o usuário final.

[x] Task 3: Criar o produto mockado do checkout

Critérios de aceitação:

[x] Existe um produto hardcoded no front-end com `id`, `name`, `description`, `price` e `stock`.
[x] O produto usa dados equivalentes a uma capinha de celular, por exemplo `Capinha Clear Case iPhone 15`.
[x] O card do produto exibe nome, descrição curta, preço formatado em reais e estoque disponível.
[x] O produto fica separado em uma constante ou módulo simples para evitar duplicação de dados na tela.
[x] A interface deixa claro que o usuário está comprando uma capinha de celular.

[x] Task 4: Implementar o stepper de quantidade

Critérios de aceitação:

[x] Existe um componente de quantidade no formato visual `[-] quantidade [+]`.
[x] O botão `-` diminui a quantidade.
[x] O botão `+` aumenta a quantidade.
[x] A quantidade atual aparece no centro do stepper.
[x] A quantidade inicial é `1`.
[x] O uso normal da interface impede quantidade menor que `1`.
[x] O botão `-` fica desabilitado quando a quantidade atual é `1`.
[x] O componente não usa um input de texto solto como controle principal.

[x] Task 5: Montar o resumo da compra e botão principal

Critérios de aceitação:

[x] Existe uma área de resumo com preço unitário, quantidade selecionada e total calculado.
[x] O total é recalculado quando a quantidade muda.
[x] Existe um botão principal com o texto `Finalizar compra`.
[x] O botão principal tem destaque visual suficiente em relação aos demais elementos.
[x] O botão fica desabilitado quando a quantidade local for inválida.
[x] O botão fica desabilitado durante o envio da tentativa de checkout.
[x] O botão fica desabilitado enquanto o pedido estiver com status `PROCESSING`.

[x] Task 6: Gerenciar chave de idempotência da tentativa de checkout

Critérios de aceitação:

[x] Existe um mecanismo para manter a chave de idempotência da tentativa atual.
[x] O mecanismo expõe ou centraliza uma ação para criar ou reutilizar a chave atual.
[x] O mecanismo usa `crypto.randomUUID()` quando disponível.
[x] O mecanismo possui fallback seguro para ambientes sem `crypto.randomUUID()`.
[x] A mesma chave é mantida enquanto a tentativa estiver sendo enviada.
[x] A mesma chave é mantida enquanto o pedido estiver com status `PROCESSING`.
[x] A chave é limpa quando o pedido chega em `APPROVED` ou `REJECTED`.
[x] Uma nova chave é gerada quando o usuário inicia uma nova tentativa após status final.
[x] Uma nova chave é gerada quando os itens da compra mudam depois de uma tentativa finalizada.

[x] Task 7: Criar cliente de API do checkout

Critérios de aceitação:

[x] Existe uma função para executar `POST /checkout`.
[x] O payload enviado segue o contrato `{ "items": [{ "product_id": 1, "quantity": quantidade }] }`.
[x] A requisição envia o header `Content-Type: application/json`.
[x] A requisição envia o header `Idempotency-Key` com a chave de idempotência da tentativa atual.
[x] Existe uma função para executar `GET /orders/:order_id`.
[x] As respostas de pedido são tipadas com `order_id`, `status` e `message`.
[x] Os status aceitos no front-end são `PROCESSING`, `APPROVED` e `REJECTED`.
[x] Erros HTTP com `message` retornada pela API preservam essa mensagem para exibição.
[x] Erros de rede, timeout, resposta inesperada ou ausência de mensagem útil usam o fallback local `Não foi possível concluir a compra agora. Tente novamente em instantes.`
[x] Mensagens técnicas demais ou internas não são exibidas diretamente ao usuário final.

[x] Task 8: Implementar envio da tentativa de checkout

Critérios de aceitação:

[x] O clique em `Finalizar compra` valida localmente se a quantidade é maior ou igual a `1`.
[x] Se a quantidade local for menor que `1`, o front-end bloqueia o envio e mostra uma mensagem simples.
[x] Em quantidade válida, o front-end gera ou reutiliza a chave de idempotência da tentativa atual.
[x] O front-end chama `POST /checkout` enviando `items` com `product_id` e `quantity`.
[x] Enquanto o POST está em andamento, o botão fica desabilitado.
[x] Enquanto o POST está em andamento, o texto do botão muda para um estado de envio, como `Finalizando...`.
[x] O usuário não consegue iniciar outra tentativa de compra durante o envio.
[x] O retorno inicial com status `PROCESSING` não é tratado como compra concluída.
[x] A mensagem retornada pela API para `PROCESSING` é exibida ao usuário.

[x] Task 9: Implementar polling do status do pedido

Critérios de aceitação:

[x] O polling começa apenas depois que o POST retorna `order_id` e status `PROCESSING`.
[x] O polling consulta `GET /orders/:order_id`.
[x] O polling usa TanStack Query ou mecanismo equivalente.
[x] O intervalo de consulta fica em torno de 1 ou 2 segundos enquanto o status for `PROCESSING`.
[x] A tela continua exibindo que o pedido está em processamento enquanto o status for `PROCESSING`.
[x] O polling para quando o pedido chega em `APPROVED`.
[x] O polling para quando o pedido chega em `REJECTED`.
[x] O polling para ou pausa em erro de rede, timeout ou resposta inesperada.
[x] O botão `Finalizar compra` permanece desabilitado durante `PROCESSING`.

[x] Task 10: Exibir mensagens de sucesso, rejeição e erro

Critérios de aceitação:

[x] Para `PROCESSING`, a tela exibe a mensagem retornada pela API.
[x] Para `APPROVED`, a tela exibe a mensagem final de aprovação retornada pela API.
[x] Para `REJECTED`, a tela exibe a mensagem final de rejeição retornada pela API.
[x] Para quantidade inválida rejeitada pela API, a tela exibe a mensagem retornada pelo back-end.
[x] Para estoque insuficiente informado pela API, a tela exibe a mensagem amigável retornada pelo back-end.
[x] Para API indisponível, timeout, erro inesperado ou ausência de mensagem útil, a tela exibe apenas a mensagem genérica local.
[x] O front-end não mantém mensagens finais de aprovação ou rejeição hardcoded como regra de negócio.
[x] O estado visual da mensagem diferencia processamento, sucesso, rejeição e erro inesperado.

[x] Task 11: Tratar idempotência em retentativas e mudanças de compra

Critérios de aceitação:

[x] Cliques repetidos durante envio não disparam múltiplos POSTs simultâneos.
[x] Uma retentativa da mesma tentativa reutiliza a mesma `Idempotency-Key`.
[x] A mesma chave é preservada se a tentativa estiver em andamento ou em `PROCESSING`.
[x] A chave é limpa ao receber `APPROVED`.
[x] A chave é limpa ao receber `REJECTED`.
[x] Após um status final, uma nova tentativa gera uma nova chave.
[x] Se a quantidade for alterada após status final, a próxima tentativa usa uma nova chave.
[x] A implementação não reutiliza uma chave antiga com payload diferente em nova compra.

[x] Task 12: Integrar TanStack Query no app, se ainda não estiver configurado

Critérios de aceitação:

[x] Existe um `QueryClient` compartilhado para a aplicação.
[x] A árvore React está envolvida por `QueryClientProvider`.
[x] A mutation de checkout usa o cliente de API criado para `POST /checkout`.
[x] A query de status usa o cliente de API criado para `GET /orders/:order_id`.
[x] O polling é controlado por estado de pedido e não roda quando não há `order_id`.
[x] O polling não continua em background depois de status final.
[x] A configuração não introduz dependências novas desnecessárias, já que `@tanstack/react-query` está instalado.

[ ] Task 13: Garantir acessibilidade básica da experiência

Critérios de aceitação:

[ ] Os botões do stepper têm nomes acessíveis claros para aumentar e diminuir quantidade.
[ ] O botão principal comunica estado desabilitado quando não pode ser usado.
[ ] Mensagens de erro, processamento e resultado são perceptíveis para leitores de tela.
[ ] Estados de loading não dependem apenas de cor.
[ ] A navegação por teclado permite operar stepper e botão principal.
[ ] O foco visual permanece perceptível em botões e controles interativos.

[ ] Task 14: Revisar responsividade e fidelidade visual

Critérios de aceitação:

[ ] A tela foi verificada em largura desktop.
[ ] A tela foi verificada em largura mobile.
[ ] Não há texto cortado dentro de botões, cards ou áreas de status.
[ ] O card do produto e o resumo da compra não se sobrepõem.
[ ] A hierarquia visual continua clara em mobile.
[ ] O checkout mantém aparência simples, moderna e próxima das referências fornecidas.

[ ] Task 15: Validar o fluxo completo contra a API

Critérios de aceitação:

[ ] O fluxo de compra aprovada foi testado do clique inicial até `APPROVED`.
[ ] O fluxo de compra rejeitada por estoque insuficiente foi testado até `REJECTED`.
[ ] O fluxo de quantidade inválida local foi testado sem chamada à API.
[ ] O fluxo de quantidade inválida retornada pela API foi testado exibindo a mensagem do back-end.
[ ] O fluxo de API indisponível ou erro inesperado foi testado exibindo a mensagem genérica local.
[ ] Foi confirmado que `POST /checkout` envia `Idempotency-Key`.
[ ] Foi confirmado que `POST /checkout` envia `items` com `product_id` e `quantity`.
[ ] Foi confirmado que o polling chama `GET /orders/:order_id`.
[ ] Foi confirmado que o polling para em `APPROVED`.
[ ] Foi confirmado que o polling para em `REJECTED`.

[ ] Task 16: Rodar validações técnicas finais

Critérios de aceitação:

[ ] `npm run typecheck` passa dentro de `frontend`.
[ ] `npm run build` passa dentro de `frontend`.
[ ] A aplicação inicia localmente com `npm run dev`.
[ ] A rota `/checkout` abre sem erro no navegador.
[ ] O console do navegador não mostra erros relevantes durante o fluxo principal.
[ ] O código final não deixa imports, estados ou componentes mortos.
[ ] O arquivo `prompts/frontend-instructions.md` permanece respeitado integralmente.
