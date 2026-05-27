# CaseCellShop - Desafio Full Stack

Este repositório contém a implementação da parte prática do desafio: um fluxo simples de checkout para uma loja fictícia de capinhas de celular.

A proposta não foi construir um e-commerce completo, mas sim demonstrar uma jornada de compra clara, com validação de quantidade, criação de pedido, tratamento de idempotência, consulta de status e mensagens compreensíveis para o usuário.

## Visão geral

O projeto está dividido em duas aplicações:

- `frontend/`: interface de checkout feita em React.
- `backend/`: API REST feita em NestJS.

O fluxo principal é:

1. O usuário acessa a tela de checkout.
2. Escolhe a quantidade do produto.
3. O frontend envia uma tentativa de compra para `POST /checkout`.
4. A API cria um pedido com status `PROCESSING`.
5. O frontend consulta o pedido até receber o status final.
6. A compra é aprovada ou rejeitada com uma mensagem amigável.

## Tech stack

### Frontend

- React 19
- React Router v7
- Vite
- TypeScript
- Tailwind CSS v4
- TanStack React Query
- Playwright

### Backend

- NestJS 11
- TypeScript
- Jest
- Supertest
- Dados em memória para produtos, pedidos e idempotência

## Requisitos para rodar

É necessário ter instalado:

- Node.js
- npm

O projeto foi pensado para rodar localmente sem banco de dados, Docker ou serviços externos.

## Como rodar o backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Rode a API em modo desenvolvimento:

```bash
npm run start:dev
```

Por padrão, a API sobe em:

```text
http://localhost:3000
```

Endpoints principais:

- `POST /checkout`
- `GET /orders/:order_id`

## Como rodar o frontend

Em outro terminal, entre na pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Rode a aplicação:

```bash
npm run dev
```

O frontend usa por padrão a API em:

```text
http://localhost:3000
```

Se precisar apontar para outra URL, configure:

```bash
VITE_API_BASE_URL=http://localhost:3000 npm run dev
```

## Testes

### Backend

O backend usa Jest para testes unitários e Supertest para os testes E2E da API.

~~~bash
cd backend
npm run test
npm run test:unit
npm run test:e2e
~~~

Também existem scripts de apoio para qualidade e build:

~~~bash
npm run lint
npm run build
~~~

### Frontend

O frontend usa scripts de verificação para o checkout, Vitest para teste de componente e Playwright para E2E.

~~~bash
cd frontend
npm run test
npm run test:component
npm run test:e2e
~~~

Também existem scripts de apoio para qualidade e build:

~~~bash
npm run typecheck
npm run build
~~~

Na primeira execução, pode ser necessário baixar o Chromium usado pelo Playwright:

~~~bash
npx playwright install chromium
~~~

## Estrutura do backend

```text
backend/src/
  checkout/
    domain/
    repositories/
    services/
    use-cases/
    checkout.controller.ts
    checkout.module.ts
  orders/
    domain/
    repositories/
    use-cases/
    orders.controller.ts
    orders.module.ts
  products/
    domain/
    repositories/
    products.module.ts
  cors.ts
  main.ts
```

O backend foi organizado por domínio. O módulo de checkout valida o payload, aplica idempotência e cria pedidos. O módulo de orders expõe a consulta de status. O módulo de products mantém os dados simulados de produto e estoque.

Como o desafio não exige persistência real, os repositórios usam dados em memória. Isso deixa o comportamento fácil de entender e evita adicionar complexidade que não era necessária para a proposta.

## Estrutura do frontend

```text
frontend/app/
  component/
    checkout/
    product/
    stepper/
  data/
  hook/
    checkout/
  provider/
  routes/
  utils/
    checkout/
```

O frontend separa a tela em componentes visuais, hooks de fluxo e utilitários de API/view-model. A regra principal do checkout fica em `useCheckoutFlow`, enquanto os componentes cuidam da apresentação.

A tela principal está em `frontend/app/routes/checkout.tsx`.

## Contrato do checkout

O `POST /checkout` envia apenas os itens da compra:

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

Essa escolha foi intencional. Como o desafio não pede autenticação, cadastro, endereço, pagamento, dados pessoais ou qualquer outro dado real de checkout, mantive o payload enxuto e focado no que precisava ser validado: produto e quantidade.

Pelo mesmo motivo, não existe header de autenticação. O único header funcional além de `Content-Type` é o `Idempotency-Key`, usado para evitar que retentativas da mesma compra criem pedidos duplicados.

## Trade-offs e decisões

### Polling no frontend

Depois que o pedido é criado com status `PROCESSING`, o frontend consulta `GET /orders/:order_id` a cada 2 segundos usando TanStack React Query.

Para um produto real, o ideal seria implementar SSE (Server-Sent Events) ou outro mecanismo de atualização ativa. Isso reduziria consultas repetidas e deixaria a atualização de status mais eficiente.

Para este desafio, optei por polling porque é simples, fácil de avaliar e suficiente para demonstrar o fluxo assíncrono sem adicionar uma camada extra de infraestrutura.

### Dados em memória

Produtos, estoque, pedidos e chaves de idempotência ficam em memória. Isso atende ao escopo do desafio e evita a necessidade de banco de dados, migrations ou configuração externa.

### Produto fixo no checkout

Também optei por não implementar uma tela completa de visualização de produto antes do checkout. No frontend, o produto está mockado com o mesmo identificador usado no backend, e a tela já parte de uma experiência direta de compra.

Em um projeto maior, uma evolução natural seria ter uma vitrine com mais produtos, uma página de detalhes de produto e uma API para buscar os dados atualizados antes da compra. Isso permitiria refletir mudanças de estoque ou preço quando o usuário recarregasse a página, em vez de manter todas as informações do produto fixas no frontend.

Pelo escopo do desafio, mantive apenas um produto mockado no backend e concentrei a implementação no fluxo de checkout, validação, idempotência e atualização do status do pedido.

### NestJS e especificação

Eu não tinha tanta familiaridade prática com NestJS quanto com outras partes da stack. Por isso, antes de implementar, foquei em deixar uma especificação forte do comportamento esperado, dos contratos e das tarefas.

Essas instruções estão na pasta `prompts/`, incluindo:

- `prompts/general-instructions.md`
- `prompts/api-contract.md`
- `prompts/backend-instructions.md`
- `prompts/frontend-instructions.md`
- `prompts/tasks/backend.md`
- `prompts/tasks/frontend.md`

Mesmo usando esses arquivos como apoio para guiar a execução, as escolhas de arquitetura, divisão de módulos, contrato da API, idempotência, polling e simplificações de escopo foram decisões minhas.

## Observações finais

O foco da solução foi entregar uma implementação simples, legível e coerente com o desafio. A intenção foi deixar claro onde estão as regras de negócio, como o frontend reage aos estados da compra e quais simplificações foram feitas conscientemente.
