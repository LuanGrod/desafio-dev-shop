# Instruções de back-end - Parte 1.B

## Objetivo

Implementar uma API simples para criar uma tentativa de compra de capinhas de celular. A API deve representar produtos e estoque em memória, validar os dados recebidos e responder com códigos HTTP adequados para cada cenário.

Não é necessário usar banco de dados real, autenticação, pagamento, Docker ou integração real com ERP.

## Endpoint principal

A API deve expor um endpoint para criar uma tentativa de compra:

```http
POST /checkout
```

## Entrada esperada

O endpoint deve receber os dados mínimos necessários para processar a compra:

- identificador do produto;
- quantidade desejada.

Exemplo de payload:

```json
{
  "productId": "case-iphone-15",
  "quantity": 2
}
```

## Dados em memória

O back-end deve possuir uma representação simples de produtos e estoque. Cada produto pode ter:

- `id`;
- `name`;
- `price`;
- `stock`.

Exemplo:

```json
{
  "id": "case-iphone-15",
  "name": "Capinha Transparente iPhone 15",
  "price": 59.9,
  "stock": 10
}
```

## Validações obrigatórias

A API deve validar entradas inválidas, incluindo:

- produto inexistente;
- quantidade ausente;
- quantidade menor ou igual a zero;
- quantidade maior que o estoque disponível;
- tipos de dados incorretos.

## Respostas HTTP

As respostas devem diferenciar sucesso e erro de forma clara.

Sugestão de contrato:

- `201 Created` ou `200 OK` para compra criada com sucesso;
- `400 Bad Request` para dados inválidos;
- `404 Not Found` para produto inexistente;
- `409 Conflict` para estoque insuficiente;
- `503 Service Unavailable` para simular indisponibilidade da API ou serviço externo.

## Resposta de sucesso

Em caso de sucesso, a API deve retornar uma mensagem clara e dados mínimos da compra.

Exemplo:

```json
{
  "message": "Compra realizada com sucesso.",
  "order": {
    "productId": "case-iphone-15",
    "quantity": 2,
    "total": 119.8
  }
}
```

## Resposta de erro

Em caso de erro, a API deve retornar uma mensagem compreensível para que o front-end consiga informar o usuário.

Exemplo:

```json
{
  "message": "Não há estoque suficiente para essa quantidade."
}
```

## Testes desejáveis

É desejável incluir testes automatizados para o endpoint de checkout. Cenários importantes:

- compra com sucesso;
- quantidade inválida;
- estoque insuficiente;
- produto inexistente;
- falha simulada da API.
