# Telaclass Core

Monorepo de **código-fonte** do Telaclass v2  
(Stack: Next.js 15, React 19, Tailwind CSS v4, shadcn/ui, MDX v3).  
O material didático é trazido como submódulo Git (`content/`).

```text
📁 estrutura (raiz)
├── app/                 # rotas e layouts (App Router)
├── content/             # submódulo → telaclass-content
├── docker-compose.yml   # ambiente dev em Docker
├── Dockerfile.dev       # imagem dev (Node 20-alpine)
├── Dockerfile           # imagem produção
├── next.config.ts
└── …
```

## Stack & ferramentas

| Camada        | Versão / detalhe                       |
|---------------|----------------------------------------|
| Runtime       | **Node 20-alpine** (Docker)            |
| Framework     | **Next.js 15** (App Router)            |
| UI            | **React 19** + **shadcn/ui**           |
| CSS           | **Tailwind CSS v4**                    |
| Conteúdo      | **MDX v3** + player custom (ReactFlow) |
| Linguagem     | **TypeScript** (`@/*` import-alias)    |

---

## Como rodar em desenvolvimento

```bash
# clone com submódulos
git clone --recurse-submodules git@github.com:<SEU_USER>/telaclass-core.git
cd telaclass-core

# subir via Docker
docker compose up --build   # 1ª vez (instala dependências)
# depois: docker compose up
```

Aplicação em <http://localhost:3000>.

### Comandos mais usados

| Ação              | Comando                 |
|-------------------|-------------------------|
| Dev server        | `npm run dev`           |
| Lint              | `npm run lint`          |
| Build estático    | `npm run build`         |
| Start produção    | `npm start` (via Docker)|

### Atualizar o submódulo de conteúdo

```bash
git submodule update --remote --merge
```

---

## Build de produção

```bash
docker build -t telaclass-core:prod .
docker run -p 3000:3000 telaclass-core:prod
```

---

## Roadmap (sprints)

| Sprint | Status | Foco principal                                |
|-------:|:------:|-----------------------------------------------|
| 0 | ✅ | Migração conteúdo, submódulo, Docker bootstrap        |
| 1 | 🚧 | Tailwind 4 + shadcn/ui, layout base, dark mode        |
| 2 | ⏳ | Auth.js, MongoDB modelos, dashboard administradores   |

---

## Licença

Código sob MIT. O conteúdo didático vive em **telaclass-content** (repositório privado) e possui licença própria.
