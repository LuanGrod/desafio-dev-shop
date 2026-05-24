## Stack do front-end

O front-end será criado no diretório `frontend` com uma stack baseada em React e TypeScript, priorizando simplicidade, organização e clareza na experiência do usuário.

### React

Biblioteca principal para construção da interface. Será usada para criar a tela de checkout, componentes reutilizáveis e estados visuais como carregamento, sucesso e erro.

### TypeScript

Adiciona tipagem estática ao projeto, ajudando a deixar contratos de dados mais claros, especialmente nas integrações com a API de checkout e na modelagem de produtos, estoque e respostas de erro.

### React Router

Responsável pelo roteamento da aplicação. Mesmo que o desafio comece com uma tela simples, o uso do React Router deixa o projeto preparado para evoluir com novas páginas, como listagem de produtos, detalhe do produto ou histórico de pedidos.

### Tailwind CSS

Framework utilitário para estilização. Será usado para construir uma interface simples, responsiva e consistente sem adicionar uma camada pesada de componentes visuais.

### TanStack Query

Responsável pelo data fetching e pelo controle de estados assíncronos. Ele ajuda a lidar com requisições para o back-end, estados de carregamento, erros, retries e invalidação de dados quando necessário.

### Zustand

Gerenciador de estado leve para estados locais compartilhados. No contexto do checkout, pode ser usado para controlar informações como produto selecionado, quantidade escolhida e preferências simples da interface.

### React Hot Toast

Biblioteca para exibir notificações ao usuário. Será usada para mensagens compreensíveis de sucesso, erro de validação e indisponibilidade da API durante o fluxo de checkout.

### Vite

Ferramenta de build e desenvolvimento para aplicações front-end. Será usada para criar o projeto React com uma configuração simples, rápida e adequada para um desafio técnico.
