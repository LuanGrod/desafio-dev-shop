| Componente | Descrição |
|------------|-----------|
|ERP Central | ERP monolítico que gerencia estoque, faturamento, financeiro e contábil. É o coração da empresa.|
|Loja Virtual | E-commerce que consome dados (produtos, preços, estoque) diretamente do ERP via API RESTful síncrona.|
|Banco de Dados | ERP utiliza MySQL. Temos acesso de leitura, mas não podemos alterar rotinas, tabelas ou código interno do ERP.|
|Infraestrutura | Tudo hospedado em datacenter próprio (on-premise) na sede.|
|Monitoramento | Ferramentas que monitoram performance e enviam alertas críticos.|