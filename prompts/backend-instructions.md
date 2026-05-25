# Instruções de back-end - Parte 1.B

## Objetivo

Implementar, no projeto NestJS em `backend/`, uma API simples de checkout para compra de capinhas de celular.

A API deve usar dados em memória, validar a tentativa de compra, criar um pedido em processamento, permitir consulta posterior do status do pedido e retornar mensagens amigáveis para o front-end.

Não é necessário usar banco de dados real, autenticação, pagamento, Docker, fila real, mensageria externa ou integração real com ERP.

## Contrato de referência

O contrato que deve guiar a implementação está em:

```text
prompts/api-contract.md
```

Este arquivo de instruções resume as expectativas do back-end, mas o formato de request, response, headers e status de pedido deve seguir o contrato da API.

## Endpoints obrigatórios

A API deve expor dois endpoints principais:

```http
POST /checkout
GET /orders/:order_id
```

## POST /checkout

Cria uma tentativa de compra e retorna rapidamente um pedido com status inicial `PROCESSING`.

O retorno inicial não significa compra aprovada. Ele significa que o pedido foi aceito para processamento assíncrono simulado.

### Headers

O endpoint deve exigir:

```http
Idempotency-Key: <uuid>
Content-Type: application/json
```

A chave de idempotência deve impedir que retentativas da mesma tentativa criem pedidos duplicados.

### Entrada esperada

O payload esperado deve usar `items`, conforme o contrato:

