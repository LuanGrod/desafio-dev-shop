# Tasks de Front-end - Checkout

Baseado em `prompts/frontend-instructions.md` e no contrato em `prompts/api-contract.md`.

Use `[ ]` para pendente e troque para `[x]` quando a task ou critério estiver concluído.

## Escopo

[ ] Task 1: Configurar a rota principal de checkout

Critérios de aceitação:

[ ] Existe uma rota `/checkout` registrada em `frontend/app/routes.ts`.
[ ] A rota renderiza uma tela dedicada de checkout em `frontend/app/routes/checkout.tsx`.
[ ] A home redireciona para `/checkout` ou a experiência principal abre diretamente no checkout.
[ ] O título e metadados da tela deixam claro que se trata de checkout.
[ ] A rota funciona em navegação direta por URL, sem depender de estado anterior.

[ ] Task 2: Preparar o shell visual e layout responsivo da tela

Critérios de aceitação:

[ ] A tela usa uma composição clara, limpa e direta, inspirada em `referencias/referencia1.png` e `referencias/referencia2.png`.
[ ] Em desktop, o layout apresenta duas áreas principais: produto à esquerda e resumo/ação de compra à direita.
[ ] Em telas menores, os blocos empilham verticalmente sem sobreposição de conteúdo.
[ ] O espaçamento, alinhamento e hierarquia visual deixam produto, quantidade, resumo e ação principal fáceis de identificar.
[ ] O layout evita excesso de elementos decorativos e mantém aparência de checkout moderno.
[ ] A tela não exibe stack trace, mensagens técnicas cruas ou detalhes internos para o usuário final.

[ ] Task 3: Criar o produto mockado do checkout

Critérios de aceitação:

[ ] Existe um produto hardcoded no front-end com `id`, `name`, `description`, `price` e `stock`.
[ ] O produto usa dados equivalentes a uma capinha de celular, por exemplo `Capinha Clear Case iPhone 15`.
[ ] O card do produto exibe nome, descrição curta, preço formatado em reais e estoque disponível.
[ ] O produto fica separado em uma constante ou módulo simples para evitar duplicação de dados na tela.
[ ] A interface deixa claro que o usuário está comprando uma capinha de celular.

[ ] Task 4: Implementar o stepper de quantidade

Critérios de aceitação:

[ ] Existe um componente de quantidade no formato visual `[-] quantidade [+]`.
[ ] O botão `-` diminui a quantidade.
[ ] O botão `+` aumenta a quantidade.
[ ] A quantidade atual aparece no centro do stepper.
[ ] A quantidade inicial é `1`.
[ ] O uso normal da interface impede quantidade menor que `1`.
[ ] O botão `-` fica desabilitado quando a quantidade atual é `1`.
[ ] O componente não usa um input de texto solto como controle principal.

[ ] Task 5: Montar o resumo da compra e botão principal

Critérios de aceitação:

[ ] Existe uma área de resumo com preço unitário, quantidade selecionada e total calculado.
[ ] O total é recalculado quando a quantidade muda.
[ ] Existe um botão principal com o texto `Finalizar compra`.
[ ] O botão principal tem destaque visual suficiente em relação aos demais elementos.
[ ] O botão fica desabilitado quando a quantidade local for inválida.
[ ] O botão fica desabilitado durante o envio da tentativa de checkout.
[ ] O botão fica desabilitado enquanto o pedido estiver com status `PROCESSING`.

[ ] Task 6: Criar store Zustand para a tentativa de checkout

Critérios de aceitação:

[ ] Existe uma store Zustand para manter a chave de idempotência da tentativa atual.
[ ] A store expõe uma ação para criar ou reutilizar a chave atual.
[ ] A store usa `crypto.randomUUID()` quando disponível.
[ ] A store possui fallback seguro para ambientes sem `crypto.randomUUID()`.
[ ] A mesma chave é mantida enquanto a tentativa estiver sendo enviada.
[ ] A mesma chave é mantida enquanto o pedido estiver com status `PROCESSING`.
[ ] A chave é limpa quando o pedido chega em `APPROVED` ou `REJECTED`.
[ ] Uma nova chave é gerada quando o usuário inicia uma nova tentativa após status final.
[ ] Uma nova chave é gerada quando os itens da compra mudam depois de uma tentativa finalizada.

[ ] Task 7: Criar cliente de API do checkout

Critérios de aceitação:

