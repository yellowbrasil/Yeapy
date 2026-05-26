# Guia de Testes - Features de Segurança

## Preparação

```bash
# Em um terminal, inicie o servidor local
npm run dev

# Em outro terminal, execute os testes:
cd /Users/fabioschnaider/yeapy
```

---

## 1. Teste de CSRF Protection

### 1.1 Gerar Token CSRF

```bash
# Primeiro, fazer login (ou use um token JWT válido)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "anunciante@yeapy.shop",
    "password": "senha123"
  }' -s | jq .session.access_token -r > token.txt

# Obter CSRF token
TOKEN=$(cat token.txt)
curl -X GET http://localhost:3000/api/auth/csrf-token \
  -H "Authorization: Bearer $TOKEN" -s | jq .csrfToken -r > csrf.txt

CSRF=$(cat csrf.txt)
echo "CSRF Token: $CSRF"
```

### 1.2 Enviar requisição COM token CSRF (deve funcionar)

```bash
TOKEN=$(cat token.txt)
CSRF=$(cat csrf.txt)

curl -X POST http://localhost:3000/api/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Teste CSRF com Token",
    "description": "Descrição para teste de CSRF protection",
    "productName": "Produto Teste",
    "categoryId": "cafc4b20-26ef-4dc5-bedf-e84a4c0b1acd",
    "cityId": "2a8eb142-1ed1-4cf3-825b-bc01f27c42c9",
    "originalPriceCents": 10000,
    "promotionalPriceCents": 5000,
    "isNational": true,
    "csrfToken": "'$CSRF'"
  }' -s | jq .

# Esperado: status 201, oferta criada com sucesso
```

### 1.3 Enviar requisição SEM token CSRF (deve falhar)

```bash
TOKEN=$(cat token.txt)

curl -X POST http://localhost:3000/api/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Teste CSRF sem Token",
    "description": "Descrição para teste de CSRF protection",
    "productName": "Produto Teste 2",
    "categoryId": "cafc4b20-26ef-4dc5-bedf-e84a4c0b1acd",
    "cityId": "2a8eb142-1ed1-4cf3-825b-bc01f27c42c9",
    "originalPriceCents": 10000,
    "promotionalPriceCents": 5000,
    "isNational": true
  }' -s | jq .

# Esperado: status 403, erro "Token CSRF inválido"
```

### 1.4 Enviar com token CSRF INVÁLIDO (deve falhar)

```bash
TOKEN=$(cat token.txt)

curl -X POST http://localhost:3000/api/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Teste CSRF Inválido",
    "description": "Descrição para teste de CSRF protection",
    "productName": "Produto Teste 3",
    "categoryId": "cafc4b20-26ef-4dc5-bedf-e84a4c0b1acd",
    "cityId": "2a8eb142-1ed1-4cf3-825b-bc01f27c42c9",
    "originalPriceCents": 10000,
    "promotionalPriceCents": 5000,
    "isNational": true,
    "csrfToken": "token_invalido_xyz"
  }' -s | jq .

# Esperado: status 403, erro "Token CSRF inválido"
```

---

## 2. Teste de Session Timeout

### 2.1 Criar uma sessão

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "anunciante@yeapy.shop",
    "password": "senha123"
  }' -s | jq .session.access_token -r > token_session.txt

TOKEN=$(cat token_session.txt)
echo "Token: $TOKEN"
```

### 2.2 Fazer requisição imediatamente (deve funcionar)

```bash
TOKEN=$(cat token_session.txt)

curl -X GET "http://localhost:3000/api/offers?limit=1" \
  -H "Authorization: Bearer $TOKEN" -s | jq .offers[0].title

# Esperado: nome da oferta (acesso permitido)
```

### 2.3 Esperar 30 minutos + 1 segundo

```bash
# Nota: Para teste rápido, modifique o arquivo:
# src/lib/security/session-timeout.ts
# Linha 5: const SESSION_TIMEOUT_MINUTES = 0.01 (30 segundos)
# Depois recompile com: npm run build

# Aguarde 31 segundos
sleep 31

# Fazer requisição novamente
TOKEN=$(cat token_session.txt)

curl -X GET "http://localhost:3000/api/offers?limit=1" \
  -H "Authorization: Bearer $TOKEN" -s | jq .

# Esperado: status 401, erro "Sessão expirada por inatividade"
```

---

## 3. Teste de CPF/CNPJ Validation

### 3.1 Registrar com CPF válido (deve funcionar)

```bash
# CPF válido: 123.456.789-10 (não é CPF real, mas passa na validação)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "empresa_cpf@test.com",
    "password": "Senha123!",
    "companyName": "Empresa com CPF",
    "slug": "empresa-cpf-test",
    "cpf": "123.456.789-10"
  }' -s | jq .

# Esperado: status 201, usuário criado
```

### 3.2 Registrar com CPF inválido (deve falhar)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "empresa_cpf_invalido@test.com",
    "password": "Senha123!",
    "companyName": "Empresa com CPF Inválido",
    "slug": "empresa-cpf-invalido",
    "cpf": "000.000.000-00"
  }' -s | jq .

# Esperado: status 400, erro "CPF inválido"
```

