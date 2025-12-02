# 🎯 Feature Specs - Bewear E-commerce
## Guia Prático de Implementação

### Visão Geral

Este documento apresenta a **ordem exata de implementação** de todas as features do Bewear E-commerce, seguindo os padrões estabelecidos nos documentos de projeto.

---

## 📚 Documentos de Referência (Leia Nesta Ordem)

1. **PRIMEIRO:** [prd.md](prd.md)
   - Visão executiva do produto
   - Requisitos funcionais e não funcionais
   - KPIs e métricas
   - **Tempo:** 45 minutos

2. **SEGUNDO:** [development-guidelines.md](development-guidelines.md)
   - Padrões de código e arquitetura
   - Regras de segurança
   - Exemplos de referência
   - **Tempo:** 30 minutos

3. **TERCEIRO:** [sdd.md](sdd.md)
   - Especificações técnicas detalhadas
   - Schemas Zod completos
   - Fluxos de implementação
   - **Tempo:** 2 horas (consulta conforme necessário)

4. **QUARTO:** [CLAUDE.md](../CLAUDE.md)
   - Arquitetura do projeto
   - Rotas e estrutura de pastas
   - Comandos disponíveis
   - **Tempo:** 20 minutos

---

## 🗄️ Tabelas no Banco de Dados

**Já existentes no projeto:**
- `user`, `session`, `account`, `verification` (BetterAuth)
- `categories`, `products`, `product_variants`
- `shipping_address`, `cart`, `cart_item`
- `order`, `order_item`

---

## 🚀 Ordem de Implementação (MVP - 5 semanas)

### ✅ FASE 1: Fundação - Autenticação (1 semana)

#### 📅 DIA 1-2: Verificar Setup Existente

**Status:** ✅ JÁ IMPLEMENTADO

**Verificações:**
1. BetterAuth configurado
   - [src/lib/auth.ts](../src/lib/auth.ts)
   - [src/lib/auth-client.ts](../src/lib/auth-client.ts)
   - [src/app/api/auth/[...all]/route.ts](../src/app/api/auth/%5B...all%5D/route.ts)

2. Schemas de auth no banco
   - `user`, `session`, `account`, `verification`

3. Páginas de autenticação
   - [src/app/auth/page.tsx](../src/app/auth/page.tsx) (com tabs)
   - [src/app/auth/components/sign-in-form.tsx](../src/app/auth/components/sign-in-form.tsx)
   - [src/app/auth/components/sign-up-form.tsx](../src/app/auth/components/sign-up-form.tsx)

**Checkpoint:** ✅ Autenticação funcionando

---

#### 📅 DIA 3: Testar Fluxo de Autenticação

