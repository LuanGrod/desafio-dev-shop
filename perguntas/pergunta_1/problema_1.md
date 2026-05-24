# 1. Performance da vitrine
A vitrine demora muitos segundos para carregar produtos, frustrando clientes logo no início da jornada.

## O que você acredita estar causando o problema?

Esse problema pode indicar muitas coisas, só com isso de informação eu consigo levantar algumas hipóteses como:

* Problema na rede do usuário.
* Algo no front que esta causando lentidão como libs pesadas (essas libs de animação, carrossel, etc), se for algo em react por exemplo pode ser rerender excessivo de componentes, problema no gerenciado de estado global da aplicação e mais uma série de outras coisas, mas isso se a página inteira demorasse para carregar, no caso parece que é algo exclusivo da listagem de produtos, logo não parece ser algo no front.
* Se os produtos chegassem rápido da api e só as imagens demorassem pra carregar poderia ser também o formato delas, se não estiverem em um cdn (o que não parece ser o caso por que não foi citado na infra), não estiverem salvas no formato mais recomendado pra web (webp ou avif por exemplo) ou com lazy loading isso poderia estar causando essa lentidão, mas novamente não parece ser o caso.

Aqui que eu acho que tem mais chances de estar o problema.

* Pode ser algo no servidor como pouca memória livre, cpu sobrecarregada, armazenamento perto do limite máximo, banco sobrecarregado ou no limite máximo de conexões (se não me engano o mysql permite 150 conexões simultaneas por padrão mas da pra aumentar bastante)
* O backend pode estar retornando muitos produtos de uma vez, como é um marketplace imagino que tenha diversos produtos e se não paginados corretamente acaba impactando nisso.
* Banco sem indexação, o que esta fazendo ele buscar em colunas que não são tão impactantes assim.
* Por último a falta de cache, o que faz com que cada requisição dessa lista de produtos precise buscar no banco novamente dados que muito provavelmente nao mudaram.

## Qual seria o impacto desse problema para o negócio ou para o cliente?

O principal seria o impacto no número de vendas e nos clientes, como é um marketplace a gente espera encontrar os produtos que queremos de forma fácil e rápida, qualquer demora que existe no site impacta a quantidade de vendas concluídas e a possibilidade do cliente voltar a comprar na loja.

## Qual seria sua primeira hipótese de caminho para investigar ou melhorar?

O primeiro passo seria algo mais relacionado a UX/UI, talvez adicionar um skeleton para os produtos ou um sinal de loading, por mais que não resolva o problema acaba melhorando um pouco a experiência do usuário nesse tempo que esta esperando.

Eu iria começar analisando o front, verificar a aba de network do navegador para ver que requisições estão demorando.

Se a requisição que retorna os produtos esta funcionando corretamente e só as imagens estão demorando pra carregar teria que ver como elas são armazenadas e adicionar ou uma limitação para aqueles tipos de arquivo que eu citei acima ou alterar o backend para converter essas imagens quando realizado o upload, também consideraria usar um serviço de cdn mas em último caso somente.

Caso seja a hipótese de ser mesmo esse endpoint de listagem de produtos que esta demorando eu iria verificar essa resposta, se esta retornando muitos produtos de uma vez o jeito seria aplicar paginação, dependendo da quantidade de produtos pode ser por offset ou até mesmo cursor se tivermos muitos registros no banco.

Se mesmo com a paginação os produtos ainda estivessem demorando iria verificar o banco, seja verificando se não estão buscando campos desnecessários para essa listagem inicial, talvez aplicar índices nas colunas mais comuns de serem buscadas dos produtos, como id, category_id, status, etc.

E em último caso, se nada disso resolver só resta analisar os logs, como dito na infra existem ferramentas que monitoram performance e enviam alertas críticos, iria verificar por pontos de pico no servidor e banco de dados.