### 3.3 Registrar com CNPJ válido (deve funcionar)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "empresa_cnpj@test.com",
    "password": "Senha123!",
    "companyName": "Empresa com CNPJ",
    "slug": "empresa-cnpj-test",
    "cnpj": "12.345.678/0001-90"
  }' -s | jq .

# Esperado: status 201, usuário criado
```

### 3.4 Registrar com CNPJ inválido (deve falhar)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "empresa_cnpj_invalido@test.com",
    "password": "Senha123!",
    "companyName": "Empresa com CNPJ Inválido",
    "slug": "empresa-cnpj-invalido",
    "cnpj": "00.000.000/0000-00"
  }' -s | jq .

# Esperado: status 400, erro "CNPJ inválido"
```

---

## 4. Teste de Webhook Signing (Asaas)

### 4.1 Simular webhook com assinatura VÁLIDA

```bash
# 1. Gerar HMAC válido
PAYLOAD='{"event":"PAYMENT_CONFIRMED","payment":{"id":"pay_123"}}'
SECRET="sua_asaas_webhook_secret"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

echo "Payload: $PAYLOAD"
echo "Signature: $SIGNATURE"

# 2. Enviar webhook
curl -X POST http://localhost:3000/api/asaas/webhook \
  -H "Content-Type: application/json" \
  -H "asaas-signature: $SIGNATURE" \
  -d "$PAYLOAD" -s | jq .

# Esperado: status 200, { "received": true }
```

### 4.2 Simular webhook com assinatura INVÁLIDA

```bash
curl -X POST http://localhost:3000/api/asaas/webhook \
  -H "Content-Type: application/json" \
  -H "asaas-signature: signature_invalida" \
  -d '{"event":"PAYMENT_CONFIRMED"}' -s | jq .

# Esperado: status 401, erro "Assinatura de webhook inválida"
```

### 4.3 Simular webhook SEM assinatura

```bash
curl -X POST http://localhost:3000/api/asaas/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"PAYMENT_CONFIRMED"}' -s | jq .

# Esperado: status 401, erro "Assinatura de webhook não encontrada"
```

---

## 5. Teste de Logs de Segurança

### 5.1 Verificar tentativa de CSRF inválido foi logada

```bash
# No Supabase Dashboard, SQL Editor:
SELECT event_type, details, ip_address, created_at 
FROM security_logs 
WHERE event_type = 'csrf_token_invalid'
ORDER BY created_at DESC 
LIMIT 5;
```

### 5.2 Verificar tentativa de webhook inválido foi logada

```bash
SELECT event_type, details, ip_address, created_at 
FROM security_logs 
WHERE event_type = 'webhook_signature_invalid'
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 6. Teste de Integração Completa

```bash
#!/bin/bash

echo "=== Teste de Integração de Segurança ==="

# 1. Login
echo "1. Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "anunciante@yeapy.shop",
    "password": "senha123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r .session.access_token)
echo "✓ Logado com token: ${TOKEN:0:20}..."

# 2. Obter CSRF token
echo "2. Obtendo CSRF token..."
CSRF=$(curl -s -X GET http://localhost:3000/api/auth/csrf-token \
  -H "Authorization: Bearer $TOKEN" | jq -r .csrfToken)
echo "✓ CSRF token obtido: ${CSRF:0:20}..."

# 3. Criar oferta com CSRF
echo "3. Criando oferta com CSRF..."
OFFER=$(curl -s -X POST http://localhost:3000/api/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Teste Integração",
    "description": "Teste completo de segurança",
    "productName": "Produto Teste",
    "categoryId": "cafc4b20-26ef-4dc5-bedf-e84a4c0b1acd",
    "cityId": "2a8eb142-1ed1-4cf3-825b-bc01f27c42c9",
    "originalPriceCents": 10000,
    "promotionalPriceCents": 5000,
    "isNational": true,
    "csrfToken": "'$CSRF'"
  }')

OFFER_ID=$(echo "$OFFER" | jq -r .offer.id)
if [ "$OFFER_ID" != "null" ] && [ -n "$OFFER_ID" ]; then
  echo "✓ Oferta criada: $OFFER_ID"
else
  echo "✗ Erro ao criar oferta"
  echo "$OFFER" | jq .
fi

echo ""
echo "=== Todos os testes de segurança passaram! ==="
```

---

## Checklist de Validação

- [ ] CSRF token é gerado corretamente
- [ ] CSRF token previne requisições de sites externos
- [ ] Requisição com token expirado é rejeitada
- [ ] Session expira após inatividade
- [ ] CPF válido é aceito
- [ ] CPF inválido é rejeitado
- [ ] CNPJ válido é aceito
- [ ] CNPJ inválido é rejeitado
- [ ] Webhook com assinatura válida é aceito
- [ ] Webhook com assinatura inválida é rejeitado
- [ ] Webhook sem assinatura é rejeitado
- [ ] Logs de segurança registram eventos corretamente

---

## Notas

- Todos os testes usam `http://localhost:3000` (ambiente local)
- Para testar em produção, substituir por `https://yeapy.shop`
- O CPF/CNPJ `123.456.789-10` e `12.345.678/0001-90` não são reais
- Usar dados reais apenas em testes de integração
- Logs estão em Supabase > `security_logs` table

