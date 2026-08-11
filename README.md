# Catálogo-Cine-Resenhas
  Repositório de Back-end + Web para o projeto *Cine-Resenhas*, projeto o qual possui o objetivo de catalogar, avaliar e gerenciar filmes diversos. 
  O sistema permite que os usuários explorem produções, filtrem por gênero, façam avaliações com notas e comentários, além de disponibilizar uma área administrativa restrita para gestão de mídias e upload de capas e títulos.


  Projeto desenvolvido para a Unidade Curricular 31 - Projeto Final - Codificar Back-end.


## Stack Utilizada
### Back-End
  - **Node.js + Typescript** - Runtime e Linguagem base.
  - **Express** - Framework web para rotas e middlewares
  - **OOP (Orientação a Objetos)** — Classes com atributos privados, getters/setters, validações e métodos `fromJSON()` / `toJSON()`.
  - **Repository Pattern** — Camada de persistência desacoplada em arquivos `.json`.
  - **Autenticação & Segurança** — `bcrypt` para criptografia de senhas e `express-session` para controle de sessão/login.
  - **Upload de Arquivos** — `Multer` para gerenciamento de capas de filmes.
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
  ├── assets/                    # Diagramas UML e prints do sistema (usados no README)
  │   ├── caso-de-uso.png
  │   ├── diagrama-classes.png
  │   ├── diagrama-componentes.png
  │   ├── sequencia-get-filmes.png
  │   ├── sequencia-login.png
  │   └── fluxo-telas.png
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
## Arquitetura e Diagramas UML
  O projeto segue uma arquitetura em camadas inspirada no padrão **MVC**, com forte uso de **Orientação a Objetos** no Back-end:

  - **Entities (`src/entities/`)** — Classes de domínio (`Filme`, `Genero`, `Avaliacao`, `Usuario`), responsáveis por encapsular atributos privados, validações internas e conversão `fromJSON()` / `toJSON()`.
  - **Models / Repositories (`src/models/`)** — Camada de persistência, implementando o **Repository Pattern** sobre os arquivos `.json` da pasta `dados/`, isolando o restante da aplicação do formato de armazenamento.
  - **Routes / Controllers (`src/routes/`)** — Roteadores do Express que recebem as requisições, aplicam os middlewares necessários e orquestram entidades e repositórios para montar a resposta (JSON ou renderização EJS).
  - **Middlewares (`src/middlewares/`)** — Autenticação (`isAuthenticated`), autorização por papel (`isAdmin`), carregamento opcional de usuário (`carregarUsuarioOpcional`) e upload de arquivos (`Multer`).
  - **Views (`src/views/`)** — Templates EJS renderizados no servidor para as páginas navegáveis do sistema.

  ### Diagramas
  Os diagramas UML do projeto ficam versionados em `assets/`.

  #### Diagrama de Casos de Uso
  Interações do Visitante, Usuário autenticado e Administrador (com herança de permissões) com as funcionalidades do sistema.

  ![Diagrama de Caso de Uso](assets/caso-de-uso.png)

  #### Diagrama de Classes (Entities + Repositories)
  Atributos, métodos e relacionamentos entre `Filme/Conteudo`, `Genero`, `Avaliacao`, `Favorito`, `Usuario` e seus respectivos repositories.

  ![Diagrama de Classes](assets/diagrama-classes.png)

  #### Diagrama de Componentes (Back-end)
  Relação entre Routes, Middlewares, Repositories, Entities e a persistência em JSON.

  ![Diagrama de Componentes](assets/diagrama-componentes.png)

  #### Diagrama de Sequência — GET Filmes
  Fluxo de requisição da listagem de filmes do catálogo.

  ![Diagrama de Sequência - GET Filmes](assets/sequencia-get-filmes.png)

  #### Diagrama de Sequência — Login
  Fluxo de autenticação, da submissão do formulário à criação da sessão.

  ![Diagrama de Sequência - Login](assets/sequencia-login.png)

  #### Diagrama de Fluxo de Telas (Front-end)
  Navegação entre as páginas (views EJS) do sistema, por área (pública, usuário, admin).

  ![Diagrama de Fluxo de Telas](assets/fluxo-telas.png)


