#!/usr/bin/env bash
set -Eeuo pipefail

# =======================
# Telaclass Deploy Script (remote Docker host)
# Compatible style with Traefik deploy helper
# =======================

# ----------
# Config (override via env)
# ----------
SSH_HOST="${SSH_HOST:-telaclass.ufsj.edu.br}"
SSH_USER="${SSH_USER:-arabica}"
SSH_PORT="${SSH_PORT:-22691}"
SSH_KEY="${SSH_KEY:-}"

# Remote directories
# Use absolute paths so we don't accidentally create nested home/arabica/home/arabica/... when using rsync/mkdir.
# If you prefer a tilde, you can override via env: REMOTE_APP_DIR=~/telaclass-app REMOTE_CONTENT_DIR=~/telaclass-content
# (Note: tilde expansion does NOT occur when inside a quoted variable assignment; overriding via env without quotes expands.)
REMOTE_APP_DIR="${REMOTE_APP_DIR:-/home/${SSH_USER}/telaclass-app}"         # where app code lives
REMOTE_CONTENT_DIR="${REMOTE_CONTENT_DIR:-/home/${SSH_USER}/telaclass-content}" # where MDX content lives

# Compose
PROJECT_NAME="${PROJECT_NAME:-telaclass}"
COMPOSE_FILE_LOCAL="${COMPOSE_FILE_LOCAL:-docker-compose.prod.yml}"
COMPOSE_FILE_REMOTE="${COMPOSE_FILE_REMOTE:-docker-compose.prod.yml}"

# Docker/Traefik
NETWORK_NAME="${NETWORK_NAME:-traefik_web}"

# Image tagging
APP_IMAGE_REPO="${APP_IMAGE_REPO:-telaclass-app}"
APP_IMAGE_TAG_TS="${APP_IMAGE_TAG_TS:-$(date +%Y%m%d-%H%M%S)}"
APP_IMAGE_LATEST_TAG="${APP_IMAGE_LATEST_TAG:-latest}"
APP_IMAGE_NAME_TS="${APP_IMAGE_REPO}:${APP_IMAGE_TAG_TS}"
APP_IMAGE_NAME_LATEST="${APP_IMAGE_REPO}:${APP_IMAGE_LATEST_TAG}"

# Local content folder (can override or pass via env)
LOCAL_CONTENT_DIR="${LOCAL_CONTENT_DIR:-$HOME/pcloud-sync/telaclass-content}"

# Optional extras to sync to remote app dir (space-separated)
EXTRA_FILES="${EXTRA_FILES:-README.md}"

# Prefer docker compose plugin; fallback to docker-compose on remote
REMOTE_COMPOSE_FALLBACK="${REMOTE_COMPOSE_FALLBACK:-docker-compose}"

# =======================
# SSH helpers
# =======================
ssh_base_args=(-p "$SSH_PORT" -o StrictHostKeyChecking=accept-new)
[[ -n "$SSH_KEY" ]] && ssh_base_args+=(-i "$SSH_KEY")

ssh_do() {
  ssh "${ssh_base_args[@]}" "${SSH_USER}@${SSH_HOST}" -- "$@"
}

scp_do() {
  if [[ -n "$SSH_KEY" ]]; then
    scp -P "$SSH_PORT" -i "$SSH_KEY" "$@"
  else
    scp -P "$SSH_PORT" "$@"
  fi
}

rsync_do() {
  local src="$1" dst="$2"
  local -a args=(-azvh --delete -e "ssh -p ${SSH_PORT} ${SSH_KEY:+-i ${SSH_KEY}} -o StrictHostKeyChecking=accept-new")
  rsync "${args[@]}" "$src" "$dst"
}

require_local() {
  command -v "$1" >/dev/null 2>&1 || { echo "ERROR: '$1' not found locally." >&2; exit 1; }
}

# =======================
# Pre-flight local
# =======================
preflight_local() {
  [[ -f "$COMPOSE_FILE_LOCAL" ]] || { echo "ERROR: $COMPOSE_FILE_LOCAL not found."; exit 1; }
  [[ -d "$LOCAL_CONTENT_DIR" ]] || { echo "ERROR: Content dir not found: $LOCAL_CONTENT_DIR"; exit 1; }
  require_local ssh
  require_local scp
  require_local rsync
}

