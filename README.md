# Catálogo-Larp-FLix
  Repositório de Back-end + Web para o projeto *Larp-Flix*, projeto o qual possui o objetivo de catalogar, avaliar e gerenciar filmes e séries diversos. 
  O sistema permite que os usuários explorem produções, filtrem por gênero, façam avaliações com notas e comentários, além de disponibilizar uma área administrativa restrita para gestão de mídias e upload de capas e títulos.


  Projeto desenvolvido para a Unidade Curricular 31 - Projeto Final - Codificar Back-end.


## Stack Utilizada
  - **Node.js + Typescript** - Runtime e Linguagem base.
  - **Express** - Framework web para rotas e middlewares
  - **OOP (Orientação a Objetos)** — Classes com atributos privados, getters/setters, validações e métodos `fromJSON()` / `toJSON()`.
  - **Repository Pattern** — Camada de persistência desacoplada em arquivos `.json`.
  - **Autenticação & Segurança** — `bcrypt` para criptografia de senhas e `express-session` para controle de sessão/login.
  - **Upload de Arquivos** — `Multer` para gerenciamento de capas de filmes e séries.
  - **Testes Automatizados** — `Jest` para testes unitários e de integração.

## Front-end
  - **EJS (Embedded JavaScript)** — Renderização de templates HTML dinâmicos.
  - **CSS3 Customizado** — Estilização própria, responsiva e focada em usabilidade (sem dependência exclusiva de frameworks externos).
  - **JavaScript Vanilla (`public/js/`)** — Consumo interno de rotas via `fetch API`, manipulando o DOM e fornecendo estados de *loading* e validação sem recarregar a página.