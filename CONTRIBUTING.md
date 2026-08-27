# Como contribuir — Cine-Resenhas

## Nomes de branch

Sempre criar branch a partir da `main` atualizada, seguindo o padrão:

|Prefixo|Uso|Exemplo|
|-|-|-|
|`feat/`|nova funcionalidade|`feat/upload-capa-filme`|
|`fix/`|correção de bug|`fix/validacao-email-cadastro`|
|`style/`|ajuste visual/CSS, sem mudar comportamento|`style/responsivo-catalogo`|
|`test/`|testes|`test/avaliacao-repository`|
|`docs/`|documentação|`docs/tabela-rotas-readme`|
|`refactor/`|refatoração sem mudar comportamento|`refactor/unificar-role-middleware`|

Nunca commitar direto na `main` — ela é protegida e só aceita merge via Pull Request aprovada.

## Mensagens de commit

Seguir o mesmo prefixo da branch: `feat: adicionar rota de login`, `fix: corrigir validação de email`, etc. (padrão já definido no documento do projeto).

## Antes de abrir uma PR

```bash
npm run lint       # checa padronização de código
npx tsc --noEmit   # checa erros de TypeScript
npm test           # roda a suíte Jest
```

Esses mesmos passos rodam automaticamente no CI (GitHub Actions) em toda PR — se algum falhar lá, a PR não pode ser mergeada.

## Setup local

```bash
cp .env.example .env   # ajustar valores, principalmente JWT\_SECRET
npm install
npm run dev
```

## Ordem de merge recomendada quando várias PRs mexem em áreas relacionadas

Entidades (`src/entities/`) → Repositories (`src/models/`) → Rotas (`src/routes/`) → Views/CSS/JS do navegador. Isso evita que uma rota seja mergeada dependendo de uma entidade/repository que ainda não existe na `main`. Em caso de dúvida, alinhar com o líder técnico antes do merge.