# =======================
# Remote checks / setup
# =======================
remote_detect_compose() {
  if ssh_do "docker compose version" >/dev/null 2>&1; then
    echo "docker compose"
  elif ssh_do "${REMOTE_COMPOSE_FALLBACK} version" >/dev/null 2>&1; then
    echo "${REMOTE_COMPOSE_FALLBACK}"
  else
    echo ""
  fi
}

remote_doctor() {
  echo ">> Checking Docker on remote..."
  ssh_do "command -v docker >/dev/null || echo '!! Docker not installed'"

  echo ">> Checking Compose on remote..."
  local DC
  DC="$(remote_detect_compose || true)"
  if [[ -z "$DC" ]]; then
    echo "!! Docker Compose not found on remote."
    echo "   Install the official plugin on the VM (Ubuntu):"
    echo "     sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin"
    exit 1
  else
    echo ">> Using remote compose: ${DC}"
  fi

  echo ">> Remote docker info (brief):"
  ssh_do "docker info --format '{{.ServerVersion}} - {{.OperatingSystem}} - CgroupDriver={{.CgroupDriver}}' || true"
}

remote_prepare_dirs() {
  ssh_do "mkdir -p ${REMOTE_APP_DIR} ${REMOTE_CONTENT_DIR} ${REMOTE_APP_DIR}/content/disciplinas"
}

remote_prepare_network() {
  ssh_do "docker network inspect ${NETWORK_NAME} >/dev/null 2>&1 || docker network create ${NETWORK_NAME}"
}

remote_sync_code() {
  echo ">> Syncing app code to remote: ${SSH_USER}@${SSH_HOST}:${REMOTE_APP_DIR}"
  # Exclude heavy/derived folders from code sync. Content is managed separately.
  local -a excludes=(
    --exclude .git --exclude node_modules --exclude .next --exclude content \
    --exclude docker-compose.debug.yml --exclude deploy.sh
  )
  rsync_do "./" "${SSH_USER}@${SSH_HOST}:${REMOTE_APP_DIR}/" "${excludes[@]}"
}

remote_sync_content() {
  echo ">> Syncing MDX content to remote: ${SSH_USER}@${SSH_HOST}:${REMOTE_CONTENT_DIR}"
  rsync_do "${LOCAL_CONTENT_DIR}/" "${SSH_USER}@${SSH_HOST}:${REMOTE_CONTENT_DIR}/"
}

remote_stage_content_into_app() {
  ssh_do "rsync -a --delete ${REMOTE_CONTENT_DIR}/ ${REMOTE_APP_DIR}/content/disciplinas/"
}

remote_copy_compose_and_extras() {
  echo ">> Copying compose file + extras"
  scp_do "$COMPOSE_FILE_LOCAL" "${SSH_USER}@${SSH_HOST}:${REMOTE_APP_DIR}/${COMPOSE_FILE_REMOTE}"
  for f in ${EXTRA_FILES}; do
    [[ -f "$f" ]] && scp_do "$f" "${SSH_USER}@${SSH_HOST}:${REMOTE_APP_DIR}/" || true
  done
}

remote_validate_compose() {
  local DC; DC="$(remote_detect_compose)"
  [[ -n "$DC" ]] || { echo "ERROR: Docker Compose not found on remote."; exit 1; }
  ssh_do "cd ${REMOTE_APP_DIR} && ${DC} -p ${PROJECT_NAME} -f ${COMPOSE_FILE_REMOTE} config >/dev/null"
}

remote_build_images() {
  echo ">> Building app image on remote: ${APP_IMAGE_NAME_TS} (+ latest)"
  ssh_do "cd ${REMOTE_APP_DIR} && docker build -t ${APP_IMAGE_NAME_TS} -t ${APP_IMAGE_NAME_LATEST} ."
}

remote_up() {
  local DC; DC="$(remote_detect_compose)"
  ssh_do "cd ${REMOTE_APP_DIR} && ${DC} -p ${PROJECT_NAME} -f ${COMPOSE_FILE_REMOTE} up -d --remove-orphans"
  remote_ps
}

remote_down() {
  local DC; DC="$(remote_detect_compose)"
  ssh_do "cd ${REMOTE_APP_DIR} && ${DC} -p ${PROJECT_NAME} -f ${COMPOSE_FILE_REMOTE} down"
}

