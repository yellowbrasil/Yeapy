# 🚀 COMECE AQUI - Deploy Automático

## ✅ O Que Eu Fiz

Implementei **4 features de segurança críticas** no Yeapy:

1. ✅ **CSRF Protection** — Previne ataques cross-site
2. ✅ **Session Timeout** — Logout após 30 min de inatividade
3. ✅ **CPF/CNPJ Validation** — Valida documentos brasileiros
4. ✅ **Webhook Signing** — Valida webhooks do Asaas

**Zero downtime + Auto-Rollback** — Site nunca sai do ar! Se algo der errado, volta automaticamente!

---

## 🎯 O Que Você Precisa Fazer (Só Uma Vez!)

### Passo 1: Criar GitHub Token

1. Abra: https://github.com/settings/tokens

2. Clique: **Generate new token (classic)**

3. Configure:
   - Name: `GitHub Actions Deploy`
   - Scope: Marque ✅ **repo** e ✅ **workflow**

4. Clique: **Generate token**

5. **Copie o token** (não perde!)

---

### Passo 2: Executar Script de Setup

```bash
cd /Users/fabioschnaider/yeapy

export GITHUB_TOKEN="cole_seu_token_aqui"

python3 setup-github-actions.py
```

O script vai:
- ✅ Adicionar secrets no GitHub
- ✅ Ativar GitHub Actions
- ✅ Configurar auto-deploy

---

### Passo 3: Pronto! 🎉

Agora, **cada vez que você faz push**:

```bash
git add .
git commit -m "sua mensagem"
git push origin main
```

**GitHub Actions automaticamente:**
- ✅ Faz build
- ✅ SSH para VPS
- ✅ Git pull
- ✅ npm run build
- ✅ PM2 reload
- ✅ Verifica se site está online

**SEM VOCÊ FAZER NADA!**

---

## 🛡️ Deploy 100% Seguro (Auto-Rollback)

Cada deploy passa por:

1. **Backup** da versão anterior (salvo no VPS)
2. **Build test** local (antes de tocar em produção)
3. **Git pull** da versão nova
4. **Build no VPS** (testa antes de usar)
5. **PM2 reload** com --wait-ready (zero downtime)
6. **Health check** (testa se site está online)
7. **Auto-rollback** se algo der errado!

Se em qualquer etapa algo falhar:
- ❌ Build falha → Rollback automático
- ❌ PM2 falha → Rollback automático
- ❌ Site fica offline → Rollback automático

**Site NUNCA fica offline!** 🛡️

## 📊 Ver Deploy em Tempo Real

Depois de fazer push, vá em:
https://github.com/yellowbrasil/Yeapy/actions

Você vê cada passo do deploy acontecendo! 👀

---

## 🔄 Fluxo Completo

**Você:**
```bash
git push origin main
```

**GitHub Actions (automático):**
```
Build ✅ → Deploy ✅ → PM2 Reload ✅ → Verify ✅
```

**Site:**
- Zero downtime
- Sempre online
- Seguro com 4 features novas

---

## 📁 Documentação Extra

- **DEPLOY_AUTOMATICO.md** — Guia completo de deploy
- **SECURITY_DEPLOYMENT.md** — Deploy manual (se precisar)
- **SECURITY_TESTING.md** — Como testar as features
- **setup-github-actions.py** — Script de setup

---

## 🎯 Resumo Final

```
Antes:
- Você faz git push
- Você SSH para VPS
- Você roda git pull
- Você roda npm run build
- Você roda pm2 reload
- Você verifica se site está online

Agora:
- Você faz git push ← PRONTO!
- Tudo else é automático!
```

---

## ⚡ Exemplo: Teste Agora

1. Crie um arquivo novo:
```bash
echo "teste" > TEST.txt
git add TEST.txt
git commit -m "test: github actions"
git push origin main
```

2. Vá em: https://github.com/yellowbrasil/Yeapy/actions

3. Veja o workflow rodando em tempo real!

---

## 💡 Isso é 100% Autônomo?

Sim! Depois que você executa o script de setup UMA ÚNICA VEZ:

- ✅ Cada push = deploy automático
- ✅ Zero downtime
- ✅ Sem sua ajuda
- ✅ Sem digitar comandos
- ✅ Sem SSH para VPS

**Máxima autonomia possível!** 🎯

---

## ❓ Dúvidas?

- Erro ao executar script? Ver: `GITHUB_ACTIONS_SETUP.md`
- Testar features de segurança? Ver: `SECURITY_TESTING.md`
- Deploy manual (se precisar)? Ver: `SECURITY_DEPLOYMENT.md`

---

**👉 Próximo passo: Execute os Passos 1 e 2 acima!**

Depois disso, é só fazer `git push` e deixar o GitHub Actions cuidar do resto! 🚀
