#!/usr/bin/env bash
set -euo pipefail

## One-command deploy script for Telaclass production
## Usage: ./deploy.sh [optional-local-content-path]

SSH_USER="telaclass"
SSH_HOST="telaclass.ufsj.edu.br"
SSH_PORT=19000

REMOTE_BASE="/srv"
REMOTE_APP_DIR="$REMOTE_BASE/telaclass-app"          # Código fonte
REMOTE_CONTENT_DIR="$REMOTE_BASE/telaclass-content"  # Conteúdo (MDX)

LOCAL_CONTENT_DIR="${1:-$HOME/pcloud-sync/telaclass-content}"  # Pode ser passado como 1º arg

APP_IMAGE_BASE="telaclass-app"
APP_IMAGE_TAG="$(date +%Y%m%d-%H%M%S)"
APP_IMAGE_NAME="$APP_IMAGE_BASE:$APP_IMAGE_TAG"
APP_IMAGE_LATEST="$APP_IMAGE_BASE:latest"
COMPOSE_FILE="docker-compose.prod.yml"

echo "==> Telaclass deploy starting"
echo "SSH target: $SSH_USER@$SSH_HOST:$SSH_PORT"
echo "Local content: $LOCAL_CONTENT_DIR"

if [[ ! -d "$LOCAL_CONTENT_DIR" ]]; then
  echo "[ERROR] Conteúdo não encontrado em $LOCAL_CONTENT_DIR" >&2
  exit 1
fi

## Rsync options:
##  -a archive, -z compress, -h human, -v verbose, --delete remove antigos
RSYNC_CODE_EXCLUDES=(
  "--exclude" ".git" \
  "--exclude" "node_modules" \
  "--exclude" ".next" \
  "--exclude" "content" \
  "--exclude" "deploy.sh" \
  "--exclude" "docker-compose.debug.yml"
)

echo "==> Sync código (sem node_modules/.next)"
rsync -azhv --delete "${RSYNC_CODE_EXCLUDES[@]}" ./ "$SSH_USER@$SSH_HOST:$REMOTE_APP_DIR/" -e "ssh -p $SSH_PORT"

echo "==> Sync conteúdo MDX"
rsync -azhv --delete --exclude '_bak/' "$LOCAL_CONTENT_DIR/" "$SSH_USER@$SSH_HOST:$REMOTE_CONTENT_DIR/" -e "ssh -p $SSH_PORT"

echo "==> Preparar conteúdo dentro do diretório do app para build"
ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
  "REMOTE_APP_DIR='$REMOTE_APP_DIR' REMOTE_CONTENT_DIR='$REMOTE_CONTENT_DIR' APP_IMAGE_NAME='$APP_IMAGE_NAME' APP_IMAGE_LATEST='$APP_IMAGE_LATEST' COMPOSE_FILE='$COMPOSE_FILE' bash -s" << 'REMOTE_SCRIPT'
set -e

mkdir -p "${REMOTE_APP_DIR}/content/disciplinas"
rsync -a --delete "${REMOTE_CONTENT_DIR}/" "${REMOTE_APP_DIR}/content/disciplinas/"
cd "${REMOTE_APP_DIR}"

echo "-> Ensuring traefik network exists (traefik_web)"
docker network inspect traefik_web >/dev/null 2>&1 || docker network create traefik_web

echo "-> Building image ${APP_IMAGE_NAME} (and tagging latest)"
docker build -t "${APP_IMAGE_NAME}" -t "${APP_IMAGE_LATEST}" .

echo "-> Starting container via compose (${COMPOSE_FILE})"
docker compose -f "${COMPOSE_FILE}" up -d --remove-orphans

echo "-> Done. Current images:"
docker images | grep telaclass-app || true

echo "-> Cleaning up old telaclass-app images (unused)"
# Keep only the currently built tag and the :latest tag; attempt to remove older tags
KEEP_TAG_1="${APP_IMAGE_LATEST}"
KEEP_TAG_2="${APP_IMAGE_NAME}"
docker images --format '{{.Repository}}:{{.Tag}}' \
  | awk '/^telaclass-app:/{print $1}' \
  | while read -r ref; do
      if [[ "$ref" != "$KEEP_TAG_1" && "$ref" != "$KEEP_TAG_2" ]]; then
        echo "   removing $ref"
        docker rmi "$ref" || true
      fi
    done

echo "-> Pruning dangling images and layers"
docker image prune -a || true
REMOTE_SCRIPT

echo "==> Deploy complete"
echo "Check logs: ssh -p $SSH_PORT $SSH_USER@$SSH_HOST 'docker logs -f telaclass-app'"
echo "Image built: $APP_IMAGE_NAME (also tagged latest)"
echo "Old images cleanup: performed automatically on remote."
echo "Optional: extra prune (dangling/unused layers) -> ssh -p $SSH_PORT $SSH_USER@$SSH_HOST 'docker image prune -f'"