## Tabela de Rotas da API
  Todas as rotas abaixo são montadas a partir da raiz (`/`) pelo `index-routes.ts`. Rotas marcadas como **Autenticado** exigem sessão de usuário ativa (`isAuthenticated`); rotas marcadas como **Admin** exigem, além da autenticação, o papel de administrador (`isAdmin`).

  ### Autenticação (`/`)
  | Método | Rota | Descrição | Acesso |
  | :--- | :--- | :--- | :--- |
  | POST | `/entrar` | Autentica o usuário e inicia a sessão | Público |
  | POST | `/registro` | Cadastra um novo usuário | Público |
  | POST | `/logout` | Encerra a sessão do usuário autenticado | Público |

  ### Conteúdo / Filmes (`/conteudo`)
  | Método | Rota | Descrição | Acesso |
  | :--- | :--- | :--- | :--- |
  | GET | `/conteudo/filmes` | Lista os filmes do catálogo, com suporte a busca via query string | Público |
  | GET | `/conteudo/filmes/:id` | Retorna o detalhe de um filme específico | Público |
  | POST | `/conteudo/filmes` | Cadastra um novo filme | Admin |
  | PUT | `/conteudo/filmes/:id` | Atualiza os dados de um filme | Admin |
  | DELETE | `/conteudo/filmes/:id` | Remove um filme do catálogo | Admin |
  | POST | `/conteudo/filmes/:id/poster` | Faz upload da capa do filme (`multipart/form-data`, campo `poster`) | Admin |

  ### Avaliações (`/avaliacoes`)
  | Método | Rota | Descrição | Acesso |
  | :--- | :--- | :--- | :--- |
  | GET | `/avaliacoes/filme/:filmeId` | Lista as avaliações de um filme | Público |
  | GET | `/avaliacoes/filme/:filmeId/media` | Retorna a média e o total de avaliações de um filme | Público |
  | POST | `/avaliacoes/filme/:filmeId` | Cria uma nova avaliação (nota + comentário) para o filme | Autenticado |
  | PUT | `/avaliacoes/:id` | Edita uma avaliação existente (autor, dentro da janela de edição, ou admin) | Autenticado |
  | DELETE | `/avaliacoes/:id` | Remove uma avaliação | Admin |

  ### Favoritos (`/favoritos`)
  | Método | Rota | Descrição | Acesso |
  | :--- | :--- | :--- | :--- |
  | GET | `/favoritos/filme/:filmeId` | Verifica se o filme está favoritado pelo usuário autenticado | Autenticado |
  | POST | `/favoritos/filme/:filmeId` | Adiciona o filme aos favoritos (operação idempotente) | Autenticado |
  | DELETE | `/favoritos/filme/:filmeId` | Remove o filme dos favoritos | Autenticado |

  ### Usuário (`/usuario`)
  | Método | Rota | Descrição | Acesso |
  | :--- | :--- | :--- | :--- |
  | GET | `/usuario/perfil` | Retorna os dados do perfil do usuário autenticado | Autenticado |
  | PUT | `/usuario/perfil` | Atualiza os dados do perfil | Autenticado |
  | PUT | `/usuario/senha` | Atualiza a senha do usuário | Autenticado |
  | DELETE | `/usuario/conta` | Remove a conta do usuário autenticado | Autenticado |

  ### Administração (`/admin`)
  | Método | Rota | Descrição | Acesso |
  | :--- | :--- | :--- | :--- |
  | GET | `/admin` | Retorna as seções disponíveis do painel administrativo | Admin |
  | GET | `/admin/usuarios` | Lista todos os usuários cadastrados | Admin |
  | GET | `/admin/usuarios/:id` | Retorna o detalhe de um usuário | Admin |
  | PUT | `/admin/usuarios/:id` | Atualiza os dados de um usuário | Admin |
  | DELETE | `/admin/usuario/:id` | Remove um usuário | Admin |
  | GET | `/admin/estatisticas` | Retorna estatísticas do sistema (usuários, cadastros na semana, visitas) | Admin |

  ### Configurações (`/config`)
  | Método | Rota | Descrição | Acesso |
  | :--- | :--- | :--- | :--- |
  | GET | `/config` | Retorna as configurações públicas do site (nome, descrição, cor, manutenção) | Público |
  | GET | `/config/completo` | Retorna o objeto de configuração completo | Admin |
  | PUT | `/config` | Atualiza as configurações do site | Admin |
  | PUT | `/config/manutencao` | Ativa/desativa o modo de manutenção | Admin |


