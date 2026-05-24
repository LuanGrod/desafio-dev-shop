# 02 Consistência de estoque

Vários clientes conseguem comprar o mesmo produto quando o estoque acaba. A empresa está
vendendo itens que não possui.

## O que você acredita estar causando o problema?

Com certeza é problema de concorrência, cada requisição de compra está interagindo diretamente com o banco de dados de forma que caso o estado atual tenha 1 produto no estoque, se X clientes tentarem acessar simultaneamente, todos teoricamente estão vendo essa mesma quantidade e entendendo que existe estoque, de forma que caso as X compras sejam concluidas ao mesmo tempo acaba deixando o estoque negativo.

Isso pode acontecer por diversas causas, a validação dessa quantidade de produtos acontece em um só ponto do fluxo de compra (por exemplo não é feito no processamento do pagamento, só no início), seja por que não foi implementado um sistema de transactions no backend, não existe uma queue cuidando desse processo de checkout e o mais importante é que provavelmente essas operações no banco não estão seguindo 100% o ACID, no caso não são realmente atômicas, por exemplo esse desconto no estoque acontece em uma parte separada de onde acontece a efetivação da compra.

## Qual seria o impacto desse problema para o negócio ou para o cliente?

Exatamente o que esta escrito na pergunta, resumidamente a empresa acaba vendendo produtos que não tem em estoque, isso pode causar problemas na logistica, necessidade de falar com fornecedores, diversas solicitações de reembolso por parte dos clientes, impactar o nome da empresa, para os clientes cai no mesmo caso da pergunta 1, acaba afetando a confiança dos clientes, diminuindo as chances de voltarem a comprar no estabelecimento.

## Qual seria sua primeira hipótese de caminho para investigar ou melhorar?

Eu imagino que começaria verificando se no front existe essa validação de estoque em todas as partes do fluxo de compra, desde o início na página inicial da loja, quando ele adiciona o produto no carrinho e quando esta para finalizar o checkout, se não existisse essa validação obviamente teria que adicionar, talvez até mesmo um websocket pra atualizações em tempo real.

Caso isso não resolvesse o problema (o que parece ser o caso) restaria analisar esse código do backend, começando por esse endpoint de checkout, como funciona esse fluxo para saber em que parte ocorrem essas alterações no banco, a própria validação da compra (se tem estoque ou não). 

Acho que o primeiro ponto seria analisar se é valido o uso de filas, isso por que de acordo com a descrição do problema é um caso de race condition, então com as queues existiria um fluxo de processamento das compras mais controlado, algo ordenado, por exemplo quando o cliente finaliza a compra ele não processa direto essas alterações, ele adiciona esse evento em uma fila, que é processada (FIFO) e confirmada ou rejeitada com base nas validações.

É fato que adicionar filas seria uma melhora considerável mas ainda assim podem acontecer problemas de concorrência caso existam diversos workers trabalhando nelas, para isso o ideal seria garantir que essas alterações estejam ocorrendo atômicamente, o que eu pensei foi separar essa validação e baixa em um processo único usando transactions e updates condicionais para garantir que só vai realmente editar a quantidade atual do estoque se todas as validações estiverem passando, como isso seria tratado como um bloco único, não existiria a possibilidade de casos que editem o estoque antes de validar se realmente existe uma quantidade mínima.