```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

Para esta tarefa, é aceitável suportar apenas um item na compra, desde que o formato continue sendo uma lista em `items`.

### Sucesso inicial

Quando a tentativa for válida, retornar `202 Accepted` com:

```json
{
  "order_id": 123,
  "status": "PROCESSING",
  "message": "Pedido recebido e está sendo processado."
}
```

O pedido deve ser salvo em memória, associado à `Idempotency-Key` e ao payload recebido.

### Idempotência

Se o `POST /checkout` for chamado novamente com a mesma `Idempotency-Key` e o mesmo payload, a API deve retornar o mesmo pedido já criado, sem criar um novo pedido.

Se a mesma chave for reutilizada com payload diferente, a API pode rejeitar a requisição com `400 Bad Request` e uma mensagem amigável.

Uma implementação simples pode manter em memória um mapa por chave de idempotência contendo:

- chave;
- assinatura ou cópia do payload original;
- `order_id` criado;
- status atual do pedido.

## GET /orders/:order_id

Consulta o status de um pedido criado anteriormente.

Enquanto o pedido ainda estiver em processamento, retornar:

```json
{
  "order_id": 123,
  "status": "PROCESSING",
  "message": "Pedido recebido e está sendo processado."
}
```

Quando o processamento simulado terminar, retornar um status final:

```json
{
  "order_id": 123,
  "status": "APPROVED",
  "message": "Compra aprovada com sucesso."
}
```

ou:

```json
{
  "order_id": 123,
  "status": "REJECTED",
  "message": "Não há estoque suficiente para essa quantidade."
}
```

Se o pedido não existir, retornar `404 Not Found`:

```json
{
  "message": "Pedido não encontrado."
}
```

## Status de pedido

Os status esperados são:

- `PROCESSING`: pedido recebido e ainda em processamento;
- `APPROVED`: compra aprovada;
- `REJECTED`: compra rejeitada.

O front-end fará polling em `GET /orders/:order_id` enquanto o status for `PROCESSING` e deve parar quando receber `APPROVED` ou `REJECTED`.

## Dados em memória

O back-end deve possuir uma representação simples de produtos e estoque em memória.

Exemplo:

```ts
const products = [
  {
    id: 1,
    name: "Capinha Clear Case iPhone 15",
    price: 79.9,
    stock: 5,
  },
];
```

Também é necessário manter pedidos em memória, por exemplo:

- `order_id`;
- itens comprados;
- status;
- mensagem atual;
- chave de idempotência;
- data de criação, se for útil.

## Processamento assíncrono simulado

Depois de criar um pedido válido com status `PROCESSING`, a API deve simular o processamento da compra em memória.

Pode ser usado `setTimeout`, uma fila simples local ou outra abordagem equivalente.

Durante o processamento, a API deve decidir se o pedido será:

- `APPROVED`, quando houver estoque suficiente;
- `REJECTED`, quando não houver estoque suficiente.

Ao aprovar a compra, o estoque em memória deve ser decrementado.

Para manter o desafio simples, a verificação de estoque pode acontecer:

- já no `POST /checkout`, rejeitando com `409 Conflict`; ou
- durante o processamento simulado, retornando inicialmente `PROCESSING` e depois `REJECTED` no `GET /orders/:order_id`.

O comportamento escolhido deve ser claro e consistente.

## Validações obrigatórias

A API deve validar:

- ausência do header `Idempotency-Key`;
- ausência de `items`;
- `items` vazio;
- produto inexistente em `product_id`;
- `quantity` ausente;
- `quantity` que não seja número inteiro;
- `quantity` menor ou igual a zero;
- payload inválido ou em formato diferente do contrato;
- reutilização da mesma chave de idempotência com payload diferente;
- pedido inexistente no `GET /orders/:order_id`.

## Respostas HTTP esperadas

Usar códigos HTTP claros:

- `202 Accepted` para tentativa válida criada ou retentativa idempotente ainda em processamento;
- `200 OK` para consulta de pedido em `GET /orders/:order_id`;
- `400 Bad Request` para dados inválidos ou ausência da chave de idempotência;
- `404 Not Found` para produto ou pedido inexistente;
- `409 Conflict` para estoque insuficiente, caso a implementação barre esse caso já no `POST /checkout`;
- `500 Internal Server Error` para erro inesperado tratado com mensagem genérica;
- `503 Service Unavailable` apenas se a implementação decidir simular indisponibilidade da API ou de serviço externo.

Não retornar stack trace, detalhes internos ou mensagens técnicas para o usuário final.

## Mensagens amigáveis

As respostas devem conter mensagens compreensíveis para que o front-end consiga informar o usuário.

Mensagens esperadas ou equivalentes:

```json
{
  "message": "Pedido recebido e está sendo processado."
}
```

```json
{
  "message": "Compra aprovada com sucesso."
}
```

```json
{
  "message": "Informe uma quantidade válida."
}
```

```json
{
  "message": "Não há estoque suficiente para essa quantidade."
}
```

```json
{
  "message": "Não foi possível identificar a tentativa de compra. Tente novamente."
}
```

```json
{
  "message": "Não foi possível concluir a compra agora. Tente novamente em instantes."
}
```

## Organização sugerida no NestJS

Como o projeto em `backend/` ainda é basicamente o scaffold do NestJS, uma organização simples é suficiente:

- um controller para `POST /checkout` e `GET /orders/:order_id`;
- um service com produtos, pedidos, idempotência e processamento simulado em memória;
- DTOs para validar o payload de checkout;
- tipos ou enums para os status `PROCESSING`, `APPROVED` e `REJECTED`.

Não é necessário criar uma arquitetura complexa para esta mini-tarefa.

## Testes desejáveis

É desejável incluir testes automatizados para os cenários principais:

- criação de pedido com `202 Accepted` e status `PROCESSING`;
- consulta de pedido em processamento;
- transição para `APPROVED`;
- transição para `REJECTED` por estoque insuficiente;
- quantidade inválida;
- produto inexistente;
- ausência de `Idempotency-Key`;
- retentativa com a mesma chave e mesmo payload retornando o mesmo pedido;
- mesma chave com payload diferente retornando erro;
- pedido inexistente em `GET /orders/:order_id`.

## Critérios de aceite do back-end

- `POST /checkout` recebe `items` e `Idempotency-Key` conforme `prompts/api-contract.md`.
- `POST /checkout` retorna `order_id`, `status` e `message`.
- O status inicial de uma tentativa válida é `PROCESSING`.
- `GET /orders/:order_id` retorna o status atual do pedido.
- O pedido chega a um status final `APPROVED` ou `REJECTED`.
- A mesma chave de idempotência não cria pedidos duplicados para o mesmo payload.
- Payloads inválidos retornam códigos HTTP adequados e mensagens amigáveis.
- Produto, estoque, pedidos e idempotência podem funcionar inteiramente em memória.

## Patterns e decisões de arquitetura sugeridos

Como este é um desafio avaliado, a implementação não deve deixar toda a regra de negócio concentrada diretamente nos controllers ou em arquivos soltos. A ideia é manter uma arquitetura simples, mas com fronteiras claras o suficiente para demonstrar organização, testabilidade e raciocínio de evolução.

### Camadas principais

Uma separação recomendada é:

- **Controllers**: recebem requisições HTTP, extraem headers, params e body, chamam os casos de uso e traduzem erros conhecidos para respostas HTTP. Não devem conter regra de negócio de checkout, estoque, idempotência ou fila.
- **Use cases**: concentram o fluxo de negócio. Exemplos: criar tentativa de checkout, consultar pedido, processar próximo pedido da fila. Devem ser fáceis de testar sem HTTP.
- **Repositories em memória**: encapsulam leitura e escrita dos dados em memória, como produtos, estoque, pedidos e chaves de idempotência. Mesmo sem banco real, o restante da aplicação deve depender de uma interface clara de persistência.
- **Queue em memória**: representa pedidos pendentes de processamento. A fila pode ser simples, local e baseada em arrays, mas deve deixar claro que em um ambiente real poderia ser substituída por uma fila externa.
- **Transaction manager em memória**: simula uma unidade atômica de alteração para operações sensíveis, principalmente reserva/decremento de estoque e mudança de status do pedido.

Essa divisão deve ser pragmática. Não é necessário criar uma arquitetura grande, mas cada arquivo deve ter uma responsabilidade compreensível.

### Transações simuladas

Mesmo usando memória, é interessante simular uma transação para demonstrar o cuidado com consistência.

A ideia é que a aprovação de um pedido aconteça como uma operação atômica:

1. carregar pedido e produto;
2. validar status atual do pedido;
3. validar estoque disponível;
4. decrementar estoque;
5. atualizar pedido para `APPROVED`;
6. confirmar as alterações.

Se qualquer etapa falhar, o estado deve permanecer consistente e o pedido deve ser marcado como `REJECTED` ou retornar erro controlado, conforme o caso.

Em um sistema real, essa responsabilidade seria coberta por transações do banco de dados, locks otimistas/pessimistas ou uma estratégia de reserva de estoque. No desafio, a simulação serve para explicitar o raciocínio sem adicionar infraestrutura real.

### Fila e processamento assíncrono

O `POST /checkout` deve criar o pedido e colocá-lo em uma fila em memória. O processamento pode acontecer por um worker simples dentro da aplicação, usando `setTimeout`, `setInterval` ou uma função que consuma a fila.

A fila deve permitir demonstrar alguns cenários:

- pedido processado rapidamente e aprovado;
- pedido processado com atraso maior, mantendo `PROCESSING` por mais tempo;
- pedido rejeitado por estoque insuficiente;
- pedido que falha durante o processamento e termina como `REJECTED` com mensagem amigável;
- pedido que fica sem processamento por tempo suficiente para o front-end demonstrar polling e estado de espera.

Para não deixar o comportamento imprevisível demais nos testes, a aleatoriedade deve ficar isolada em um serviço ou estratégia configurável. Em testes, usar resultados determinísticos.

### Simulação controlada de cenários

É aceitável usar porcentagens para simular condições de mundo real, por exemplo:

- parte dos pedidos processa em poucos segundos;
- parte dos pedidos tem delay maior;
- parte dos pedidos falha por indisponibilidade simulada;
- parte dos pedidos permanece em `PROCESSING` por mais tempo.

Essa simulação deve ser simples e documentada. O objetivo é demonstrar estados assíncronos, não criar instabilidade difícil de testar.

Uma abordagem mais elegante é separar a decisão em uma interface ou função, como `ProcessingScenarioResolver`, que retorna o cenário de processamento. Assim, em produção local ela pode usar probabilidade, e nos testes pode retornar cenários fixos.

### Incrementos que valorizam a solução

Alguns incrementos ajudam a solução a parecer mais profissional sem fugir do escopo:

- definir interfaces para repositories, mesmo que a implementação seja em memória;
- usar erros de domínio nomeados, como `InvalidCheckoutError`, `InsufficientStockError` e `IdempotencyConflictError`;
- centralizar mensagens amigáveis e evitar expor detalhes técnicos;
- manter os status do pedido em enum ou union type;
- registrar eventos simples em memória ou logs, como `ORDER_CREATED`, `ORDER_PROCESSING_STARTED`, `ORDER_APPROVED` e `ORDER_REJECTED`;
- escrever testes unitários para use cases e testes e2e para os endpoints principais;
- deixar explícito no README ou nos comentários que fila, repositório e transação são substituíveis por banco, fila externa e transaction real em uma arquitetura de produção.

### Estrutura sugerida de pastas

Uma estrutura possível para deixar a intenção arquitetural visível:

```text
src/
  checkout/
    controllers/
    dto/
    use-cases/
    domain/
    repositories/
    queue/
    transactions/
