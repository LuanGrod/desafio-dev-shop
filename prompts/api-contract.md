# Contrato da API - Checkout

## Objetivo

Definir o contrato mínimo entre front-end e back-end para a mini-tarefa de checkout da Parte 1.B.

O contrato prioriza simplicidade, mensagens compreensíveis para o usuário e separação clara entre:

- validação inicial da tentativa de compra;
- criação de um pedido em processamento;
- consulta posterior do status final do pedido.

## Produto e estoque

A aplicação pode usar dados em memória. Não é necessário banco real.

Deve existir pelo menos uma representação simples de produto e estoque, por exemplo:

```ts
const product = {
  id: 1,
  name: "Capinha Clear Case iPhone 15",
  price: 79.9,
  stock: 5,
};
```

## POST /checkout

Cria uma tentativa de compra.

### Headers

```http
Idempotency-Key: <uuid>
Content-Type: application/json
```

A chave de idempotência identifica uma tentativa de compra. O back-end deve garantir que a mesma chave não crie dois pedidos diferentes em retentativas da mesma operação.

### Request

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

### Regras mínimas de validação

- `Idempotency-Key` deve estar presente.
- `items` deve existir e ter pelo menos um item.
- `product_id` deve identificar um produto existente.
- `quantity` deve ser um número inteiro maior que `0`.
- A API deve rejeitar payloads inválidos com resposta HTTP adequada e mensagem amigável.

### Sucesso inicial

Quando a tentativa de compra for válida, a API deve criar um pedido em memória, associá-lo à chave de idempotência e retornar rapidamente que ele foi recebido para processamento.

Status HTTP sugerido: `202 Accepted`.

```json
{
  "order_id": 123,
  "status": "PROCESSING",
  "message": "Pedido recebido e está sendo processado."
}
```

O retorno inicial não significa compra aprovada. Ele significa apenas que o pedido entrou em processamento.

### Retentativa com a mesma chave

Se o `POST /checkout` for repetido com a mesma `Idempotency-Key` e o mesmo payload, a API deve retornar o mesmo pedido já criado, em vez de criar uma nova tentativa.

Resposta sugerida:

```json
{
  "order_id": 123,
  "status": "PROCESSING",
  "message": "Pedido recebido e está sendo processado."
}
```

Se a mesma chave for reutilizada com payload diferente, a API pode rejeitar a requisição com erro de validação.

### Erro de validação

Status HTTP sugerido: `400 Bad Request`.

```json
{
  "message": "Dados da compra inválidos."
}
```

Para quantidade inválida, usar mensagem amigável específica:

```json
{
  "message": "Informe uma quantidade válida."
}
```

Para ausência de chave de idempotência:

```json
{
  "message": "Não foi possível identificar a tentativa de compra. Tente novamente."
}
```

### Estoque insuficiente antes da criação do pedido

Se a implementação decidir barrar estoque insuficiente já no `POST /checkout`, use:

Status HTTP sugerido: `409 Conflict`.

```json
{
  "message": "Não há estoque suficiente para essa quantidade."
}
```

Se a verificação de estoque acontecer apenas durante o processamento assíncrono, o `POST /checkout` pode retornar `PROCESSING` e a rejeição deve aparecer no `GET /orders/:order_id`.

### Erro inesperado

Status HTTP sugerido: `500 Internal Server Error`.

```json
{
  "message": "Não foi possível concluir a compra agora. Tente novamente em instantes."
}
```

Não retornar stack trace, detalhes internos ou mensagens técnicas para o usuário final.

## GET /orders/:order_id

Consulta o status de um pedido criado anteriormente.

### Pedido em processamento

Status HTTP sugerido: `200 OK`.

```json
{
  "order_id": 123,
  "status": "PROCESSING",
  "message": "Pedido recebido e está sendo processado."
}
```

### Compra aprovada

Status HTTP sugerido: `200 OK`.

```json
{
  "order_id": 123,
  "status": "APPROVED",
  "message": "Compra aprovada com sucesso."
}
```

### Compra rejeitada

Status HTTP sugerido: `200 OK`.

```json
{
  "order_id": 123,
  "status": "REJECTED",
  "message": "Não há estoque suficiente para essa quantidade."
}
```

### Pedido não encontrado

Status HTTP sugerido: `404 Not Found`.

```json
{
  "message": "Pedido não encontrado."
}
```

## Status de pedido

Status esperados:

- `PROCESSING`: pedido recebido e ainda em processamento;
- `APPROVED`: compra aprovada;
- `REJECTED`: compra rejeitada.

O front-end deve continuar o polling enquanto o status for `PROCESSING` e parar quando receber `APPROVED` ou `REJECTED`.

## Decisão de simplicidade

Para esta mini-tarefa, o processamento pode ser simulado em memória com `setTimeout`, fila simples ou outra abordagem local equivalente. Não é necessário usar fila real, mensageria externa, banco de dados, autenticação, pagamento ou integração com ERP.