[ ] Existe uma função para executar `POST /checkout`.
[ ] O payload enviado segue o contrato `{ "items": [{ "product_id": 1, "quantity": quantidade }] }`.
[ ] A requisição envia o header `Content-Type: application/json`.
[ ] A requisição envia o header `Idempotency-Key` com a chave mantida no Zustand.
[ ] Existe uma função para executar `GET /orders/:order_id`.
[ ] As respostas de pedido são tipadas com `order_id`, `status` e `message`.
[ ] Os status aceitos no front-end são `PROCESSING`, `APPROVED` e `REJECTED`.
[ ] Erros HTTP com `message` retornada pela API preservam essa mensagem para exibição.
[ ] Erros de rede, timeout, resposta inesperada ou ausência de mensagem útil usam o fallback local `Não foi possível concluir a compra agora. Tente novamente em instantes.`
[ ] Mensagens técnicas demais ou internas não são exibidas diretamente ao usuário final.

[ ] Task 8: Implementar envio da tentativa de checkout

Critérios de aceitação:

[ ] O clique em `Finalizar compra` valida localmente se a quantidade é maior ou igual a `1`.
[ ] Se a quantidade local for menor que `1`, o front-end bloqueia o envio e mostra uma mensagem simples.
[ ] Em quantidade válida, o front-end gera ou reutiliza a chave de idempotência da tentativa atual.
[ ] O front-end chama `POST /checkout` enviando `items` com `product_id` e `quantity`.
[ ] Enquanto o POST está em andamento, o botão fica desabilitado.
[ ] Enquanto o POST está em andamento, o texto do botão muda para um estado de envio, como `Finalizando...`.
[ ] O usuário não consegue iniciar outra tentativa de compra durante o envio.
[ ] O retorno inicial com status `PROCESSING` não é tratado como compra concluída.
[ ] A mensagem retornada pela API para `PROCESSING` é exibida ao usuário.

[ ] Task 9: Implementar polling do status do pedido

Critérios de aceitação:

[ ] O polling começa apenas depois que o POST retorna `order_id` e status `PROCESSING`.
[ ] O polling consulta `GET /orders/:order_id`.
[ ] O polling usa TanStack Query ou mecanismo equivalente.
[ ] O intervalo de consulta fica em torno de 1 ou 2 segundos enquanto o status for `PROCESSING`.
[ ] A tela continua exibindo que o pedido está em processamento enquanto o status for `PROCESSING`.
[ ] O polling para quando o pedido chega em `APPROVED`.
[ ] O polling para quando o pedido chega em `REJECTED`.
[ ] O polling para ou pausa em erro de rede, timeout ou resposta inesperada.
[ ] O botão `Finalizar compra` permanece desabilitado durante `PROCESSING`.

[ ] Task 10: Exibir mensagens de sucesso, rejeição e erro

Critérios de aceitação:

[ ] Para `PROCESSING`, a tela exibe a mensagem retornada pela API.
[ ] Para `APPROVED`, a tela exibe a mensagem final de aprovação retornada pela API.
[ ] Para `REJECTED`, a tela exibe a mensagem final de rejeição retornada pela API.
[ ] Para quantidade inválida rejeitada pela API, a tela exibe a mensagem retornada pelo back-end.
[ ] Para estoque insuficiente informado pela API, a tela exibe a mensagem amigável retornada pelo back-end.
[ ] Para API indisponível, timeout, erro inesperado ou ausência de mensagem útil, a tela exibe apenas a mensagem genérica local.
[ ] O front-end não mantém mensagens finais de aprovação ou rejeição hardcoded como regra de negócio.
[ ] O estado visual da mensagem diferencia processamento, sucesso, rejeição e erro inesperado.

[ ] Task 11: Tratar idempotência em retentativas e mudanças de compra

Critérios de aceitação:

[ ] Cliques repetidos durante envio não disparam múltiplos POSTs simultâneos.
[ ] Uma retentativa da mesma tentativa reutiliza a mesma `Idempotency-Key`.
[ ] A mesma chave é preservada se a tentativa estiver em andamento ou em `PROCESSING`.
[ ] A chave é limpa ao receber `APPROVED`.
[ ] A chave é limpa ao receber `REJECTED`.
[ ] Após um status final, uma nova tentativa gera uma nova chave.
[ ] Se a quantidade for alterada após status final, a próxima tentativa usa uma nova chave.
[ ] A implementação não reutiliza uma chave antiga com payload diferente em nova compra.

[ ] Task 12: Integrar TanStack Query no app, se ainda não estiver configurado

Critérios de aceitação:

[ ] Existe um `QueryClient` compartilhado para a aplicação.
[ ] A árvore React está envolvida por `QueryClientProvider`.
[ ] A mutation de checkout usa o cliente de API criado para `POST /checkout`.
[ ] A query de status usa o cliente de API criado para `GET /orders/:order_id`.
[ ] O polling é controlado por estado de pedido e não roda quando não há `order_id`.
[ ] O polling não continua em background depois de status final.
[ ] A configuração não introduz dependências novas desnecessárias, já que `@tanstack/react-query` está instalado.

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