remote_restart() {
  local DC; DC="$(remote_detect_compose)"
  ssh_do "cd ${REMOTE_APP_DIR} && ${DC} -p ${PROJECT_NAME} -f ${COMPOSE_FILE_REMOTE} up -d"
}

remote_logs() {
  local DC; DC="$(remote_detect_compose)"
  ssh_do "cd ${REMOTE_APP_DIR} && ${DC} -p ${PROJECT_NAME} -f ${COMPOSE_FILE_REMOTE} logs -f --tail=200"
}

remote_ps() {
  local DC; DC="$(remote_detect_compose)"
  ssh_do "cd ${REMOTE_APP_DIR} && ${DC} -p ${PROJECT_NAME} -f ${COMPOSE_FILE_REMOTE} ps"
}

remote_destroy() {
  local DC; DC="$(remote_detect_compose)"
  echo ">> WARNING: removing containers and volumes (keeps network ${NETWORK_NAME})"
  ssh_do "cd ${REMOTE_APP_DIR} && ${DC} -p ${PROJECT_NAME} -f ${COMPOSE_FILE_REMOTE} down -v"
}

remote_cleanup_old_images() {
  echo ">> Cleaning up old ${APP_IMAGE_REPO} images on remote (keeping: latest + ${APP_IMAGE_TAG_TS})"
  ssh_do bash -s <<EOF
set -e
KEEP1="${APP_IMAGE_NAME_LATEST}"
KEEP2="${APP_IMAGE_NAME_TS}"
docker images --format '{{.Repository}}:{{.Tag}}' \
  | awk -v repo='${APP_IMAGE_REPO}:' '$0 ~ ("^"repo) {print $1}' \
  | while read -r ref; do
      if [[ "\${ref}" != "\${KEEP1}" && "\${ref}" != "\${KEEP2}" ]]; then
        docker rmi "\${ref}" || true
      fi
    done
docker image prune -f || true
EOF
}

# =======================
# Commands
# =======================
cmd_sync() {
  preflight_local
  remote_doctor
  remote_prepare_dirs
  remote_sync_code
  remote_sync_content
  remote_stage_content_into_app
  remote_copy_compose_and_extras
}

cmd_up() {
  cmd_sync
  remote_prepare_network
  remote_validate_compose
  remote_build_images
  remote_up
  remote_cleanup_old_images
}

cmd_down()    { remote_down; }
cmd_restart() { remote_restart; }
cmd_logs()    { remote_logs; }
cmd_ps()      { remote_ps; }
cmd_destroy() { remote_destroy; }
cmd_doctor()  { remote_doctor; }

usage() {
  cat <<EOF
Usage: $(basename "$0") <command>

Env overrides:
  SSH_HOST, SSH_USER, SSH_PORT, SSH_KEY
  REMOTE_APP_DIR, REMOTE_CONTENT_DIR
  PROJECT_NAME, COMPOSE_FILE_LOCAL, COMPOSE_FILE_REMOTE
  NETWORK_NAME
  APP_IMAGE_REPO, APP_IMAGE_TAG_TS, APP_IMAGE_LATEST_TAG
  LOCAL_CONTENT_DIR

Commands:
  up         Sync code+content, build image, deploy (network, validate, up -d, cleanup)
  sync       Only sync code+content and compose to remote
  down       Stop the remote stack
  restart    Recreate/update the remote stack
  logs       Follow remote logs (compose services)
  ps         Show remote stack status
  destroy    Remove remote containers and volumes (keeps network)
  doctor     Show remote Docker/Compose diagnostics

Examples:
  SSH_PORT=22691 SSH_HOST=telaclass.ufsj.edu.br ./deploy.sh up
  LOCAL_CONTENT_DIR="$HOME/pcloud-sync/telaclass-content" ./deploy.sh sync
EOF
}

main() {
  local cmd="${1:-up}"
  case "$cmd" in
    up)       cmd_up ;;
    sync)     cmd_sync ;;
    down)     cmd_down ;;
    restart)  cmd_restart ;;
    logs)     cmd_logs ;;
    ps)       cmd_ps ;;
    destroy)  cmd_destroy ;;
    doctor)   cmd_doctor ;;
    *)        usage; exit 1 ;;
  esac
}
main "$@"
