# Instruções de front-end - Parte 1.B

## Objetivo

Implementar uma tela simples de checkout para compra de uma capinha de celular.

A prioridade é demonstrar o fluxo funcional pedido no desafio: seleção de quantidade, envio da tentativa de compra, criação de uma tentativa assíncrona, acompanhamento do processamento por polling e mensagens claras para sucesso e erro.

Não é necessário criar um e-commerce completo, autenticação, carrinho persistente, pagamento real ou múltiplas páginas.

## Referências visuais

Use as imagens em `referencias/` como direção visual para a tela de checkout:

- layout claro, limpo e direto;
- conteúdo principal organizado em cards ou áreas bem separadas;
- produto em destaque com informações essenciais;
- bloco de ação/resumo da compra com botão principal evidente;
- espaçamento confortável e hierarquia visual simples;
- aparência de checkout moderno, sem excesso de elementos decorativos.

Em desktop, prefira uma composição com duas áreas:

- à esquerda, o card/informações do produto;
- à direita, o resumo da compra e a ação de finalizar.

Em telas menores, os blocos devem empilhar verticalmente.

## Rota/tela

Criar uma única experiência principal:

- rota `/checkout`; ou
- tela principal única, caso a aplicação esteja configurada para abrir diretamente nesse fluxo.

Se houver redirecionamento da home, ele pode apontar para `/checkout`.

## Produto mockado

A tela deve exibir um produto mockado de capinha de celular com:

- nome;
- descrição curta;
- preço;
- estoque disponível.

Exemplo de produto:

```ts
const product = {
  id: 1,
  name: "Capinha Clear Case iPhone 15",
  description: "Capinha transparente com proteção reforçada nas bordas.",
  price: 79.9,
  stock: 5,
};
```

O produto pode ficar hardcoded no front-end enquanto o back-end ainda estiver simples ou em desenvolvimento.

## Controle de quantidade

A quantidade deve ser controlada por um componente de stepper, não por um input solto.

Formato esperado:

```text
[-]  1  [+]
```

Regras esperadas:

- o botão `-` diminui a quantidade;
- o botão `+` aumenta a quantidade;
- a quantidade atual aparece no meio;
- a quantidade inicial pode ser `1`;
- a interface deve evitar valores menores que `1` em uso normal;
- ainda assim, o front-end deve estar preparado para exibir erro de quantidade inválida caso a API retorne esse cenário.

## Ação principal

A tela deve ter um botão principal com o texto:

```text
Finalizar compra
```

Ao clicar, o front-end deve chamar a API de checkout enviando os itens da compra conforme o contrato definido em `prompts/api-contract.md`.

## Fluxo assíncrono do checkout

O checkout deve simular um fluxo mais próximo de uma compra real.

Do ponto de vista do front-end, o primeiro retorno da API indica que a tentativa de compra foi recebida para processamento. Ele não deve ser tratado como compra finalizada.

Depois disso, o front-end deve acompanhar o status do pedido por polling, usando TanStack Query ou mecanismo equivalente, a partir do identificador retornado pela API.

Enquanto o pedido estiver com status `PROCESSING`, o front-end deve consultar o status periodicamente, por exemplo a cada 1 ou 2 segundos. O polling deve parar quando o pedido chegar em um status final, como `APPROVED` ou `REJECTED`.

## Estados de carregamento e processamento

A interface deve diferenciar dois momentos:

### Enviando checkout

Enquanto o envio da tentativa de checkout estiver em andamento:

- o botão `Finalizar compra` deve ficar desabilitado;
- o usuário não deve conseguir enviar outra tentativa de compra;
- o texto do botão pode mudar para algo como `Finalizando...`;
- a interface deve indicar visualmente que a tentativa de compra está sendo enviada.

### Pedido em processamento

Depois que a API retornar um pedido com status `PROCESSING`:

- a tela deve mostrar a mensagem retornada pela API;
- o botão `Finalizar compra` deve continuar desabilitado para evitar compra duplicada do mesmo produto/quantidade;
- a tela deve indicar que o pedido ainda está em processamento;
- o front-end deve iniciar o polling do status do pedido;
- quando o pedido chegar em `APPROVED` ou `REJECTED`, o polling deve parar e a mensagem final retornada pela API deve ser exibida.

## Mensagens obrigatórias

As mensagens finais do fluxo de checkout devem vir da resposta da API. O front-end não deve manter essas mensagens fixas como regra de negócio.

O papel do front-end é:

- validar o input básico antes do envio, como impedir quantidade menor que `1`;
- enviar `items` com `product_id` e `quantity` para a API;
- enviar a chave de idempotência definida no contrato da API;
- ler a resposta inicial do checkout;
- exibir a mensagem retornada pelo back-end para o status `PROCESSING`;
- consultar o status do pedido por polling;
- exibir a mensagem final retornada pelo back-end para `APPROVED` ou `REJECTED`;
- usar uma mensagem genérica local apenas quando não houver resposta aproveitável da API, como erro de rede, timeout ou resposta inesperada.

O front-end deve depender do formato definido em `prompts/api-contract.md` para controlar polling e exibir feedback. Em especial, as respostas de pedido devem conter identificador do pedido, status e mensagem amigável.

### Quantidade inválida

Quando a quantidade for inválida e for barrada localmente, o front-end pode evitar o envio e mostrar uma mensagem simples. Se a API rejeitar a quantidade, o front-end deve exibir a mensagem retornada pelo back-end.

### Estoque insuficiente

Quando a API informar que não há estoque suficiente durante o processamento, o front-end deve exibir a mensagem amigável retornada pelo back-end.

### API indisponível ou erro inesperado

Quando ocorrer timeout, erro de rede, resposta inesperada ou ausência de mensagem útil da API, o front-end pode usar uma mensagem genérica local:

```text
Não foi possível concluir a compra agora. Tente novamente em instantes.
```

## Idempotência

O front-end deve colaborar com idempotência para reduzir o risco de pedidos duplicados em retentativas, cliques repetidos, timeout ou instabilidade de rede.

A responsabilidade do front-end é gerar e enviar uma chave de idempotência na tentativa de checkout, conforme o contrato definido em `prompts/api-contract.md`.

Implementação simples no front-end:

- gerar a chave no momento em que o usuário inicia a tentativa de compra;
- usar `crypto.randomUUID()` quando disponível;
- enviar a chave no header esperado pela API;
- manter a mesma chave enquanto a tentativa atual estiver em andamento ou com status `PROCESSING`;
- reutilizar a mesma chave se for necessário repetir o envio por retry da mesma tentativa;
- limpar a chave quando o pedido chegar em `APPROVED` ou `REJECTED`;
- gerar uma nova chave se o usuário iniciar uma nova tentativa de compra depois de um status final ou mudar os itens da compra.

Para este desafio, a chave pode ficar em estado local do componente, `useRef`, hook próprio, Zustand ou mecanismo equivalente. O requisito importante é preservar a mesma chave durante a tentativa atual e não reutilizá-la indevidamente em uma nova compra com payload diferente.

## Integração com a API

O front-end deve tratar as respostas da API e priorizar a mensagem retornada pelo back-end. O mapeamento por status HTTP e status do pedido deve servir para decidir o estado visual, o polling e o fallback, não para substituir mensagens válidas da API.

Interpretação dos status de pedido:

- `PROCESSING`: manter mensagem de processamento e continuar polling;
- `APPROVED`: exibir mensagem final de aprovação e parar polling;
- `REJECTED`: exibir mensagem final de rejeição e parar polling;
- erro de rede, timeout ou resposta inesperada: parar ou pausar polling e mostrar mensagem genérica local.

Não exibir stack trace, códigos técnicos crus ou mensagens internas para o usuário final. Se a API retornar uma mensagem técnica demais, o front-end deve usar uma mensagem genérica de fallback.

## Critérios de aceite do front-end

- Existe uma rota `/checkout` ou uma tela principal única equivalente.
- Existe um card de produto mockado com nome, descrição curta, preço e estoque disponível.
- Existe um stepper de quantidade no formato `[-] quantidade [+]`.
- Existe um botão `Finalizar compra`.
- O botão fica desabilitado durante o envio do checkout.
- O front-end gera uma chave de idempotência para a tentativa de compra e envia no header esperado pela API.
- A mesma chave de idempotência é mantida enquanto a tentativa estiver em andamento ou em `PROCESSING`.
- A tela informa claramente quando o pedido foi recebido e está em processamento.
- O front-end faz polling do status do pedido após receber um identificador de pedido e status `PROCESSING`.
- O polling para quando o pedido chega em `APPROVED` ou `REJECTED`.
- A tela exibe a mensagem de aprovação retornada pela API.
- A tela valida quantidade menor que `1` antes do envio e também exibe a mensagem de quantidade inválida retornada pela API.
- A tela exibe a mensagem de estoque insuficiente retornada pela API.
- A tela exibe uma mensagem genérica local apenas para API indisponível, timeout, erro inesperado ou ausência de mensagem útil da API.
- O layout é simples, responsivo e inspirado nas referências de checkout em `referencias/`.