```

A estrutura pode ser ajustada ao padrão do NestJS, mas a separação deve deixar claro onde ficam entrada HTTP, regras de negócio, estado em memória, fila e transação simulada.

### Ports e adapters

Repositories, fila e transaction manager devem ser acessados por contratos simples. A implementação concreta pode ser em memória, mas os use cases não devem depender diretamente de arrays globais ou detalhes de armazenamento.

Exemplos de contratos úteis:

- `ProductRepository`: busca produto e atualiza estoque;
- `OrderRepository`: cria pedido, consulta pedido e atualiza status;
- `IdempotencyRepository`: registra e consulta chaves de idempotência;
- `CheckoutQueue`: enfileira e consome pedidos pendentes;
- `TransactionManager`: executa uma operação crítica de forma atômica para a simulação em memória.

Isso mostra que a solução foi pensada para evoluir. Em um cenário real, esses adapters poderiam ser substituídos por banco de dados, Redis, BullMQ, SQS ou outro componente externo sem reescrever os use cases.

### Modelo de domínio e invariantes

O domínio deve deixar explícitas as regras que não podem ser quebradas:

- pedido criado começa como `PROCESSING`;
- pedido em status final não volta para `PROCESSING`;
- pedido `APPROVED` não deve ser aprovado novamente;
- estoque nunca deve ficar negativo;
- decremento de estoque só acontece quando o pedido é aprovado;
- a mesma `Idempotency-Key` com o mesmo payload retorna o mesmo pedido;
- a mesma `Idempotency-Key` com payload diferente deve ser rejeitada;
- erro interno ou falha simulada não deve expor detalhes técnicos ao usuário.

Essas invariantes podem ficar em entidades, funções de domínio ou use cases, desde que estejam cobertas por testes.

### Concorrência e consistência

Mesmo sem banco real, a implementação deve demonstrar cuidado com concorrência. O caso mais importante é evitar que dois pedidos aprovados consumam o mesmo estoque e deixem o produto com quantidade negativa.

A transação simulada pode resolver isso criando uma seção crítica em memória para a aprovação do pedido. Em produção, esse papel seria feito com transaction real do banco, lock pessimista, lock otimista por versão ou uma reserva de estoque com expiração.

### Configuração dos cenários simulados

A simulação de delays, falhas e pedidos que demoram para processar deve ficar centralizada e configurável. Evitar chamadas aleatórias espalhadas pelos use cases.

Uma boa divisão é ter um `ProcessingScenarioResolver`, responsável por decidir o cenário de cada pedido. Em execução local, ele pode usar porcentagens. Em testes, ele deve aceitar cenários determinísticos para evitar flakiness.

Exemplos de cenários:

- processamento rápido aprovado;
- processamento lento aprovado;
- rejeição por estoque;
- falha simulada com mensagem amigável;
- permanência em `PROCESSING` por mais tempo para validar polling.

### Observabilidade simples

Mesmo em um desafio pequeno, vale registrar eventos importantes no log da aplicação. Os logs devem ajudar a entender o fluxo sem expor dados sensíveis ou stack traces para o usuário final.

Eventos úteis:

- `ORDER_CREATED`;
- `ORDER_ENQUEUED`;
- `ORDER_PROCESSING_STARTED`;
- `ORDER_APPROVED`;
- `ORDER_REJECTED`;
- `IDEMPOTENCY_REPLAYED`;
- `IDEMPOTENCY_CONFLICT`.

Quando possível, incluir `order_id` e `Idempotency-Key` nos logs internos para facilitar rastreio durante a avaliação.

### Tratamento padronizado de erros

Erros de negócio devem ser representados por tipos conhecidos e traduzidos para HTTP em uma camada próxima ao controller, como um mapper ou exception filter.

Exemplos:

- `InvalidCheckoutError` vira `400 Bad Request`;
- `ProductNotFoundError` vira `404 Not Found`;
- `InsufficientStockError` vira `409 Conflict` ou `REJECTED`, dependendo do momento da validação;
- `IdempotencyConflictError` vira `400 Bad Request`;
- erro inesperado vira `500 Internal Server Error` com mensagem genérica.

O contrato de resposta deve continuar simples e amigável para o front-end, normalmente com `message` e, quando for pedido, `order_id` e `status`.

### Ciclo de vida do estado em memória

Como pedidos, estoque e chaves de idempotência ficam em memória, a documentação ou README deve explicar que esses dados são perdidos ao reiniciar a aplicação.

Também é aceitável implementar uma limpeza simples de pedidos e chaves antigas, como TTL em memória. Isso não é obrigatório para o desafio, mas mostra consciência de ciclo de vida e evita que a solução pareça depender de estado infinito.

Esses patterns devem servir à clareza. Se alguma abstração não ajudar a entender, testar ou evoluir o fluxo de checkout, ela deve ser evitada.
