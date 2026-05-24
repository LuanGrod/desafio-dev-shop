# Pergunta 2 — Infraestrutura e serviços de apoio

De forma geral, o que você faria em relação à infraestrutura atual para suportar muitos acessos futuros sem depender diretamente do ERP em cada requisição?

* Na resposta, cite pelo menos 3 conceitos ou serviços que poderiam ajudar.
* Não precisa conhecer uma cloud específica; o importante é explicar o papel de cada item.

----

Considerando esse crescimento de milhares de acessos para milhões, temos alguns pontos que podem analisar, a ideia central é que a loja não deveria depender diretamente do ERP em tempo real para tudo, alguns servicos poderiam ser passados para uma camada intermediaria entre o ERP e o ecommerce.

O ponto por onde eu começaria seria o servidor, como foi dito que a empresa possui um datacenter próprio, eu analisaria a possibilidade de escalar os servidores, seja verticalmente mantendo só esse que já temos ou horizontalmente criando novos servidores para dividir a carga das requisições (load balancer). Uma outra alternativa para esse problema de escalabilidade seria o uso de serviços cloud que disponibilizam escalabilidade dinãmica com base nos acessos do servidor, seja on demand ou programado.

Só que essa alteração do servidor não influenciaria o acoplamento com o ERP, isso poderia sim auxiliar a disponibilidade do ecommerce e seus serviços mas não o possível gargalo nas APIs do ERP. Para isso eu proponho a criação de uma API com banco de dados próprio da loja, onde ficariam somente os dados necessarios para montar essa listagem de produtos e processo de checkout, dessa forma manteríamos o ERP como a SSoT (Single Source of Truth) e usariamos esse banco para leitura otimizada. Nesse ponto também cabe o uso de cache como o Redis para armazenar produtos comuns (não necessariamente só produtos, qualquer informação que seja comum de ser acessada e não costuma sofrer alterações frequentes), tal como cachear as primeiras páginas da listagem de produtos (isso se aplicado paginação conforme proposto na pergunta 1, problema 1).

Outro aspecto a se considerar são esses serviços custosos para o ERP como o processamento do checkout, faturamento ou baixa no estoque, eu consideraria o uso de queues para garantir que não vão impactar o fluxo geral, de forma que a compra poderia ser registrada rapidamente com um status de processamento pendente e esses processos jogados na fila para serem processados em segundo plano.

Resumidamente com essas alterações a loja pararia de depender diretamente do ERP em todas requisições, uma vez que ele seria usado mais como uma fonte de verdade e processamento final.