## Guia de Navegação do Sistema
  Rotas de página (renderização EJS), agrupadas por fluxo de navegação:

  ### Área Pública
  | Rota | Página | Descrição |
  | :--- | :--- | :--- |
  | `/` | Landing Page | Página inicial com CTAs de login e cadastro |
  | `/login` | Login | Formulário de autenticação |
  | `/cadastro` | Cadastro | Formulário de registro de novos usuários |
  | `/catalogo` | Catálogo | Filmes publicados, agrupados por gênero, com busca e filtro (`?genero=`, `?busca=`) |
  | `/filmes/:id` | Detalhes do Filme | Sinopse, avaliações e opção de favoritar (favoritar exige login) |

  ### Área do Usuário Autenticado
  | Rota | Página | Descrição |
  | :--- | :--- | :--- |
  | `/usuario/perfil` | Meu Perfil | Dados cadastrais e filmes favoritados |
  | `/usuario/avaliacoes` | Minhas Avaliações | Avaliações feitas pelo usuário, com dados do filme avaliado |
  | `/usuario/historico` | Histórico | Linha do tempo de atividade (avaliações recentes) |
  | `/config` | Configurações | Preferências da conta do usuário logado |

  ### Área Administrativa (restrita a `role: admin`)
  | Rota | Página | Descrição |
  | :--- | :--- | :--- |
  | `/painel-admin` | Painel Administrativo | Estatísticas do sistema e listagem de filmes |
  | `/painel-admin/filmes/novo` | Novo Filme | Formulário de cadastro de filme |
  | `/painel-admin/filmes/:id/editar` | Editar Filme | Formulário de edição de um filme existente |

  ### Fluxo de Navegação (visão geral)
```
Landing (/) ──► Login (/login) ──► Catálogo (/catalogo) ──► Detalhes do Filme (/filmes/:id)
      │                                   │                          │
      └──► Cadastro (/cadastro)           ├──► Meu Perfil            ├──► Avaliar / Favoritar
                                           ├──► Minhas Avaliações     
                                           ├──► Histórico
                                           └──► Painel Admin (se admin) ──► Novo Filme / Editar Filme
```


## Prints do Sistema
  Capturas de tela das principais páginas do sistema, disponíveis em `assets/`.

  #### Landing Page
  Página inicial pública, com destaque para filmes em alta e CTAs de login e cadastro.

  ![Landing Page](assets/print-sistema1.png)

  #### Login / Cadastro
  Formulário de autenticação com abas para entrar ou criar uma nova conta.

  ![Login e Cadastro](assets/print-sistema2.png)

  #### Configurações
  Página de configurações da conta do usuário autenticado (notificações, perfil público e autenticação em duas etapas).

  ![Configurações](assets/print-sistema3.png)


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


## Suíte de Testes do Sistema
  A suíte utiliza **Jest** e reúne mais de **240 casos de teste** unitários e de integração, cobrindo entidades, repositórios, middlewares e rotas. Os arquivos de teste ficam junto ao código que testam, em pastas `__tests__`/`tests`/`test`.

  | Camada | Local | Cobertura |
  | :--- | :--- | :--- |
  | Entities | `src/entities/tests/` | `Filme`, `Genero`, `Avaliacao`, `Usuario` — validações, getters/setters e `fromJSON()`/`toJSON()` |
  | Models (Repositories) | `src/models/tests/` | `ConteudoRepository`, `UsuarioRepository` — persistência em JSON |
  | Interfaces dos Repositories | `src/models/interfaces/tests/` | `IConteudoRepository`, `IAvaliacaoRepository`, `IGeneroRepository` |
  | Middlewares | `src/middlewares/test/` | Autenticação (`auth`), autorização por papel (`role`) e upload de arquivos (`upload`) |
  | Rotas | `src/routes/tests/` | `admin`, `auth`, `avaliacao`, `config`, `conteudo`, `index`, `landing`, `paginas`, `user` |

  ### Comandos
```bash
# Executar toda a suíte de testes
npm test

# Executar em modo watch (reexecuta ao salvar arquivos)
npx jest --watch

# Executar um arquivo/rota específica
npx jest src/routes/tests/avaliacao.routes.test.ts

# Executar com relatório de cobertura
npx jest --coverage
```

  **Configuração** — Definida em `jest.config.js`, na raiz do projeto.






