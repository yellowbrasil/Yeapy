# GitHub Actions - Auto Deploy (UMA VEZ APENAS)

**Depois de configurar uma vez, todo push para `main` faz deploy automático!**

---

## ⚡ Setup Rápido (2 passos)

### Passo 1: Adicionar SSH Key como Secret

1. Abra: https://github.com/yellowbrasil/Yeapy/settings/secrets/actions

2. Clique: **New repository secret**

3. Adicione 3 secrets:

#### Secret 1: VPS_HOST
- **Name**: `VPS_HOST`
- **Value**: `69.62.93.231`
- Clique: **Add secret**

#### Secret 2: VPS_SSH_KEY
- **Name**: `VPS_SSH_KEY`
- **Value**: (sua chave SSH privada)
  
  Para gerar/obter a chave:
  ```bash
  cat ~/.ssh/id_rsa
  ```
  
  Se não tiver, pode usar a senha:
  ```bash
  ssh-keyscan -H 69.62.93.231
  ```

- Clique: **Add secret**

#### Secret 3: SLACK_WEBHOOK (opcional)
- **Name**: `SLACK_WEBHOOK`
- **Value**: `https://hooks.slack.com/services/...`
- Clique: **Add secret**

### Passo 2: Pronto!

Agora, **toda vez que você faz push para `main`**:

```bash
git push origin main
```

**O GitHub automaticamente:**
1. ✅ Faz build
2. ✅ SSH para VPS
3. ✅ Git pull
4. ✅ npm run build  
5. ✅ PM2 reload (zero downtime!)
6. ✅ Verifica se site está online
7. ✅ Notifica você (via Slack/Email)

---

## 🔍 Ver Deploy em Tempo Real

Clique aqui: https://github.com/yellowbrasil/Yeapy/actions

Você verá cada deploy acontecendo em tempo real!

---

## 🚨 Se der erro

1. Clique no workflow que falhou
2. Ver **Logs** do erro
3. Arrumar o código
4. Fazer push novamente

---

## ✅ Pronto!

Agora é totalmente autônomo. Zero downtime. Sem sua ajuda.

Cada `git push` = deploy automático! 🚀
