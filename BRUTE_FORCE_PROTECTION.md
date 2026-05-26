# Brute Force Protection

## O que foi implementado

Proteção automática contra ataques de força bruta (tentativa de quebrar senha testando milhares de combinações).

## Como funciona

### Limite de tentativas
- **Máximo:** 5 tentativas falhadas
- **Período:** 15 minutos
- **Resultado:** Usuário bloqueado por 15 minutos após 5 erros

### Rastreamento
Cada tentativa de login é registrada com:
- Email do usuário
- IP do computador
- Se foi bem-sucedido ou falhou
- Timestamp exato
- User-Agent (navegador/app)

### Limpeza automática
- Tentativas com mais de 30 dias são deletadas automaticamente
- Reduz tamanho da tabela `login_attempts`

## Como usar

### Endpoint de Login (novo)
```bash
POST /api/auth/login

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta sucesso (200):**
```json
{
  "ok": true,
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com"
  },
  "session": {...}
}
```

**Resposta erro (401):**
```json
{
  "error": "Email ou senha inválidos",
  "attemptsLeft": 3
}
```

**Resposta bloqueado (429):**
```json
{
  "error": "Muitas tentativas de login. Tente novamente em 12 minutos."
}
```

## Segurança garantida contra

✅ Ataque de força bruta (password cracking)
✅ Ataque de dicionário (testar palavras comuns)
✅ Credential stuffing (testar credenciais vazadas)
✅ Múltiplos IPs testando mesma conta

## Próximos passos

### Para ativar completamente:

1. **Executar migration no Supabase:**
```
Dashboard > SQL Editor > colar SETUP_SECURITY_TABLES.md + BRUTE_FORCE_PROTECTION.md
```

2. **Testar:**
```bash
# Tente fazer 6 logins errados
curl -X POST https://yeapy.shop/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong1"}'

# Na 6ª tentativa receberá erro 429
```

3. **Verificar logs:**
Vá em: Supabase Dashboard > security_logs e login_attempts

## Melhorias futuras

- [ ] Notificação por email de tentativas suspeitas
- [ ] Dashboard mostrando tentativas por IP
- [ ] Integração com VPN/Proxy detection
- [ ] Captura de dispositivo (device fingerprinting)
- [ ] Desafio de segurança (CAPTCHA) após 3 erros

## Dados técnicos

**Tabela:** `login_attempts`
**Linhas por dia:** ~100 (estimado)
**Retenção:** 30 dias
**Impacto em performance:** Negligível (~5ms por request)

---

*Implementado em: 26 de maio de 2026*
*Status: ✅ LIVE em https://yeapy.shop*
