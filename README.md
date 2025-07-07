# Telaclass Core

Monorepo de **código-fonte** do Telaclass v2  
(Stack: Next.js 15, React 19, Tailwind CSS v4, shadcn/ui, MDX v3).  
A pasta `content/` **não é versionada**; o conteúdo didático é montado via volume Docker a partir do diretório sincronizado no pCloud.

```text
📁 estrutura (raiz)
├── app/                 # rotas e layouts (App Router)
├── components/          # UI reutilizável
├── content/             # ← montado em runtime (vazio no repositório)
├── docker-compose.yml   # ambiente dev em Docker
├── Dockerfile.dev       # imagem dev (Node 20‑alpine)
├── Dockerfile           # imagem produção
├── next.config.ts
└── …
```

## Stack & ferramentas

| Camada        | Versão / detalhe                       |
|---------------|----------------------------------------|
| Runtime       | **Node 20‑alpine** (Docker)            |
| Framework     | **Next.js 15** (App Router)            |
| UI            | **React 19** + **shadcn/ui**           |
| CSS           | **Tailwind CSS v4**                    |
| Conteúdo      | **MDX v3** + player custom (ReactFlow) |
| Linguagem     | **TypeScript** (`@/*` import‑alias)    |

---

## Como rodar em desenvolvimento

1. Clone apenas o código (não há submódulos):

```bash
git clone git@github.com:<SEU_USER>/telaclass-core.git
cd telaclass-core
```

2. **Garanta** que o conteúdo esteja disponível em  
`~/pcloud-sync/telaclass-content` (ou outro caminho).

3. Ajuste o caminho do volume se necessário em `docker-compose.yml`:

```yaml
volumes:
  - "/ABSOLUTE/PATH/telaclass-content:/app/content:ro"
```

4. Suba o contêiner:

```bash
docker compose up --build   # 1ª vez (instala dependências)
# depois: docker compose up
```

Aplicação em <http://localhost:3000>.

---

## Comandos úteis (NPM)

| Ação              | Comando                 |
|-------------------|-------------------------|
| Dev server        | `npm run dev`           |
| Lint              | `npm run lint`          |
| Build estático    | `npm run build`         |
| Start produção    | `npm start` (via Docker)|

---

## Build de produção

```bash
docker build -t telaclass-core:prod .
docker run -p 3000:3000   -v /ABSOLUTE/PATH/telaclass-content:/app/content:ro   telaclass-core:prod
```

---

## Roadmap (sprints)

| Sprint | Status | Foco principal                                |
|-------:|:------:|-----------------------------------------------|
| 0 | ✅ | Migração conteúdo, Docker, volume mount                |
| 1 | 🚧 | Tailwind 4 + shadcn/ui, layout base, dark mode         |
| 2 | ⏳ | Auth.js, MongoDB modelos, dashboard administradores     |

---

## Licença

Código sob MIT. O conteúdo didático (arquivos em `content/`) reside fora deste repositório e possui licença própria.
