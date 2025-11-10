# Integração com Stripe - Documentação Completa

## Visão Geral

Este documento descreve a integração completa do Stripe para processamento de pagamentos no projeto bewear-ecommerce-web-nextjs, incluindo configuração local e deploy em produção na Vercel.

## Dependências

```json
{
  "@stripe/stripe-js": "^7.8.0",
  "stripe": "^18.4.0"
}
```

## Índice

1. [Configuração Inicial](#1-configuração-inicial)
2. [Server Action - Criar Sessão de Checkout](#2-server-action---criar-sessão-de-checkout)
3. [Webhook Endpoint](#3-webhook-endpoint)
4. [Configuração Local do Webhook](#4-configuração-local-do-webhook)
5. [Páginas de Callback](#5-páginas-de-callback)
6. [Deploy na Vercel](#6-deploy-na-vercel)
7. [Variáveis de Ambiente](#7-variáveis-de-ambiente)
8. [Fluxo Completo](#8-fluxo-completo)

---

## 1. Configuração Inicial

### 1.1 Criar Conta no Stripe

1. Acesse [stripe.com](https://stripe.com) e crie uma conta
2. Complete o processo de verificação da conta
3. Acesse o Dashboard do Stripe

### 1.2 Obter Chaves de API

No Dashboard do Stripe, navegue até **Desenvolvedores > Chaves de API**:

**Ambiente de Desenvolvimento (Test Mode):**
- Chave publicável: `pk_test_...`
- Chave secreta: `sk_test_...`

**Ambiente de Produção (Live Mode):**
- Chave publicável: `pk_live_51QJ7V2Arx...`
- Chave secreta: `sk_live_51QJ7V2Arx...`

---

## 2. Server Action - Criar Sessão de Checkout

### 2.1 Localização
`src/actions/create-checkout-session-stripe/index.ts`

### 2.2 Funcionalidade
Esta server action cria uma sessão de checkout no Stripe e retorna o `sessionId` para redirecionar o usuário.

### 2.3 Variáveis de Ambiente Necessárias
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
```

### 2.4 URLs de Callback
A sessão de checkout é configurada com duas URLs de retorno:

```typescript
success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`
cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`
```

### 2.5 Metadata
O `orderId` é enviado como metadata na sessão:

```typescript
metadata: {
  orderId: "uuid-do-pedido"
}
```

Este `orderId` será usado posteriormente pelo webhook para atualizar o status do pedido.

---

## 3. Webhook Endpoint

### 3.1 Localização
`src/app/api/stripe/webhook/route.ts`

### 3.2 Funcionalidade
Endpoint que recebe eventos do Stripe via webhook para processar atualizações de pagamento.

### 3.3 Eventos Processados

#### `checkout.session.completed`
- Disparado quando o pagamento é concluído com sucesso
- Atualiza o status do pedido para "pago"
- Utiliza o `orderId` do metadata para identificar o pedido

#### `checkout.session.expired`
- Disparado quando a sessão expira sem pagamento
- Permite tratamento de sessões abandonadas

### 3.4 Variáveis de Ambiente Necessárias
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3.5 Segurança
O webhook valida a assinatura do evento usando `STRIPE_WEBHOOK_SECRET` para garantir que a requisição veio do Stripe:

```typescript
const signature = headers().get('stripe-signature')
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
```

---

## 4. Configuração Local do Webhook

### 4.1 Instalar Stripe CLI

#### Windows
1. Baixe o Stripe CLI: [https://docs.stripe.com/stripe-cli/install?install-method=windows](https://docs.stripe.com/stripe-cli/install?install-method=windows)
2. Extraia o executável para `C:\DevPrograms\stripe-cli\`

#### macOS (Homebrew)
```bash
brew install stripe/stripe-cli/stripe
```

#### Linux
```bash
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

### 4.2 Autenticar CLI

```bash
stripe login
```

Ou no Windows:
```bash
C:\DevPrograms\stripe-cli\stripe.exe login
```

Siga as instruções para autorizar o CLI no navegador.

### 4.3 Iniciar Listener Local

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Ou no Windows:
```bash
C:\DevPrograms\stripe-cli\stripe.exe listen --forward-to localhost:3000/api/stripe/webhook
```

### 4.4 Obter Webhook Secret

Após executar o comando acima, o CLI exibirá:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Copie este valor e adicione ao arquivo `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 4.5 Testar Webhook Localmente

Com o listener ativo, você verá os eventos sendo recebidos no terminal:

```
2025-11-09 10:30:15  --> checkout.session.completed [evt_xxxxx]
2025-11-09 10:30:15  <-- [200] POST http://localhost:3000/api/stripe/webhook
```

---

## 5. Páginas de Callback

### 5.1 Página de Sucesso
**Rota:** `/checkout/success`
**Localização:** `src/app/checkout/success/page.tsx`

Exibida quando o pagamento é concluído com sucesso.

**Funcionalidades:**
- Confirmar conclusão do pedido
- Exibir número do pedido
- Mostrar detalhes da compra
- Opções de próximos passos (acompanhar pedido, continuar comprando)

### 5.2 Página de Cancelamento
**Rota:** `/checkout/cancel`
**Localização:** `src/app/checkout/cancel/page.tsx`

Exibida quando o usuário cancela o pagamento ou a sessão expira.

**Funcionalidades:**
- Informar que o pagamento foi cancelado
- Manter itens no carrinho
- Permitir retornar ao checkout
- Oferecer suporte ao cliente

---

## 6. Deploy na Vercel

### 6.1 Configurar Variáveis de Ambiente

No painel da Vercel:

1. Acesse seu projeto
2. Vá em **Settings > Environment Variables**
3. Adicione as seguintes variáveis:

```env
# Stripe - Produção
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51QJ7V2Arx...
STRIPE_SECRET_KEY=sk_live_51QJ7V2Arx...
STRIPE_WEBHOOK_SECRET=whsec_... (será obtido no próximo passo)

# App URL
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

### 6.2 Configurar Webhook em Produção

#### No Dashboard do Stripe:

1. Acesse **Desenvolvedores > Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL:** `https://seu-dominio.vercel.app/api/stripe/webhook`
   - **Events to send:**
     - `checkout.session.completed`
     - `checkout.session.expired`
   - (Opcional) Adicione outros eventos conforme necessário

4. Clique em **Add endpoint**

#### Obter Webhook Secret:

1. Clique no endpoint criado
2. Na seção **Signing secret**, clique em **Reveal**
3. Copie o valor (começa com `whsec_`)
4. Adicione à variável `STRIPE_WEBHOOK_SECRET` na Vercel

### 6.3 Testar em Produção

#### Usar Test Mode do Stripe:

1. No Dashboard do Stripe, alterne para **Test Mode**
2. Use cartões de teste:
   - **Sucesso:** `4242 4242 4242 4242`
   - **Requer autenticação:** `4000 0025 0000 3155`
   - **Falha:** `4000 0000 0000 9995`
   - **Data de expiração:** Qualquer data futura
   - **CVC:** Qualquer 3 dígitos
   - **CEP:** Qualquer CEP válido

3. Monitore os webhooks em **Desenvolvedores > Webhooks > [seu-endpoint]**

#### Promover para Live Mode:

Quando estiver pronto para produção:

1. Complete a ativação da conta Stripe
2. Atualize as variáveis de ambiente na Vercel para usar chaves Live:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```
3. Crie um novo webhook endpoint para Live Mode
4. Atualize `STRIPE_WEBHOOK_SECRET` com o novo valor

---

## 7. Variáveis de Ambiente

### 7.1 Ambiente Local (.env)

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe - Test Mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (obtido via Stripe CLI)

# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

# Email
RESEND_API_KEY=...
```

### 7.2 Ambiente de Produção (Vercel)

```env
# App
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app

# Stripe - Live Mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51QJ7V2Arx...
STRIPE_SECRET_KEY=sk_live_51QJ7V2Arx...
STRIPE_WEBHOOK_SECRET=whsec_... (obtido no Dashboard do Stripe)

# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://seu-dominio.vercel.app

# Email
RESEND_API_KEY=...
```

### 7.3 Nomenclatura Importante

- Variáveis com prefixo `NEXT_PUBLIC_` são expostas ao cliente (browser)
- Variáveis sem prefixo são apenas para o servidor
- **NUNCA** exponha `STRIPE_SECRET_KEY` ou `STRIPE_WEBHOOK_SECRET` ao cliente

---

## 8. Fluxo Completo

### 8.1 Fluxo de Pagamento

```
1. Usuário finaliza carrinho
   └─> Clica em "Finalizar Compra"

2. Aplicação cria pedido no banco de dados
   └─> Gera orderId único

3. Server Action: createCheckoutSessionStripe()
   ├─> Envia items, valores, orderId (metadata)
   └─> Stripe retorna sessionId

4. Cliente redireciona para Stripe Checkout
   └─> loadStripe() + redirectToCheckout()

5. Usuário paga no Stripe
   ├─> Sucesso: redireciona para /checkout/success
   └─> Cancelamento: redireciona para /checkout/cancel

6. Stripe envia webhook: checkout.session.completed
   ├─> Aplicação valida assinatura
   ├─> Extrai orderId do metadata
   └─> Atualiza status do pedido para "pago"

7. Pedido processado
   └─> Usuário vê confirmação em /checkout/success
```

### 8.2 Diagrama de Arquitetura

```
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Criar pedido
       ▼
┌─────────────────────────────┐
│   createCheckoutSession()   │
│      (Server Action)        │
└──────────┬──────────────────┘
           │
           │ 2. Criar sessão
           ▼
    ┌─────────────┐
    │   Stripe    │
    │     API     │
    └──────┬──────┘
           │
           │ 3. Retorna sessionId
           ▼
    ┌─────────────┐
    │  Cliente    │
    │ redireciona │
    └──────┬──────┘
           │
           │ 4. Checkout
           ▼
    ┌─────────────┐
    │   Stripe    │
    │  Checkout   │
    └──────┬──────┘
           │
           ├─> 5a. Sucesso ──> /checkout/success
           │
           └─> 5b. Cancelar ─> /checkout/cancel
           │
           │ 6. Webhook Event
           ▼
┌──────────────────────────┐
│  /api/stripe/webhook     │
│  ├─ Valida assinatura    │
│  ├─ Extrai metadata      │
│  └─ Atualiza pedido      │
└──────────────────────────┘
```

---

## 9. Troubleshooting

### 9.1 Webhook não recebe eventos (Local)

**Problema:** Stripe CLI não encaminha eventos

**Solução:**
1. Verifique se o CLI está rodando
2. Confirme que a porta está correta (3000)
3. Verifique se `STRIPE_WEBHOOK_SECRET` está no `.env`
4. Reinicie o servidor Next.js

### 9.2 Webhook retorna erro 400/500 (Produção)

**Problema:** Assinatura inválida ou erro no processamento

**Soluções:**
1. Verifique se `STRIPE_WEBHOOK_SECRET` está correto na Vercel
2. Confirme que o endpoint está configurado para a URL correta
3. Verifique logs da Vercel para detalhes do erro
4. Teste o webhook no Dashboard do Stripe usando "Send test webhook"

### 9.3 Redirecionamento falha após pagamento

**Problema:** `success_url` ou `cancel_url` incorretas

**Solução:**
1. Verifique se `NEXT_PUBLIC_APP_URL` está correto
2. Confirme que as páginas `/checkout/success` e `/checkout/cancel` existem
3. Verifique os logs do navegador para erros de redirecionamento

### 9.4 Pedido não atualiza após pagamento

**Problema:** Webhook não processa `orderId` corretamente

**Solução:**
1. Verifique se `metadata.orderId` está sendo enviado na sessão
2. Confirme que o webhook extrai e usa `orderId` corretamente
3. Verifique logs do webhook no Dashboard do Stripe
4. Teste manualmente enviando evento de teste

---

## 10. Segurança e Boas Práticas

### 10.1 Checklist de Segurança

- [ ] Nunca exponha `STRIPE_SECRET_KEY` ao cliente
- [ ] Sempre valide assinatura do webhook com `STRIPE_WEBHOOK_SECRET`
- [ ] Use HTTPS em produção para webhooks
- [ ] Implemente idempotência no webhook (evitar processar o mesmo evento duas vezes)
- [ ] Valide valores no servidor antes de criar sessão
- [ ] Não confie em dados do cliente para valores de pagamento
- [ ] Use Live Mode apenas em produção verificada

### 10.2 Boas Práticas

- [ ] Mantenha logs de todos os eventos do webhook
- [ ] Implemente retry logic para falhas de webhook
- [ ] Use Test Mode durante desenvolvimento
- [ ] Configure alertas para falhas de webhook na Vercel
- [ ] Documente metadata customizado usado nas sessões
- [ ] Implemente timeout apropriado para sessões de checkout
- [ ] Teste todos os cenários (sucesso, falha, expiração)

---

## 11. Recursos Adicionais

- [Documentação Oficial do Stripe](https://stripe.com/docs)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Next.js + Stripe Guide](https://stripe.com/docs/payments/checkout/how-checkout-works)
- [Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Testing Stripe](https://stripe.com/docs/testing)

---

## Changelog

- **2025-11-09**: Documentação inicial criada
