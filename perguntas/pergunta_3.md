# Pergunta 3 — SDD: Spec-Driven Development
Imagine que você precisa implementar o endpoint POST /checkout que finaliza a compra. Antes de
codificar:

## Que informações esse endpoint precisa receber?

Eu imagino que esse contrato do endpoint de checkout receberia informações como:

- identificador do cliente, geralmente no header via bearer token, usado para autenticar o usuário no sistema.
- informações da compra/carrinho, como os produtos, quantidades, o endereço de entrega, método de pagamento, etc.

Considerando que é um processo que envolve transações financeiras temos que ter um cuidado a mais, por isso eu também consideraria um identificador dessa requisição para caso eu aplique idempotência, essa chave seria usada para identificar essa requisição, evitando que o mesmo pedido seja processado multiplas vezes, seja por multiplos cliques do usuario (o que era para o frontend bloquear mas pode ser que não esteja bloqueando), ou por algum outro erro.

## O que ele deve devolver em caso de sucesso?

Essa resposta dependeria se seguimos aquela abordagem de separar o processamento custoso da geração inicial do pedido. Caso houvesse essa separação eu só iria retornar um status genérico indicando que esta sendo processado, nesse caso poderiamos ter um status 200 (OK) ou 202 (Created) e mais qualquer informação que talvez fosse interessante enviar pro front, como por exemplo o próprio id desse pedido. 

Se partirmos da ideia de que não teremos essa separação, ou seja, já iria processar o checkout direto, teriamos que informar os dados finais desse fluxo, como por exemplo um status de compra finalizada, o id da compra e qualquer outra informação que possa ser útil para o frontend, por exemplo pode ser interessante já retornar um link para o recibo da transação.

## O que ele deve devolver em caso de erro?

Isso depende se o projeto ja tem algum padrão para essas respostas de erro, no geral ele vai responder com um json com algumas propriedades que podem conter explicações do erro como por exemplo um msg/message, um `success: false` ou qualquer outro valor, não existe um padrão universal, o importa é que exista um padrão.

Também seria bom analisar os status code que podem ser retornados dependendo do erro:

- 401 Unauthorized: Se não estiver logado ou com sessão inválida.
- 400 Bad Request/422 Unprocessable Content: Caso tenha faltado algum campo importante no body da requisição.
- 405 Method Not Allowed: Se esse endpoint espera um POST e vou mandado um GET.
- 500 Internal Server Error: Erro genérico do servidor.

Enfim esses são só alguns dos possíveis status codes para erro, tem diversos outros mas não vou ficar citando todos.

## Por que é importante definir esse contrato antes de escrever código?

Por que assim garantimos que a equipe que for desenvolver esse endpoint já vai saber o que esperar receber e o que precisa devolver para o front.

Quando se trabalha em equipes separadas de front e back é essencial que tenha essa "interface" bem concreta para evitar mudanças futuras e qualquer incerteza quanto ao que deve ser feito.

Além de que com isso permite o front mockar a resposta da api durante seu desenvolvimento, de forma que acaba nao dependendo do backend ser finalizado para começar a integrar a API.