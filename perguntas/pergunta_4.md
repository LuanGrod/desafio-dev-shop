# Pergunta 4 — TDD: Test-Driven Development
Sobre testes do mesmo endpoint POST /checkout:

## Que testes você escreveria para garantir que ele funciona corretamente? Liste pelo menos 3 cenários.

Considerando testes E2E eu validaria o fluxo feliz da compra e os principais fluxos de exceção.

- **O checkout deve retornar um status de aguardando processamento:** o usuário autentica no sistema, adiciona o produto no carrinho, segue o processo de checkout (adicionar informações, meio de pagamento, endereço, etc), finaliza checkout, existe estoque e o pedido é criado, adicionando processamento na fila e API retornando status 200/202.
- **O checkout deve falhar se não tiver estoque:** o usuario autentica no sistema, adiciona o produto no carrinho, segue o processo de checkout (adicionar informações, meio de pagamento, endereço, etc), finaliza checkout, não existe estoque suficiente e o pedido é cancelado, retorna uma responde indicando a mensagem do erro, no caso estoque insuficiente e um status informativo para o caso 400, 422, 500 ou algum outro que faça mais sentido.
- **O checkout deve falhar se o usuário nao tiver autenticado:** esse teste talvez não seria tão importante por que outras partes no sistema podem bloquear o acesso antes de finalizar o checkout, por exemplo o mercado livre nem deixa chegar no carrinho se o usuário não estiver logado, mas supondo que esse sistema permita ou esteja testando direto a API sem passar pelo sistema (com pelo postman), ele iria adicionar as informações da compra, finalizar o checkout e o sistema deve retornar um status code 401 com uma mensagem indicando que o usuário não esta autenticado.

Fora isso tem os testes mais genéricos. tipo os de validação de campos, tipos dos dados no body (testa o contrato dessa API, dados enviados e retornados), testes não funcionais como o caso do timeout do problema 3, validar se mesmo o endpoint demorando pra responder não ocorre o cancelamento da compra do usuário e outras dezenas de testes unitários que podem existir para deixar uma coverage boa da codebase.

## Há vantagem em escrever os testes antes de implementar a rota? Por quê?

Com certeza, principalmente considerando o checkout que é um fluxo critico para essa aplicação

Ter uma abordagem TDD no desenvolvimento é importante pois ajuda a equipe a definir o que é realmente o caminho certo sem abrir margem para conclusões próprias ou qualquer subjetividade, com isso deixa bem claro o que deve ser feito sem necessariamente explicar como, ou seja, com esse exercício o desenvolvedor acaba primeiro pensando no comportamento da funcionalidade, quais regras de negócio e requisitos ele vai precisar cumprir, bem como os possíveis erros que podem aparecer nesse caminho.

Ainda mais quando se trabalha com agentes de IA, o próprio teste serve como uma documentação ou critério de aceitação da funcionalidade, de forma que o agente pode ir testando cenários específicos conforme implementamos, diminuindo qualquer chance de interpretação própria.

Porém na prática nem sempre é possível seguir o TDD de forma 100% ideal, principalmente com projetos com prazos apertados ou requisitos não definidos completamente, mesmo assim as funcionalidades mais importantes desse fluxo de checkout como abate de estoque e processamento do pagamento devem ter os testes bem escritos, por que erros e retrabalhos nessas funcionalidades mais complexas podem ser custosas para a equipe.