**Referência:** [sdd.md](sdd.md#31-autenticação-e-gestão-de-usuários)

**Testes:**
1. **Sign Up:**
   - Acessar: `http://localhost:3000/auth`
   - Clicar em tab "Sign Up"
   - Preencher: nome, email, senha (min 8 caracteres)
   - Verificar: usuário criado no banco

2. **Sign In:**
   - Acessar: `http://localhost:3000/auth`
   - Tab "Sign In"
   - Login com credenciais criadas
   - Verificar: sessão criada, redirecionamento para `/`

3. **Verificar sessão:**
```typescript
// Em qualquer Server Component
const session = await auth.api.getSession({ headers: await headers() })
console.log(session?.user) // Deve exibir dados do usuário
```

**Checkpoint:** ✅ Login/Sign Up funcionam perfeitamente

---

#### 📅 DIA 4-5: Recuperação de Senha

**Status:** ✅ JÁ IMPLEMENTADO

**Verificar arquivos:**
- [src/app/auth/forgot-password/page.tsx](../src/app/auth/forgot-password/page.tsx)
- [src/components/emails/forgot-password-form.tsx](../src/components/emails/forgot-password-form.tsx)
- [src/app/auth/reset-password/[token]/page.tsx](../src/app/auth/reset-password/%5Btoken%5D/page.tsx)
- [src/components/emails/reset-password-form.tsx](../src/components/emails/reset-password-form.tsx)

**Testar:**
1. Acessar `/auth/forgot-password`
2. Inserir email cadastrado
3. Verificar email recebido (Resend)
4. Clicar no link de reset
5. Definir nova senha
6. Logar com nova senha

**Checkpoint:** ✅ Reset de senha funciona

---

### ✅ FASE 2: Catálogo de Produtos (1 semana)

#### 📅 DIA 6-7: Home Page - Listagem de Produtos

**Referência:** [sdd.md](sdd.md#321-home-page---listagem-de-produtos)

**Arquivo:** [src/app/page.tsx](../src/app/page.tsx)

**Status:** ✅ JÁ IMPLEMENTADO

**Componentes verificados:**
- [src/components/product-list.tsx](../src/components/product-list.tsx)
- [src/components/product-item.tsx](../src/components/product-item.tsx)
- [src/components/product-category-selector.tsx](../src/components/product-category-selector.tsx)

**Query no Server Component:**
```typescript
const products = await db.query.products.findMany({
  with: {
    category: true,
    variants: {
      limit: 1,
      orderBy: (variants, { asc }) => [asc(variants.priceInCents)]
    }
  },
  orderBy: (products, { desc }) => [desc(products.createdAt)],
  limit: 12
})
```

**Critérios de Aceite:**
- [ ] Grid responsivo (1 col mobile, 2 tablet, 4 desktop)
- [ ] Imagens otimizadas (next/image)
- [ ] Preços formatados em BRL
- [ ] Link para PDP funciona

**Checkpoint:** ✅ Home page carrega produtos

---

#### 📅 DIA 8-9: Página de Categoria

**Referência:** [sdd.md](sdd.md#322-página-de-categoria)

**Arquivo:** [src/app/category/[slug]/page.tsx](../src/app/category/%5Bslug%5D/page.tsx)

**Implementação:**

```typescript
import { db } from "@/db"
import { categories, products } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import ProductList from "@/components/product-list"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, slug)
  })

  if (!category) notFound()

  const categoryProducts = await db.query.products.findMany({
    where: eq(products.categoryId, category.id),
    with: {
      variants: { limit: 1 }
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        <p className="text-muted-foreground">
          {categoryProducts.length} produtos encontrados
        </p>
      </div>

      <ProductList products={categoryProducts} />
    </div>
  )
}
```

**Critérios de Aceite:**
- [ ] Slug inválido retorna 404
- [ ] Categoria vazia exibe "Nenhum produto encontrado"
- [ ] Breadcrumb: Home > [Categoria]
- [ ] SEO: title e description dinâmicos

**Checkpoint:** ✅ Página de categoria funciona

---

#### 📅 DIA 10: Product Detail Page (PDP)

**Referência:** [sdd.md](sdd.md#323-product-detail-page-pdp---variante-específica)

**Arquivo:** [src/app/product-variant/[slug]/page.tsx](../src/app/product-variant/%5Bslug%5D/page.tsx)

**Status:** ✅ JÁ IMPLEMENTADO (verificar)

**Componentes:**
- Galeria de imagens
- Seletor de variações (cor, tamanho)
- Botão "Adicionar ao carrinho"
- Preço formatado

**Critérios de Aceite:**
- [ ] Variante não encontrada retorna 404
- [ ] Seletor atualiza preço e imagem
- [ ] Botão desabilitado se não autenticado
- [ ] Adicionar ao carrinho exibe toast

**Checkpoint:** ✅ PDP completa

---

### ✅ FASE 3: Carrinho de Compras (1 semana)

#### 📅 DIA 11-12: Server Actions de Carrinho

**Referência:** [sdd.md](sdd.md#332-server-action-add-cart-product)

**Arquivos a verificar/criar:**

1. **Add Cart Product** (✅ JÁ EXISTE)
   - [src/actions/add-cart-product/index.ts](../src/actions/add-cart-product/index.ts)
   - [src/actions/add-cart-product/schema.ts](../src/actions/add-cart-product/schema.ts)

2. **Get Cart** (✅ JÁ EXISTE)
   - [src/actions/get-cart/index.ts](../src/actions/get-cart/index.ts)

3. **Remove Cart Product** (✅ JÁ EXISTE)
   - [src/actions/remove-cart-product/](../src/actions/remove-cart-product/)

4. **Decrease Cart Product** (✅ JÁ EXISTE)
   - [src/actions/decrease-cart-product/](../src/actions/decrease-cart-product/)

**Padrão de Segurança (verificar em TODAS):**
```typescript
const session = await auth.api.getSession({ headers: await headers() })
if (!session?.user) throw new Error("Unauthorized")
```

**Checkpoint:** ✅ Server actions criadas e seguras

---

#### 📅 DIA 13-14: React Query Hooks

**Referência:** [sdd.md](sdd.md#333-react-query-hook-use-cart)

**Hooks a verificar:**

1. **Query: useCart** (✅ JÁ EXISTE)
   - [src/hooks/queries/use-cart.ts](../src/hooks/queries/use-cart.ts)

2. **Mutation: useIncreaseProductQuantityCart** (✅ JÁ EXISTE)
   - [src/hooks/mutations/use-increase-product-quantity-cart.ts](../src/hooks/mutations/use-increase-product-quantity-cart.ts)

3. **Mutation: useDecreaseProductQuantityCart** (✅ JÁ EXISTE)
   - [src/hooks/mutations/use-decrease-product-quantity-cart.ts](../src/hooks/mutations/use-decrease-product-quantity-cart.ts)

4. **Mutation: useRemoveProductFromCart** (✅ JÁ EXISTE)
   - [src/hooks/mutations/use-remove-product-from-cart.ts](../src/hooks/mutations/use-remove-product-from-cart.ts)

**Padrão (verificar):**
```typescript
// Query key function
export const getCartQueryKey = () => ["cart"]

// Hook
export function useCart() {
  return useQuery({
    queryKey: getCartQueryKey(),
    queryFn: () => getCart(),
    staleTime: 1000 * 60 * 5
  })
}

// Mutation
export function useIncreaseProductQuantityCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["increase-cart-quantity"],
    mutationFn: increaseCartProductQuantity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCartQueryKey() })
      toast.success("Quantidade atualizada")
    }
  })
}
```

**Checkpoint:** ✅ Hooks criados e testados

---

#### 📅 DIA 15: Componentes de Carrinho

**Referência:** [sdd.md](sdd.md#33-carrinho-de-compras)

**Componentes a verificar:**

1. **Cart Drawer** (✅ JÁ EXISTE)
   - [src/components/common/cart.tsx](../src/components/common/cart.tsx)

2. **Cart Item** (✅ JÁ EXISTE)
   - [src/components/common/cart-item.tsx](../src/components/common/cart-item.tsx)

**Testar:**
1. Adicionar produto ao carrinho
2. Aumentar quantidade
3. Diminuir quantidade
4. Remover item
5. Verificar total calculado corretamente

**Checkpoint:** ✅ Carrinho funciona perfeitamente

---

### ✅ FASE 4: Checkout - Endereços (1 semana)

#### 📅 DIA 16-17: Server Actions de Endereços

**Referência:** [sdd.md](sdd.md#341-página-cart-identification)

**Arquivos a verificar/criar:**

1. **Get Shipping Addresses** (✅ JÁ EXISTE)
   - [src/actions/get-shipping-addresses/index.ts](../src/actions/get-shipping-addresses/index.ts)

2. **Create Shipping Address** (✅ JÁ EXISTE)
   - [src/actions/create-shipping-address/](../src/actions/create-shipping-address/)
   - [src/actions/create-shipping-address/schema.ts](../src/actions/create-shipping-address/schema.ts)

**Verificar Schema Zod:**
```typescript
export const createShippingAddressSchema = z.object({
  recipientName: z.string().min(3),
  street: z.string().min(3),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2, "UF deve ter 2 caracteres"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  country: z.string().default("Brasil"),
  phone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, "Telefone inválido"),
  email: z.string().email(),
  cpfOrCnpj: z.string().regex(
    /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    "CPF/CNPJ inválido"
  )
})
```

**Checkpoint:** ✅ Server actions de endereços prontas

---

#### 📅 DIA 18-19: Hooks de Endereços

**Hooks a criar/verificar:**

1. **Query: useShippingAddresses** (✅ JÁ EXISTE)
   - [src/hooks/queries/use-shipping-addresses.ts](../src/hooks/queries/use-shipping-addresses.ts)

2. **Mutation: useCreateShippingAddress** (✅ JÁ EXISTE)
   - [src/hooks/mutations/use-create-shipping-address.ts](../src/hooks/mutations/use-create-shipping-address.ts)

3. **Mutation: useUpdateCartShippingAddress** (✅ JÁ EXISTE)
   - [src/hooks/mutations/use-update-cart-shipping-address.ts](../src/hooks/mutations/use-update-cart-shipping-address.ts)

**Checkpoint:** ✅ Hooks de endereços funcionando

---

#### 📅 DIA 20-22: Página Cart Identification

**Referência:** [sdd.md](sdd.md#341-página-cart-identification)

**Arquivo:** [src/app/cart/identification/page.tsx](../src/app/cart/identification/page.tsx)

**Status:** ✅ JÁ IMPLEMENTADO

**Componentes a verificar:**
1. [src/app/cart/identification/components/addresses.tsx](../src/app/cart/identification/components/addresses.tsx)
2. [src/app/cart/identification/components/add-address-form.tsx](../src/app/cart/identification/components/add-address-form.tsx)
3. [src/app/cart/identification/components/summary-cart-order.tsx](../src/app/cart/identification/components/summary-cart-order.tsx)

**Fluxo a testar:**
1. Usuário acessa `/cart/identification`
2. Lista de endereços carrega
3. Usuário pode:
   - Selecionar endereço existente
   - Criar novo endereço (formulário com máscaras)
4. Ao selecionar, botão "Continuar" habilita
5. Clicar "Continuar" → Navega para `/cart/confirmation`

**Critérios de Aceite:**
- [ ] Lista vazia exibe "Nenhum endereço cadastrado"
- [ ] Máscaras aplicadas (CEP, telefone, CPF/CNPJ)
- [ ] Validação Zod exibe erros específicos
- [ ] Endereço persiste no carrinho
- [ ] Navegação apenas com endereço selecionado

**Checkpoint:** ✅ Página de identificação funciona

---

### ✅ FASE 5: Checkout - Confirmação e Pagamento (1 semana)

#### 📅 DIA 23-24: Página Cart Confirmation

**Referência:** [sdd.md](sdd.md#351-página-cart-confirmation)

**Arquivo:** [src/app/cart/confirmation/page.tsx](../src/app/cart/confirmation/page.tsx)

**Status:** ✅ JÁ IMPLEMENTADO

**Validações Server-Side:**
```typescript
export default async function CartConfirmationPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/auth")

  const cart = await db.query.cart.findFirst({
    where: eq(cart.userId, session.user.id),
    with: {
      items: { with: { productVariant: { with: { product: true } } } },
      shippingAddress: true
    }
  })

  // Validações
  if (!cart || cart.items.length === 0) redirect("/")
  if (!cart.shippingAddressId) redirect("/cart/identification")

  return <CartConfirmationContent cart={cart} />
}
```

**Critérios de Aceite:**
- [ ] Carrinho vazio redireciona para home
- [ ] Sem endereço redireciona para `/cart/identification`
- [ ] Exibe todos os itens com imagem, nome, quantidade, preço
- [ ] Calcula subtotal e total
- [ ] Endereço de entrega exibido

**Checkpoint:** ✅ Página de confirmação protegida

---

#### 📅 DIA 25-26: Server Action - Finish Purchase

**Referência:** [sdd.md](sdd.md#353-server-action-finish-purchase)

**Arquivo:** [src/actions/finish-purchase/index.ts](../src/actions/finish-purchase/index.ts)

**Status:** ✅ JÁ IMPLEMENTADO

**Fluxo a verificar:**
1. Valida autenticação
2. Busca carrinho com itens e endereço
3. Calcula total
4. Cria registro em `order` (status: "pending")
5. Cria registros em `order_item`
6. **Desnormaliza endereço no pedido** (snapshot)
7. Limpa carrinho
8. Retorna `orderId`

**Critérios de Aceite:**
- [ ] Pedido criado com status "pending"
- [ ] Endereço copiado para pedido (não referência)
- [ ] Itens copiados para `order_item`
- [ ] Carrinho esvaziado após sucesso
- [ ] Erro se carrinho vazio ou sem endereço

**Checkpoint:** ✅ Finish purchase funciona

---

#### 📅 DIA 27-28: Server Action - Create Checkout Session Stripe

**Referência:** [sdd.md](sdd.md#354-server-action-create-checkout-session-stripe)

**Arquivo:** [src/actions/create-checkout-session-stripe/index.ts](../src/actions/create-checkout-session-stripe/index.ts)

**Status:** ✅ JÁ IMPLEMENTADO

**Verificar código:**
```typescript
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { createCheckoutSessionStripeSchema } from "./schema"

export async function createCheckoutSessionStripe(
  input: z.infer<typeof createCheckoutSessionStripeSchema>
) {
  const parsed = createCheckoutSessionStripeSchema.parse(input)

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  const order = await db.query.order.findFirst({
    where: eq(order.id, parsed.orderId),
    with: {
      items: {
        with: {
          productVariant: { with: { product: true } }
        }
      }
    }
  })

  if (!order) throw new Error("Pedido não encontrado")
  if (order.userId !== session.user.id) throw new Error("Unauthorized")

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map(item => ({
    price_data: {
      currency: "brl",
      product_data: {
        name: `${item.productVariant.product.name} - ${item.productVariant.name}`,
        images: [item.productVariant.imageUrl]
      },
      unit_amount: item.productVariant.priceInCents
    },
    quantity: item.quantity
  }))

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    metadata: {
      orderId: order.id,
      userId: session.user.id
    }
  })

  return { url: checkoutSession.url }
}
```

**Critérios de Aceite:**
- [ ] Valida propriedade do pedido
- [ ] Line items Stripe corretos
- [ ] Metadata contém `orderId`
- [ ] URLs de sucesso/cancel corretas
- [ ] Sessão Stripe válida

**Checkpoint:** ✅ Stripe checkout session funciona

---

#### 📅 DIA 29: Hook - useFinishPurchase

**Referência:** [sdd.md](sdd.md#352-component-finish-purchase-button)

**Arquivo:** [src/hooks/mutations/use-finish-purchase.ts](../src/hooks/mutations/use-finish-purchase.ts)

**Status:** ✅ JÁ IMPLEMENTADO

**Verificar código:**
```typescript
export function useFinishPurchase() {
  const router = useRouter()

  return useMutation({
    mutationFn: finishPurchase,
    onSuccess: async (data) => {
      const { orderId } = data

      const stripeSession = await createCheckoutSessionStripe({ orderId })

      if (stripeSession.url) {
        router.push(stripeSession.url)
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao finalizar compra")
    }
  })
}
```

**Checkpoint:** ✅ Hook integra finish purchase + Stripe

---

#### 📅 DIA 30: Componente - Finish Purchase Button

**Arquivo:** [src/app/cart/components/finish-purchase-button.tsx](../src/app/cart/components/finish-purchase-button.tsx)

**Status:** ✅ JÁ IMPLEMENTADO

**Verificar:**
```typescript
"use client"

import { Button } from "@/components/ui/button"
import { useFinishPurchase } from "@/hooks/mutations/use-finish-purchase"

export function FinishPurchaseButton() {
  const { mutate, isPending } = useFinishPurchase()

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={() => mutate()}
      disabled={isPending}
    >
      {isPending ? "Processando..." : "Finalizar Compra"}
    </Button>
  )
}
```

**Checkpoint:** ✅ Botão de finalizar compra funciona

---

### ✅ FASE 6: Webhooks e Pós-Compra (3 dias)

#### 📅 DIA 31: Stripe Webhook Handler

**Referência:** [sdd.md](sdd.md#361-stripe-webhook-handler)

**Arquivo:** [src/app/api/stripe/webhook/route.ts](../src/app/api/stripe/webhook/route.ts)

**Status:** ✅ JÁ IMPLEMENTADO

**Verificar código:**
```typescript
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { db } from "@/db"
import { order } from "@/db/schema"
import { eq } from "drizzle-orm"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("stripe-signature")

  if (!signature) {
    return new Response("Missing signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return new Response("Invalid signature", { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId

    if (!orderId) {
      console.error("Missing orderId in metadata")
      return new Response("Missing orderId", { status: 400 })
    }

    await db.update(order)
      .set({ status: "paid" })
      .where(eq(order.id, orderId))

    console.log(`Order ${orderId} marked as paid`)
  }

  return new Response("OK", { status: 200 })
}
```

**Configurar Stripe CLI (Local):**
```bash
# Instalar Stripe CLI
# Windows: baixar de https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copiar webhook secret para .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Critérios de Aceite:**
- [ ] Assinatura inválida retorna 400
- [ ] Evento `checkout.session.completed` atualiza status para "paid"
- [ ] Evento sem `orderId` retorna erro
- [ ] Logs de eventos para debugging

**Checkpoint:** ✅ Webhook Stripe funciona

---

#### 📅 DIA 32: Páginas de Sucesso/Cancelamento

**Arquivos:**
1. [src/app/checkout/success/page.tsx](../src/app/checkout/success/page.tsx)
2. [src/app/checkout/cancel/page.tsx](../src/app/checkout/cancel/page.tsx)

**Status:** ✅ JÁ IMPLEMENTADO

**Verificar:**

**Success Page:**
```typescript
export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Pagamento confirmado!</h1>
        <p className="text-muted-foreground mb-8">
          Seu pedido está sendo processado.
        </p>
        <Button asChild>
          <Link href="/orders">Ver meus pedidos</Link>
        </Button>
      </div>
    </div>
  )
}
```

**Cancel Page:**
```typescript
export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <XCircle className="w-20 h-20 text-red-500 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Pagamento cancelado</h1>
        <p className="text-muted-foreground mb-8">
          Você pode tentar novamente quando quiser.
        </p>
        <Button asChild>
          <Link href="/cart/confirmation">Voltar ao carrinho</Link>
        </Button>
      </div>
    </div>
  )
}
```

**Checkpoint:** ✅ Páginas de sucesso/cancel funcionam

---

#### 📅 DIA 33: Página de Pedidos

**Referência:** [sdd.md](sdd.md#371-orders-page)

**Arquivo:** [src/app/orders/page.tsx](../src/app/orders/page.tsx)

**Status:** ✅ JÁ IMPLEMENTADO

**Verificar componentes:**
1. [src/app/orders/page.tsx](../src/app/orders/page.tsx) (Server Component)
2. [src/app/orders/components/order-list.tsx](../src/app/orders/components/order-list.tsx) (Client Component)

**Query Server-Side:**
```typescript
export default async function OrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/auth")

  const orders = await db.query.order.findMany({
    where: eq(order.userId, session.user.id),
    with: {
      items: {
        with: {
          productVariant: {
            with: { product: true }
          }
        }
      }
    },
    orderBy: (orders, { desc }) => [desc(orders.createdAt)]
  })

  return <OrderList orders={orders} />
}
```

**Componente OrderList:**
- Usa Accordion (shadcn/ui)
- Badge de status (pending, paid, cancelled)
- Exibe: ID, data, total, endereço, itens

**Critérios de Aceite:**
- [ ] Exibe apenas pedidos do usuário logado
- [ ] Lista vazia exibe "Nenhum pedido encontrado"
- [ ] Status colorido (pending: amarelo, paid: verde, cancelled: vermelho)
- [ ] Accordion permite expandir/colapsar detalhes

**Checkpoint:** ✅ Página de pedidos funciona

---

## 📊 Checklist Visual de Progresso

### ✅ FASE 1: Autenticação (1 semana)
- [x] BetterAuth configurado
- [x] Schemas de auth no banco
- [x] Páginas de login/sign-up
- [x] Reset de senha com email
- [x] Sessões funcionando

### ✅ FASE 2: Catálogo (1 semana)
- [x] Home page com produtos
- [x] Página de categoria
- [x] PDP com variações
- [x] Navegação entre variantes
- [ ] SEO otimizado (meta tags dinâmicas)

### ✅ FASE 3: Carrinho (1 semana)
- [x] Server actions (add, remove, increase, decrease)
- [x] React Query hooks
- [x] Componente Cart Drawer
- [x] Cálculo de total
- [x] Toast notifications

### ✅ FASE 4: Checkout - Endereços (1 semana)
- [x] Server actions de endereços
- [x] Hooks de endereços
- [x] Página de identificação
- [x] Formulário de novo endereço com máscaras
- [x] Validação Zod completa

### ✅ FASE 5: Checkout - Pagamento (1 semana)
- [x] Página de confirmação
- [x] Server action finish purchase
- [x] Server action create checkout session Stripe
- [x] Hook useFinishPurchase
- [x] Botão de finalizar compra
- [x] Integração Stripe completa

### ✅ FASE 6: Webhooks e Pós-Compra (3 dias)
- [x] Webhook Stripe
- [x] Páginas de sucesso/cancel
- [x] Página de pedidos
- [ ] Email de confirmação de pedido (futuro)

---

## 🎯 Tarefas Pendentes (Opcional)

### 🔜 Melhorias de UX
- [ ] Loading states em todos os botões
- [ ] Skeleton loaders para produtos
- [ ] Animações de transição (Framer Motion)
- [ ] Feedback visual ao adicionar ao carrinho
- [ ] Badge de contador no ícone do carrinho

### 🔜 SEO e Performance
- [ ] Meta tags dinâmicas por página
- [ ] Open Graph tags
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Image optimization (WebP/AVIF)

### 🔜 Funcionalidades Futuras
- [ ] Wishlist (lista de desejos)
- [ ] Sistema de cupons de desconto
- [ ] Avaliações de produtos
- [ ] Filtros avançados (preço, cor, tamanho)
- [ ] Busca com autocomplete
- [ ] Rastreamento de pedidos

### 🔜 Admin Dashboard
- [ ] Dashboard admin para gestão de produtos
- [ ] Gestão de pedidos
- [ ] Relatórios de vendas
- [ ] Gestão de cupons
- [ ] Gestão de usuários

---

## 🚨 Troubleshooting Comum

### Problema 1: BetterAuth não autentica
**Soluções:**
- Verificar: `BETTER_AUTH_SECRET` tem 32+ caracteres
- Verificar: `BETTER_AUTH_URL` está correto
- Verificar: Tabelas foram criadas no banco
- Limpar cookies do navegador

### Problema 2: Stripe webhook não dispara
**Soluções:**
- Verificar: Stripe CLI está rodando (`stripe listen`)
- Verificar: `STRIPE_WEBHOOK_SECRET` correto no `.env`
- Verificar: Endpoint está em `/api/stripe/webhook`
- Verificar: Signature validation não está falhando

### Problema 3: React Query não atualiza
**Soluções:**
- Verificar: `queryClient.invalidateQueries()` foi chamado
- Verificar: Query key está correto
- Abrir React Query Devtools
- Verificar: `staleTime` não está muito alto

### Problema 4: Carrinho não persiste
**Soluções:**
- Verificar: `userId` está correto na criação do carrinho
- Verificar: Sessão do usuário está ativa
- Verificar: Query `getCart` está buscando por `userId`

### Problema 5: Máscaras de input não funcionam
**Soluções:**
- Instalar: `react-input-mask` ou similar
- Usar componente Input do shadcn com `mask` prop
- Validar formato no schema Zod

---

## 📞 Quando Precisar de Ajuda

### Consulte na Ordem:

1. **Erro de autenticação?**
   → [sdd.md - Seção 3.1](sdd.md#31-autenticação-e-gestão-de-usuários)

2. **Erro em Server Action?**
   → [development-guidelines.md](development-guidelines.md#diretrizes-de-segurança)

3. **Erro em componente/hook?**
   → [sdd.md - Seção específica](sdd.md)

4. **Dúvida sobre padrão de código?**
   → [development-guidelines.md](development-guidelines.md)

5. **Dúvida sobre arquitetura?**
   → [CLAUDE.md](../CLAUDE.md)

6. **Dúvida sobre requisitos?**
   → [prd.md](prd.md)

---

## 🎉 Após Conclusão do MVP

### Você terá:
- ✅ Autenticação completa (BetterAuth + Reset senha)
- ✅ Catálogo de produtos (Home, Categoria, PDP)
- ✅ Carrinho de compras funcional
- ✅ Checkout com endereços
- ✅ Integração Stripe (pagamentos)
- ✅ Webhooks para atualização de status
- ✅ Página de pedidos
- ✅ Design responsivo (mobile-first)

### Próximos Passos:
1. **SEO** (meta tags, sitemap) - 2 dias
2. **Admin Dashboard** (gestão de produtos) - 2 semanas
3. **Wishlist** - 1 semana
4. **Sistema de cupons** - 1 semana
5. **Avaliações de produtos** - 1 semana

---

## 📋 Resumo Ultra-Rápido

```
SEMANA 1:  Autenticação (BetterAuth + Reset Senha)
SEMANA 2:  Catálogo (Home + Categoria + PDP)
SEMANA 3:  Carrinho (Add/Remove + React Query)
SEMANA 4:  Checkout - Endereços (Formulários + Validação)
SEMANA 5:  Checkout - Pagamento (Stripe + Webhooks)
```

**MVP COMPLETO: 5 SEMANAS** 🚀

---

## 🔥 Teste Completo de Fluxo (End-to-End)

### Teste 1: Usuário Novo - Compra Completa

1. **Sign Up:**
   - Acessar `/auth`
   - Criar conta
   - Verificar usuário no banco

2. **Navegar produtos:**
   - Acessar home `/`
   - Clicar em categoria
   - Abrir PDP

3. **Adicionar ao carrinho:**
   - Selecionar variação
   - Adicionar ao carrinho
   - Abrir drawer do carrinho
   - Verificar item adicionado

4. **Checkout - Endereço:**
   - Clicar "Finalizar compra"
   - Navegar para `/cart/identification`
   - Criar novo endereço
   - Preencher formulário com máscaras
   - Selecionar endereço
   - Clicar "Continuar"

5. **Checkout - Confirmação:**
   - Verificar resumo do pedido
   - Verificar endereço de entrega
   - Clicar "Finalizar compra"
   - Redirecionar para Stripe

6. **Pagamento Stripe:**
   - Preencher dados do cartão (teste: 4242 4242 4242 4242)
   - Confirmar pagamento
   - Redirecionar para `/checkout/success`

7. **Verificar pedido:**
   - Acessar `/orders`
   - Verificar pedido com status "paid"
   - Expandir accordion
   - Verificar todos os dados

**Checkpoint:** ✅ Fluxo completo funciona!

---

### Teste 2: Usuário Existente - Múltiplos Endereços

1. **Login:**
   - Acessar `/auth`
   - Fazer login

2. **Adicionar produtos:**
   - Adicionar 3 produtos diferentes ao carrinho

3. **Checkout - Selecionar endereço:**
   - Acessar `/cart/identification`
   - Verificar lista de endereços (deve ter o cadastrado antes)
   - Selecionar endereço existente
   - Continuar

4. **Completar compra:**
   - Confirmar pedido
   - Pagar com Stripe
   - Verificar sucesso

**Checkpoint:** ✅ Reutilização de endereços funciona!

---

### Teste 3: Cancelamento de Pagamento

1. **Adicionar produtos ao carrinho**

2. **Iniciar checkout:**
   - Selecionar endereço
   - Confirmar pedido
   - Redirecionar para Stripe

3. **Cancelar pagamento:**
   - Clicar em "< Back" no Stripe Checkout
   - Verificar redirecionamento para `/checkout/cancel`

4. **Retomar compra:**
   - Clicar "Voltar ao carrinho"
   - Verificar pedido ainda com status "pending"
   - Tentar novamente

**Checkpoint:** ✅ Cancelamento funciona corretamente!

---

## 🏁 Conclusão

Este documento serve como guia prático para implementação completa do Bewear E-commerce. Siga os checkpoints, teste cada fase, e consulte os documentos de referência quando necessário.

**Próximo passo:** Revisar tarefas pendentes e priorizar melhorias.

Boa implementação! 💪🚀
