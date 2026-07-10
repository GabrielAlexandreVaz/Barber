# Deploy — The Guetto Barber (VPS Ubuntu)

Guia de produção com **PM2 + Nginx + SSL (Let's Encrypt)**. Assume Ubuntu 22.04+,
um domínio apontando para o IP da VPS e acesso `sudo`.

Arquivos de apoio no repositório:
- `ecosystem.config.js` — processos PM2 (API + Web)
- `deploy/nginx/theguetto.conf` — server block do Nginx
- `backend/.env.production.example` e `frontend/.env.production.example`

> Caminho usado nos exemplos: `/var/www/theguetto`. Ajuste se usar outro.

---

## 1. Preparar o servidor

```bash
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL, Nginx, Git e utilitários
sudo apt install -y postgresql postgresql-contrib nginx git

# PM2 global
sudo npm install -g pm2

node -v && npm -v && psql --version
```

### Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 2. Banco de dados

```bash
sudo -u postgres psql <<'SQL'
CREATE USER guetto WITH PASSWORD 'SENHA_FORTE';
CREATE DATABASE the_guetto OWNER guetto;
GRANT ALL PRIVILEGES ON DATABASE the_guetto TO guetto;
SQL
```

---

## 3. Clonar e configurar

```bash
sudo mkdir -p /var/www/theguetto
sudo chown -R $USER:$USER /var/www/theguetto
git clone <URL_DO_REPO> /var/www/theguetto
cd /var/www/theguetto
```

### Backend
```bash
cd backend
cp .env.production.example .env
nano .env   # ajuste DATABASE_URL, CORS_ORIGIN e gere os segredos JWT

npm ci
npx prisma migrate deploy    # aplica as migrations em produção
npm run prisma:seed          # cria roles + admin inicial
```

### Frontend
```bash
cd ../frontend
cp .env.production.example .env.production
nano .env.production   # NEXT_PUBLIC_API_URL=https://seudominio.com.br/api

npm ci
npm run build          # embute o NEXT_PUBLIC_API_URL — rode APÓS ajustar o .env
```

> Se preferir o build **standalone** (Next `output: 'standalone'`, já configurado):
> após `npm run build`, copie os estáticos para a pasta standalone e rode
> `node .next/standalone/server.js`. O padrão do `ecosystem.config.js` usa
> `npm start` (`next start`), que é mais simples e igualmente estável.

---

## 4. Subir com PM2

```bash
cd /var/www/theguetto
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup            # execute o comando que ele imprimir (para subir no boot)

pm2 status             # guetto-api (4000) e guetto-web (3000) devem estar online
curl http://localhost:4000/api/health
```

---

## 5. Nginx

```bash
sudo cp /var/www/theguetto/deploy/nginx/theguetto.conf /etc/nginx/sites-available/theguetto
sudo nano /etc/nginx/sites-available/theguetto   # troque server_name e o alias de /uploads

sudo ln -s /etc/nginx/sites-available/theguetto /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo mkdir -p /var/www/certbot

sudo nginx -t && sudo systemctl reload nginx
```

---

## 6. SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
# Renovação automática já vem via systemd timer. Teste:
sudo certbot renew --dry-run
```

---

## 7. Atualizações (deploy de novas versões)

```bash
cd /var/www/theguetto
git pull

cd backend && npm ci && npx prisma migrate deploy && cd ..
cd frontend && npm ci && npm run build && cd ..

pm2 reload ecosystem.config.js   # reinício sem downtime
```

---

## Checklist pós-deploy
- [ ] `https://seudominio.com.br` abre a landing (nome/logo da barbearia)
- [ ] `https://seudominio.com.br/api/health` → `{"success":true,...}`
- [ ] Login do admin funciona e o dashboard carrega
- [ ] Upload de imagem funciona e a imagem aparece (via `/uploads`)
- [ ] `pm2 status` mostra os dois apps `online`
- [ ] Troque a senha do admin do seed

## Observações de segurança
- Gere segredos JWT novos e fortes no `.env` de produção.
- Nunca versione o `.env` (já está no `.gitignore`).
- Considere backup periódico do Postgres (`pg_dump`) e da pasta `backend/uploads`.
- Logs do PM2: `pm2 logs` · rotação: `pm2 install pm2-logrotate`.
