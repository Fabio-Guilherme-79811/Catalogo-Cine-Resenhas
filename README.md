# Catálogo-Cine-Resenhas
  Repositório de Back-end + Web para o projeto *Cine-Resenhas*, projeto o qual possui o objetivo de catalogar, avaliar e gerenciar filmes e séries diversos. 
  O sistema permite que os usuários explorem produções, filtrem por gênero, façam avaliações com notas e comentários, além de disponibilizar uma área administrativa restrita para gestão de mídias e upload de capas e títulos.


  Projeto desenvolvido para a Unidade Curricular 31 - Projeto Final - Codificar Back-end.


## Stack Utilizada
### Back-End
  - **Node.js + Typescript** - Runtime e Linguagem base.
  - **Express** - Framework web para rotas e middlewares
  - **OOP (Orientação a Objetos)** — Classes com atributos privados, getters/setters, validações e métodos `fromJSON()` / `toJSON()`.
  - **Repository Pattern** — Camada de persistência desacoplada em arquivos `.json`.
  - **Autenticação & Segurança** — `bcrypt` para criptografia de senhas e `express-session` para controle de sessão/login.
  - **Upload de Arquivos** — `Multer` para gerenciamento de capas de filmes e séries.
  - **Testes Automatizados** — `Jest` para testes unitários e de integração.

### Front-end
  - **EJS (Embedded JavaScript)** — Renderização de templates HTML dinâmicos.
  - **CSS3 Customizado** — Estilização própria, responsiva e focada em usabilidade (sem dependência exclusiva de frameworks externos).
  - **JavaScript Vanilla (`public/js/`)** — Consumo interno de rotas via `fetch API`, manipulando o DOM e fornecendo estados de *loading* e validação sem recarregar a página.
  

## Equipe e Papéis

  | Integrante | Papel Principal | Responsabilidades |
  | :--- | :--- | :--- |
  | **Fábio Guilherme Soares Saldanha** | Líder Técnico | Arquitetura MVC, padrão OOP, revisão de Pull Requests e suporte de merge | 
  | **Oséias da Costa Moura Filho** | Desenvolvedor Back-end | Implementação dos Repositories JSON, Controllers, Auth e middlewares |
  | **Adonis França Bezerra** | Desenvolvedor Front-end | Views em EJS, estilos em CSS, controle visual e scripts com `fetch` API |
  | **João Felipe Bezerra da Silva** | QA / Testes / Documentação | Testes unitários/integração com Jest, criação do README e diagramas UML |
  **Nota** - Apesar da definição de funções, todos os participantes transitam entre funções para a progressão do projeto.


## Estrutura de Pastas
```
Cine-Resenhas/  
  ├── docs/                      # Diagramas UML e documentação complementar
  │   ├── caso-de-uso.png
  │   └── sequencia-get-filmes.png
  ├── dados/                     # Persistência em arquivos JSON
  │   ├── filmes.json
  │   ├── generos.json
  │   ├── avaliacoes.json
  │   └── usuarios.json
  ├── public/                    # Arquivos estáticos
  │   ├── css/                   # Estilos CSS próprios e responsivos
  │   ├── js/                    # Scripts client-side (fetch, DOM, loading states)
  │   └── uploads/               # Capas de filmes enviadas via Multer
  ├── src/
  │   ├── entities/              # Classes OOP (Filme, Genero, Avaliacao, Usuario)
  │   │   └── __tests__/
  │   ├── models/                # Repositories (Persistência em JSON)
  │   │   └── __tests__/
  │   ├── routes/                # Rotas da aplicação (Express Routers)
  │   │   └── __tests__/
  │   ├── middlewares/           # Middleware de autenticação, roles e upload Multer
  │   ├── views/                 # Templates HTML dinâmicos em EJS
  │   │   ├── partials/          # Header, footer, nav
  │   │   └── ...                # Páginas (login, catalogo, detalhes, admin)
  │   ├── app.ts                 # Configurações do Express e Middlewares
  │   └── server.ts              # Inicialização do servidor na porta 3000
  ├── jest.config.js             # Configuração do Jest
  ├── tsconfig.json              # Configuração do TypeScript
  ├── package.json
  └── README.md
```
## Guia de Execução 
  ### Pré-Requisitos 
   -Node.js (versão 22 ou superior)
   -NPM ou Yarn 
  ### Passo a Passo
   1. Clonar o Repositório:
```bash
git clone https://github.com/Fabio-Guilherme-79811/Catalogo-Cine-Resenhas.git
cd larp-flix
```
   2. Instalar as Depêndencias:
```
npm install
```
   3. Executar em modo de desenvolvimento:
```
npm run dev
```
   4. Executar os testes automatizados:
```
npm test
``` 









