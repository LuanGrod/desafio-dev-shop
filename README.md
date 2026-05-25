* falar do por que do polling no frontend
  o ideal seria um SSE para atualizar o front mas para esse caso simples optei pelo pooling a cada 2 segundos

frontend
react + react router v7 + vite
typescript
tailwind
tanstack react query
zustand
react-hot-toast

backend
nestjs

explicacoes
  estou enviando o payload só com os items pois como o pedido não pede autenticacao (por isso nao estou enviando header de authentication), fora os outros dados de uma requisicao de checkout como endereço, informacoes pessoais, etc que tambem estao sendo desconsiderados

  falar que por não ter tanta familiaridade com o node e nestjs eu foquei mais em implementar uma spec bem consolidada para não deixar duvidas para o agente que for implementar