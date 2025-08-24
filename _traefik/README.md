Esta pasta contém o docker compose do traefik para trabalhar junto com esta aplicação

Deve-se também criar as pastas que armazenam o certificado ssl

```
mkdir -p /srv/infra/traefik/letsencrypt
touch /srv/infra/traefik/letsencrypt/acme.json
chmod 600 /srv/infra/traefik/letsencrypt/acme.json
```

O traefi