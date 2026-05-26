# ✅ Deploy Automático - Sem Sua Ajuda!

**Agora cada `git push` faz deploy automático no VPS com zero downtime!**

---

## 🚀 Setup (UMA ÚNICA VEZ - 2 minutos)

### Opção A: Automático (Recomendado)

```bash
cd /Users/fabioschnaider/yeapy
python3 setup-github-actions.py
```

O script vai:
1. Pedir seu GitHub token
2. Obter sua chave SSH
3. Adicionar secrets no GitHub automaticamente
4. Pronto! ✅

### Opção B: Manual

Se o script não funcionar:

1. Ir em: https://github.com/yellowbrasil/Yeapy/settings/secrets/actions

2. Adicionar 2 secrets:
   - `VPS_HOST` = `69.62.93.231`
   - `VPS_SSH_KEY` = (seu conteúdo de `~/.ssh/id_rsa`)

---

## 💡 Como Usar (Depois disso é fácil!)

Agora, quando você quer fazer deploy:

```bash
git add -A
git commit -m "meu comentario"
git push origin main
```

**Pronto!** O GitHub Actions automaticamente:

✅ Faz build
✅ SSH para VPS
✅ Git pull
✅ npm run build
✅ PM2 reload (zero downtime!)
✅ Verifica se site está online

Tudo automático, **SEM VOCÊ FAZER NADA!**

---

## 📊 Ver Deploy em Tempo Real

Clique aqui e veja cada deploy acontecendo:
https://github.com/yellowbrasil/Yeapy/actions

---

## 🔄 Fluxo Completo

**Antes (com sua ajuda):**
1. Você roda: `git push`
2. Você faz SSH no VPS
3. Você roda: `git pull`
4. Você roda: `npm run build`
5. Você roda: `pm2 reload`

**Agora (automático):**
1. Você roda: `git push`
2. GitHub Actions faz tudo else automaticamente ✨

---

## ⚡ Exemplo: Agora Você Quer Adicionar uma Feature

```bash
# Código local
vim src/app/api/offers/route.ts
git add .
git commit -m "feat: minha nova feature"
git push origin main

# GitHub Actions agora:
# ✅ Build
# ✅ Deploy VPS
# ✅ PM2 reload
# ✅ Verifica se site está online

# Você pode simplesmente ir tomar um café! ☕
```

---

## 🚨 Se der erro no deploy

1. Ir em: https://github.com/yellowbrasil/Yeapy/actions
2. Ver o workflow que falhou
3. Clicar em "Run workflow" depois de arrumar

---

## 📝 Checklist

- [ ] Rodou `python3 setup-github-actions.py` ou adicionou secrets manualmente
- [ ] Secrets aparecem em: https://github.com/yellowbrasil/Yeapy/settings/secrets/actions
- [ ] Workflow file existe: `.github/workflows/deploy.yml`
- [ ] Testou: `git push origin main` para ver deploy em: /actions

---

## ✨ Agora Você Tem Deploy 100% Autônomo!

Toda vez que faz `git push`:
- ✅ Build automático
- ✅ Deploy automático
- ✅ Zero downtime
- ✅ Sem sua ajuda
- ✅ Sem digitar comandos no VPS

**Isso é o máximo de autonomia que é possível! 🎯**

