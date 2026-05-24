# 03 Resiliência do checkout
Ao finalizar a compra, a API do ERP demora para processar o pedido e gerar faturamento. A requisição sofre timeout e o cliente perde a compra.

## O que você acredita estar causando o problema?

Minha ideia inicial é que um dos módulos desse ERP está com algum problema, seja no processamento ou na parte da interação com o banco de dados.

Esse ponto da perda da compra muito provavelmente esta acontecendo por que por ser um processo assincrono na API, ele fica esperando a resposta até bater no timeout da requisição (que inclusive pode ser configurado tanto no front quanto no back), e essa resposta da API que esta com a lentidão. 

Sobre as causas é difícil saber só com isso de informação, novamente cai no mesmo caso da primeira pergunta, pode ser a rede do usuario, sobrecarga no servidor (todas aquelas citadas anteriormente, memória, armazenamento, cpu, banco de dados, etc), mas as minhas principais hipóteses são:

* Um dos módulos usados nessa API esta demorando, pode ser a autenticação, autorização,  processamento da compra, emissão da NF, disparo de eventos e por ai vai, dependendo das funcionalidades que esse endpoint vai ter, um dos módulos demorando vai impactar em toda a esteira de funcionamento desse serviço.
* Timeout mal configurado, ou seja, quando o timeout dessa requisição foi implementado, muito provavelmente acabou usando valores pequenos (30 segundos por exemplo) e essa requisição acabou tomando mais que esse limite, o que resultou nesse erro e perca da compra.
* Uma opção também seria alguma operação estar dando um loop, acho bem difícil de ser isso mas tem sempre essa possibilidade, algum erro no código que acaba resultado em um loop infinito.
* Obviamente também tem o ponto de carga no servidor, caso esteja com muito mais acessos que o esperado pode causar lentidão nas respostas.


## Qual seria o impacto desse problema para o negócio ou para o cliente?

Também segue a mesma linha de raciocínio das outras perguntas, vai impactar diretamente na receita da empresa pois mais erros na finalização dos pedidos resulta em menos produtos vendidos, necessidade de alocação de funcionários no suporte ao cliente, isso por que caso esse erro ocorra repetidamente sempre vai precisar de pessoal dando suporte para investigar as compras, se foram registradas corretamente, se houve a cobrança e não houve o abatimento no estoque, se houve a duplicação no pagamento dos pedidos e isso se extende para todo o processo de compras da empresa. Já para o cliente a resposta é a mesma, eles acabam perdendo a confiança na loja, impactando futuras leads e dificultando a fidelização do cliente.

## Qual seria sua primeira hipótese de caminho para investigar ou melhorar?

Inicialmente eu imagino que iria tentar entender quais os gatilhos para esse erro, por exemplo se for só em horários de pico que costumam acontecer essas falhas, isso significa que é por sobrecarga do servidor, no ERP, no banco de dados ou até mesmo em algum serviço de terceiros usado, uma possivel solução seria avaliar se é possível fazer um upgrade nele ou até mesmo aplicar um proxy com load balancer para garantir que sempre vai existir um servidor livre para processar essas requisições.

Também cogitaria analisar os logs e timestamps do fluxo de checkout para descobrir exatamente em qual etapa da finalização da compra ocorre a lentidão: se é no próprio ecommerce, na comunicação com o ERP ou no processamento interno dele. Com isso seria possível entender se o problema é timeout, erro de rede, lentidão no ERP ou alguma falha de regra de negócio.

Um ponto importante também seria verificar por que o processamento da compra pelo ERP está cancelando o pedido, eu imagino que o fluxo correto seria salvar o pedido em um passo separado do processamento (por exemplo com um status de aguardando processamento), ou seja, quando o usuário finalizar a compra ele só emitiria o registro indicando que o checkout foi feito, a partir daí poderiamos usar o mesmo conceito de filas da pergunta 2 para processa-las, permitindo retries caso ocorra algum erro em vez de só cancelar direto e dessa forma o cliente não perderia sua compra.