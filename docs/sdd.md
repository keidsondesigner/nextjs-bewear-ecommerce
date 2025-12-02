# SDD - Spec-Driven Development
## Bewear E-commerce Platform

### 1. Visão Geral do Documento

Este documento define as especificações técnicas e funcionais completas para o desenvolvimento do Bewear E-commerce. Ele serve como contrato entre requisitos de negócio (PRD) e implementação técnica (Development Guidelines), garantindo que cada feature seja construída com clareza sobre comportamentos esperados, validações, fluxos e critérios de aceite.

**Público-alvo**: Desenvolvedores, QA, Product Managers, Stakeholders técnicos.

**Escopo**: MVP completo do e-commerce com catálogo, autenticação, carrinho, checkout e pagamentos Stripe.

---

## 2. Arquitetura de Alto Nível

### 2.1 Stack Tecnológico
- **Frontend**: React 19.1.0, Next.js 15 (App Router), TypeScript
- **Styling**: TailwindCSS v4, shadcn/ui 2.9.2
- **State Management**: TanStack Query 5.83.0
- **Forms**: React Hook Form 7.62.0 + Zod 4.0.17
- **Auth**: BetterAuth 1.2.12
- **Database**: PostgreSQL (Supabase) + Drizzle ORM 0.44.2
- **Payments**: Stripe 18.4.0 + @stripe/stripe-js 7.8.0
- **Email**: Resend 6.0.1

### 2.2 Princípios Arquiteturais
1. **Server-First**: Páginas são Server Components por padrão
2. **Progressive Enhancement**: Client Components apenas quando necessário
3. **Type-Safety**: TypeScript strict mode + Zod schemas
4. **Security-First**: Autenticação verificada em todas as Server Actions
5. **Performance**: RSC, lazy loading, otimização de queries

---

## 3. Especificações Funcionais por Módulo

### 3.1 Autenticação e Gestão de Usuários

#### 3.1.1 Sign Up (Cadastro)
**Rota**: `/auth` (tab Sign-Up)
**Tipo**: Server Component com Client Component form
**Componente**: `sign-up-form.tsx`

**Campos Obrigatórios**:
- `name` (string, min 2 caracteres)
- `email` (string, formato email válido)
- `password` (string, min 8 caracteres, 1 maiúscula, 1 número, 1 especial)
- `confirmPassword` (string, deve ser igual a `password`)

**Validação Zod**:
```typescript
const signUpSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter ao menos 1 letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter ao menos 1 número")
    .regex(/[^A-Za-z0-9]/, "Senha deve conter ao menos 1 caractere especial"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
})
```

**Comportamento Esperado**:
1. Usuário preenche formulário
2. Validação client-side (React Hook Form + Zod)
3. Submit dispara Server Action `signUp` (BetterAuth)
4. Sucesso: cria registro em `user` table, redireciona para `/`
5. Erro: exibe mensagem via Sonner toast

**Critérios de Aceite**:
- [ ] Email duplicado retorna erro "Email já cadastrado"
- [ ] Senha fraca exibe validação específica
- [ ] Sucesso redireciona e mantém sessão ativa
- [ ] Form acessível (labels, aria-labels, keyboard navigation)

---

#### 3.1.2 Sign In (Login)
**Rota**: `/auth` (tab Sign-In)
**Componente**: `sign-in-form.tsx`

**Campos Obrigatórios**:
- `email` (string, formato email)
- `password` (string)

**Validação Zod**:
```typescript
const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória")
})
```

**Comportamento Esperado**:
1. Submit dispara Server Action `signIn` (BetterAuth)
2. Sucesso: cria `session`, redireciona para página anterior ou `/`
3. Falha: exibe "Email ou senha incorretos"

**Critérios de Aceite**:
- [ ] Credenciais válidas criam sessão e redirecionam
- [ ] Credenciais inválidas exibem erro genérico (segurança)
- [ ] Session token armazenado via httpOnly cookie
- [ ] Tentativas excessivas podem disparar rate limiting (futuro)

---

#### 3.1.3 Forgot Password (Recuperação de Senha)
**Rota**: `/auth/forgot-password`
**Componente**: `forgot-password-form.tsx`

**Campos Obrigatórios**:
- `email` (string, formato email)

**Comportamento Esperado**:
1. Usuário submete email
2. Server Action valida se email existe em `user` table
3. Cria token único em `verification` table (expiração 1h)
4. Envia email via Resend com link: `/auth/reset-password/[token]`
5. Sucesso: exibe "Email enviado, verifique sua caixa de entrada"
6. Email não encontrado: exibe mesma mensagem (segurança)

**Critérios de Aceite**:
- [ ] Email enviado contém link válido
- [ ] Token expira após 1 hora
- [ ] Email não encontrado não revela existência da conta
- [ ] Template de email profissional e responsivo

---

#### 3.1.4 Reset Password (Redefinição de Senha)
**Rota**: `/auth/reset-password/[token]`
**Componente**: `reset-password-form.tsx`

**Campos Obrigatórios**:
- `password` (string, mesmas regras de Sign Up)
- `confirmPassword` (string)

**Validação**:
- Token válido e não expirado
- Senha atende requisitos de complexidade

**Comportamento Esperado**:
1. Page valida token ao carregar (Server Component)
2. Token inválido/expirado: exibe erro e link para `/auth/forgot-password`
3. Token válido: renderiza formulário
4. Submit atualiza `password` hash em `account` table
5. Invalida token usado (delete de `verification`)
6. Sucesso: redireciona para `/auth` com toast "Senha atualizada"

**Critérios de Aceite**:
- [ ] Token expirado não permite reset
- [ ] Token usado uma vez é invalidado
- [ ] Nova senha é hasheada corretamente (bcrypt)
- [ ] Sessões antigas são invalidadas após reset (opcional)

---

### 3.2 Catálogo de Produtos

#### 3.2.1 Home Page - Listagem de Produtos
**Rota**: `/`
**Tipo**: Server Component

**Funcionalidades**:
- Carrega produtos via Drizzle ORM
- Exibe banner promocional
- Lista categorias principais
- Grid de produtos (últimos lançamentos)

**Query Database**:
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

**Dados Exibidos por Produto**:
- Imagem (primeira variant)
- Nome do produto
- Categoria
- Preço inicial (menor preço entre variants)
- Link para `/product-variant/[slug]`

**Critérios de Aceite**:
- [ ] Carrega em < 2.5s (LCP)
- [ ] Grid responsivo (1 col mobile, 2 tablet, 4 desktop)
- [ ] Imagens otimizadas (next/image)
- [ ] Preços formatados em BRL (R$ 50,00)

---

#### 3.2.2 Página de Categoria
**Rota**: `/category/[slug]`
**Tipo**: Server Component com Client Component para filtros (futuro)

**Comportamento**:
1. Busca categoria por `slug`
2. Se não existir: retorna 404
3. Carrega produtos da categoria
4. Exibe header com nome da categoria
5. Grid de produtos (mesma estrutura da home)

**Query Database**:
```typescript
const category = await db.query.categories.findFirst({
  where: eq(categories.slug, params.slug)
})

if (!category) notFound()

const products = await db.query.products.findMany({
  where: eq(products.categoryId, category.id),
  with: {
    variants: { limit: 1 }
  }
})
```

**Critérios de Aceite**:
- [ ] Slug inválido retorna 404
- [ ] Categoria vazia exibe "Nenhum produto encontrado"
- [ ] Breadcrumb exibido: Home > [Categoria]
- [ ] SEO: meta tags dinâmicas por categoria

---

#### 3.2.3 Product Detail Page (PDP) - Variante Específica
**Rota**: `/product-variant/[slug]`
**Tipo**: Server Component + Client Component (`variant-selector`)

**Dados Carregados**:
```typescript
const variant = await db.query.productVariants.findFirst({
  where: eq(productVariants.slug, params.slug),
  with: {
    product: {
      with: {
        category: true,
        variants: true
      }
    }
  }
})
```

**Seções da Página**:
1. **Galeria de Imagens**: imagem principal da variant
2. **Informações**:
   - Nome do produto
   - Categoria
   - Descrição
   - Preço (formatado em BRL)
3. **Seletor de Variações** (`variant-selector.tsx`):
   - Botões de cor
   - Botões de tamanho
   - Atualiza URL ao selecionar (navegação client-side)
4. **Botão Adicionar ao Carrinho**:
   - Disabled se não autenticado
   - Dispara `add-cart-product` Server Action
   - Exibe toast de sucesso/erro

**Validações**:
- Variante deve existir
- Usuário deve estar autenticado para adicionar ao carrinho
- Quantidade inicial: 1 (incrementável no carrinho)

**Critérios de Aceite**:
- [ ] Seletor de variações atualiza preço e imagem
- [ ] Navegação entre variantes via URL
- [ ] Botão disabled para usuários não autenticados
- [ ] Sucesso ao adicionar exibe toast e atualiza contador do carrinho
- [ ] Erro exibe mensagem específica (ex: "Produto indisponível")

---

### 3.3 Carrinho de Compras

#### 3.3.1 Estrutura de Dados
**Tabelas**:
- `cart` (id, userId, shippingAddressId, createdAt)
- `cart_item` (id, cartId, productVariantId, quantity, createdAt)

**Relações**:
- 1 usuário → 1 carrinho ativo
- 1 carrinho → N cart items
- 1 cart item → 1 product variant

---

#### 3.3.2 Server Action: Add Cart Product
**Arquivo**: `src/actions/add-cart-product/index.ts`

**Schema** (`schema.ts`):
```typescript
export const addCartProductSchema = z.object({
  productVariantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99)
})
```

**Fluxo**:
```typescript
export async function addCartProduct(input: z.infer<typeof addCartProductSchema>) {
  // 1. Validar schema
  const parsed = addCartProductSchema.parse(input)

  // 2. Verificar autenticação
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  // 3. Buscar ou criar carrinho
  let cart = await db.query.cart.findFirst({
    where: eq(cart.userId, session.user.id)
  })

  if (!cart) {
    cart = await db.insert(cart).values({
      userId: session.user.id
    }).returning()
  }

  // 4. Verificar se item já existe no carrinho
  const existingItem = await db.query.cartItem.findFirst({
    where: and(
      eq(cartItem.cartId, cart.id),
      eq(cartItem.productVariantId, parsed.productVariantId)
    )
  })

  if (existingItem) {
    // Incrementar quantidade
    await db.update(cartItem)
      .set({ quantity: existingItem.quantity + parsed.quantity })
      .where(eq(cartItem.id, existingItem.id))
  } else {
    // Criar novo item
    await db.insert(cartItem).values({
      cartId: cart.id,
      productVariantId: parsed.productVariantId,
      quantity: parsed.quantity
    })
  }

  // 5. Revalidar cache
  revalidatePath("/cart/identification")

  return { success: true }
}
```

**Critérios de Aceite**:
- [ ] Item duplicado incrementa quantidade existente
- [ ] Carrinho criado automaticamente se não existir
- [ ] Usuário não autenticado recebe erro 401
- [ ] Quantidade máxima respeitada (99 unidades)

---

#### 3.3.3 React Query Hook: use-cart
**Arquivo**: `src/hooks/queries/use-cart.ts`

```typescript
import { useQuery } from "@tanstack/react-query"
import { getCart } from "@/actions/get-cart"

export const getCartQueryKey = () => ["cart"]

export function useCart() {
  return useQuery({
    queryKey: getCartQueryKey(),
    queryFn: () => getCart(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
```

**Server Action** (`get-cart/index.ts`):
```typescript
export async function getCart() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  return await db.query.cart.findFirst({
    where: eq(cart.userId, session.user.id),
    with: {
      items: {
        with: {
          productVariant: {
            with: {
              product: true
            }
          }
        }
      },
      shippingAddress: true
    }
  })
}
```

---

#### 3.3.4 Mutations: Increase/Decrease/Remove
**Hooks**:
- `use-increase-product-quantity-cart.ts`
- `use-decrease-product-quantity-cart.ts`
- `use-remove-product-from-cart.ts`

**Padrão**:
```typescript
export const getIncreaseQuantityMutationKey = () => ["increase-cart-quantity"]

export function useIncreaseProductQuantityCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: getIncreaseQuantityMutationKey(),
    mutationFn: (cartItemId: string) => increaseCartProductQuantity({ cartItemId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCartQueryKey() })
      toast.success("Quantidade atualizada")
    },
    onError: () => {
      toast.error("Erro ao atualizar quantidade")
    }
  })
}
```

**Critérios de Aceite**:
- [ ] Increase limitado a 99 unidades
- [ ] Decrease com quantidade 1 remove item (ou exibe confirmação)
- [ ] Remove dispara confirmação via dialog
- [ ] Cache invalidado após cada mutação

---

### 3.4 Checkout - Identificação e Endereços

#### 3.4.1 Página: Cart Identification
**Rota**: `/cart/identification`
**Tipo**: Server Component + Client Components

**Layout**:
- **Coluna Esquerda**: Lista de endereços + form de novo endereço
- **Coluna Direita**: Resumo do carrinho (preços, itens)

**Componentes**:
- `addresses.tsx` (Client Component)
- `add-address-form.tsx` (Client Component)
- `summary-cart-order.tsx` (Client Component)

---

#### 3.4.2 Component: Addresses
**Arquivo**: `src/app/cart/identification/components/addresses.tsx`

**Funcionalidade**:
1. Carrega endereços via `useShippingAddresses()` hook
2. Exibe lista com radio buttons
3. Permite selecionar endereço existente
4. Botão "Adicionar novo endereço" abre formulário
5. Ao selecionar, dispara `useUpdateCartShippingAddress()` mutation
6. Botão "Continuar" habilitado apenas se endereço selecionado

**Query Hook** (`use-shipping-addresses.ts`):
```typescript
export const getShippingAddressesQueryKey = () => ["shipping-addresses"]

export function useShippingAddresses() {
  return useQuery({
    queryKey: getShippingAddressesQueryKey(),
    queryFn: () => getShippingAddresses()
  })
}
```

**Mutation Hook** (`use-update-cart-shipping-address.ts`):
```typescript
export function useUpdateCartShippingAddress() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (shippingAddressId: string) =>
      updateCartShippingAddress({ shippingAddressId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCartQueryKey() })
      router.push("/cart/confirmation")
    }
  })
}
```

**Critérios de Aceite**:
- [ ] Lista vazia exibe "Nenhum endereço cadastrado"
- [ ] Endereço selecionado persiste no carrinho
- [ ] Navegação para `/cart/confirmation` apenas com endereço válido
- [ ] Loading state durante seleção

---

#### 3.4.3 Component: Add Address Form
**Arquivo**: `src/app/cart/identification/components/add-address-form.tsx`

**Schema** (`create-shipping-address/schema.ts`):
```typescript
export const createShippingAddressSchema = z.object({
  recipientName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  street: z.string().min(3, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().length(2, "UF deve ter 2 caracteres (ex: SP)"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido (formato: 12345-678)"),
  country: z.string().default("Brasil"),
  phone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, "Telefone inválido"),
  email: z.string().email("Email inválido"),
  cpfOrCnpj: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    "CPF/CNPJ inválido")
})
```

**Campos do Formulário**:
- Nome do destinatário
- Rua
- Número
- Complemento (opcional)
- Bairro
- Cidade
- Estado (select com UFs brasileiras)
- CEP (máscara: 12345-678)
- Telefone (máscara: (11) 91234-5678)
- Email
- CPF/CNPJ (máscara automática)

**Mutation Hook** (`use-create-shipping-address.ts`):
```typescript
export function useCreateShippingAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createShippingAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getShippingAddressesQueryKey() })
      toast.success("Endereço criado com sucesso")
    }
  })
}
```

**Critérios de Aceite**:
- [ ] Máscaras aplicadas corretamente (CEP, telefone, CPF/CNPJ)
- [ ] Validação Zod exibe erros específicos
- [ ] CEP inválido sugere verificar formato
- [ ] Sucesso adiciona endereço à lista e fecha formulário
- [ ] Campos obrigatórios marcados visualmente

---

### 3.5 Checkout - Confirmação e Pagamento

#### 3.5.1 Página: Cart Confirmation
**Rota**: `/cart/confirmation`
**Tipo**: Server Component

**Pré-requisitos**:
- Carrinho com itens
- Endereço de entrega selecionado

**Layout**:
- Resumo do pedido (itens, quantidades, preços)
- Endereço de entrega selecionado
- Total do pedido
- Botão "Finalizar Compra"

**Validação Server-Side**:
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

  if (!cart || cart.items.length === 0) {
    redirect("/")
  }

  if (!cart.shippingAddressId) {
    redirect("/cart/identification")
  }

  return <CartConfirmationContent cart={cart} />
}
```

**Critérios de Aceite**:
- [ ] Carrinho vazio redireciona para home
- [ ] Sem endereço redireciona para `/cart/identification`
- [ ] Exibe todos os itens com imagem, nome, quantidade, preço unitário
- [ ] Calcula subtotal, frete (se aplicável), total
- [ ] Botão desabilitado durante processamento

---

#### 3.5.2 Component: Finish Purchase Button
**Arquivo**: `src/app/cart/components/finish-purchase-button.tsx`

**Funcionalidade**:
1. Usuário clica em "Finalizar Compra"
2. Dispara `useFinishPurchase()` mutation
3. Mutation chama `finishPurchase()` Server Action
4. Server Action cria registro em `order` e `order_item` tables
5. Sucesso: chama `createCheckoutSessionStripe()` Server Action
6. Redireciona para Stripe Checkout

**Mutation Hook** (`use-finish-purchase.ts`):
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

---

#### 3.5.3 Server Action: Finish Purchase
**Arquivo**: `src/actions/finish-purchase/index.ts`

**Schema** (`schema.ts`):
```typescript
export const finishPurchaseSchema = z.object({})
```

**Fluxo**:
```typescript
export async function finishPurchase() {
  // 1. Autenticação
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  // 2. Buscar carrinho
  const cart = await db.query.cart.findFirst({
    where: eq(cart.userId, session.user.id),
    with: {
      items: { with: { productVariant: true } },
      shippingAddress: true
    }
  })

  if (!cart || cart.items.length === 0) {
    throw new Error("Carrinho vazio")
  }

  if (!cart.shippingAddressId) {
    throw new Error("Endereço não selecionado")
  }

  // 3. Calcular total
  const totalPriceInCents = cart.items.reduce(
    (acc, item) => acc + (item.productVariant.priceInCents * item.quantity),
    0
  )

  // 4. Criar pedido
  const [order] = await db.insert(orderTable).values({
    userId: session.user.id,
    shippingAddressId: cart.shippingAddressId,
    recipientName: cart.shippingAddress.recipientName,
    street: cart.shippingAddress.street,
    number: cart.shippingAddress.number,
    complement: cart.shippingAddress.complement,
    city: cart.shippingAddress.city,
    state: cart.shippingAddress.state,
    neighborhood: cart.shippingAddress.neighborhood,
    zipCode: cart.shippingAddress.zipCode,
    country: cart.shippingAddress.country,
    phone: cart.shippingAddress.phone,
    email: cart.shippingAddress.email,
    cpfOrCnpj: cart.shippingAddress.cpfOrCnpj,
    totalPriceInCents,
    status: "pending"
  }).returning()

  // 5. Criar itens do pedido
  await db.insert(orderItemTable).values(
    cart.items.map(item => ({
      orderId: order.id,
      productVariantId: item.productVariantId,
      quantity: item.quantity
    }))
  )

  // 6. Limpar carrinho
  await db.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id))

  return { orderId: order.id }
}
```

**Critérios de Aceite**:
- [ ] Pedido criado com status "pending"
- [ ] Endereço desnormalizado no pedido (snapshot)
- [ ] Itens copiados para `order_item`
- [ ] Carrinho esvaziado após sucesso
- [ ] Erro se carrinho vazio ou sem endereço

---

#### 3.5.4 Server Action: Create Checkout Session Stripe
**Arquivo**: `src/actions/create-checkout-session-stripe/index.ts`

**Schema** (`schema.ts`):
```typescript
export const createCheckoutSessionStripeSchema = z.object({
  orderId: z.string().uuid()
})
```

**Fluxo**:
```typescript
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"

export async function createCheckoutSessionStripe(
  input: z.infer<typeof createCheckoutSessionStripeSchema>
) {
  // 1. Validação
  const parsed = createCheckoutSessionStripeSchema.parse(input)

  // 2. Autenticação
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  // 3. Buscar pedido
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, parsed.orderId),
    with: {
      items: {
        with: {
          productVariant: {
            with: { product: true }
          }
        }
      }
    }
  })

  if (!order) throw new Error("Pedido não encontrado")

  // 4. Validar propriedade
  if (order.userId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  // 5. Criar line items do Stripe
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

  // 6. Criar sessão Stripe
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

**Critérios de Aceite**:
- [ ] Pedido não pertencente ao usuário retorna erro
- [ ] Line items Stripe refletem itens do pedido
- [ ] Metadata contém `orderId` para webhook
- [ ] URLs de sucesso/cancel corretas
- [ ] Sessão Stripe válida por 24h

---

### 3.6 Pagamentos e Webhooks

#### 3.6.1 Stripe Webhook Handler
**Rota**: `/api/stripe/webhook/route.ts`
**Tipo**: API Route

**Eventos Processados**:
- `checkout.session.completed`: Pagamento aprovado

**Fluxo**:
```typescript
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { db } from "@/db"
import { orderTable } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")

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
    return new Response("Invalid signature", { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId

    if (!orderId) {
      return new Response("Missing orderId in metadata", { status: 400 })
    }

    await db.update(orderTable)
      .set({ status: "paid" })
      .where(eq(orderTable.id, orderId))
  }

  return new Response("OK", { status: 200 })
}
```

**Segurança**:
- Validação de assinatura Stripe obrigatória
- Metadata deve conter `orderId`
- Eventos idempotentes (mesmo evento processado múltiplas vezes não duplica ação)

**Critérios de Aceite**:
- [ ] Assinatura inválida retorna 400
- [ ] Evento `checkout.session.completed` atualiza status para "paid"
- [ ] Evento sem `orderId` retorna erro
- [ ] Logs de eventos para debugging (produção)

---

#### 3.6.2 Checkout Success Page
**Rota**: `/checkout/success`
**Query Param**: `session_id` (Stripe)

**Comportamento**:
1. Exibe dialog de sucesso
2. Mensagem: "Pagamento confirmado! Seu pedido está sendo processado."
3. Botão "Ver meus pedidos" → redireciona para `/orders`

**Critérios de Aceite**:
- [ ] Design celebratório (ícone de sucesso, cores positivas)
- [ ] Link para `/orders` funcional
- [ ] Session ID opcional (não afeta exibição)

---

#### 3.6.3 Checkout Cancel Page
**Rota**: `/checkout/cancel`

**Comportamento**:
1. Exibe dialog de cancelamento
2. Mensagem: "Pagamento cancelado. Você pode tentar novamente."
3. Botão "Voltar ao carrinho" → redireciona para `/cart/confirmation`

**Critérios de Aceite**:
- [ ] Pedido permanece com status "pending"
- [ ] Usuário pode retomar checkout
- [ ] Link para `/cart/confirmation` funcional

---

### 3.7 Gestão de Pedidos

#### 3.7.1 Orders Page
**Rota**: `/orders`
**Tipo**: Server Component protegido

**Query**:
```typescript
const orders = await db.query.orderTable.findMany({
  where: eq(orderTable.userId, session.user.id),
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
```

**Layout**:
- Lista de pedidos (mais recentes primeiro)
- Cada pedido em accordion (shadcn/ui)
- Badge de status: "pending" (amarelo), "paid" (verde), "cancelled" (vermelho)

**Dados Exibidos**:
- Número do pedido (ID)
- Data de criação
- Status
- Total
- Endereço de entrega
- Lista de itens (nome, quantidade, preço unitário)

**Critérios de Aceite**:
- [ ] Exibe apenas pedidos do usuário logado
- [ ] Lista vazia exibe "Nenhum pedido encontrado"
- [ ] Status colorido conforme estado
- [ ] Accordion permite expandir/colapsar detalhes

---

## 4. Diretrizes de Segurança

### 4.1 Autenticação em Server Actions
**Padrão Obrigatório**:
```typescript
const session = await auth.api.getSession({
  headers: await headers()
})

if (!session?.user) {
  throw new Error("Unauthorized")
}
```

**Checklist**:
- [ ] Toda Server Action que acessa dados de usuário verifica sessão
- [ ] Throw error "Unauthorized" se sessão inexistente
- [ ] Validar propriedade de recursos (ex: `order.userId === session.user.id`)

---

### 4.2 Validação de Inputs
**Padrão Obrigatório**:
- Zod schemas para todos os formulários
- Zod schemas para todos os Server Actions
- Validação client-side (React Hook Form) + server-side (Server Action)

**Exemplo**:
```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export async function myAction(input: unknown) {
  const parsed = schema.parse(input) // Lança erro se inválido
  // ...
}
```

---

### 4.3 Proteção de Rotas
**Server Components**:
```typescript
export default async function ProtectedPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect("/auth")
  }

  // Renderizar conteúdo protegido
}
```

**Middleware** (opcional, para rotas em massa):
```typescript
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ["/cart/:path*", "/orders/:path*"]
}
```

---

## 5. Padrões de Código

### 5.1 Nomenclatura
- **Arquivos/Pastas**: kebab-case (`add-cart-product`, `sign-in-form.tsx`)
- **Componentes**: PascalCase (`AddressForm`, `CartItem`)
- **Variáveis/Funções**: camelCase (`isLoading`, `getUserCart`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_CART_ITEMS`)

---

### 5.2 Estrutura de Server Actions
**Padrão Obrigatório**:
```
src/actions/
└── action-name/
    ├── index.ts       # Implementação
    └── schema.ts      # Zod schema
```

**Referência**: `add-cart-product`

---

### 5.3 Estrutura de Hooks
**Query Hook**:
```typescript
export const getResourceQueryKey = () => ["resource"]

export function useResource() {
  return useQuery({
    queryKey: getResourceQueryKey(),
    queryFn: () => getResource()
  })
}
```

**Mutation Hook**:
```typescript
export const getMutationKey = () => ["mutation-name"]

export function useMutationName() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: getMutationKey(),
    mutationFn: (input) => serverAction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getResourceQueryKey() })
    }
  })
}
```

**Referência**: `use-cart.ts`, `use-increase-product-quantity-cart.ts`

---

### 5.4 Server vs Client Components
**Regras**:
1. **NUNCA** adicione `"use client"` em `page.tsx`
2. Páginas são Server Components por padrão
3. Crie Client Components separados para interatividade
4. Importe Client Components em Server Components

**Exemplo**:
```typescript
// page.tsx (Server Component)
export default async function CartPage() {
  const cart = await getCart()

  return <CartClient cart={cart} />
}

// cart-client.tsx (Client Component)
"use client"

export function CartClient({ cart }) {
  const mutation = useUpdateCart()
  // ...
}
```

**Referência**: `cart/identification/page.tsx` + `addresses.tsx`

---

## 6. Performance e Otimizações

### 6.1 React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 10, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})
```

---

### 6.2 Image Optimization
- Usar `next/image` para todas as imagens
- Formatos: WebP/AVIF
- Lazy loading padrão
- Placeholder blur para imagens de produto

---

### 6.3 Database Queries
- Sempre usar `with` para carregar relações necessárias
- Evitar N+1 queries
- Indexes em colunas frequentemente filtradas (`userId`, `slug`)

---

## 7. Testing (Futuro)

### 7.1 Unit Tests
- Vitest para testes de componentes
- Testing Library para interações

### 7.2 Integration Tests
- Playwright para fluxos E2E
- Testes críticos: Sign Up → Add to Cart → Checkout

### 7.3 Coverage Mínimo
- 80% para Server Actions
- 70% para componentes críticos (forms, carrinho)

---

## 8. Deployment

### 8.1 Environment Variables (Produção)
```env
# App
NEXT_PUBLIC_APP_URL=https://bewear.com.br

# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=xxx
BETTER_AUTH_URL=https://bewear.com.br

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
RESEND_API_KEY=re_xxx
```

---

### 8.2 Stripe Webhook Setup (Produção)
1. Acessar Stripe Dashboard → Webhooks
2. Adicionar endpoint: `https://bewear.com.br/api/stripe/webhook`
3. Selecionar evento: `checkout.session.completed`
4. Copiar signing secret para `STRIPE_WEBHOOK_SECRET`

---

## 9. Roadmap e Próximas Features

### 9.1 Fase 2 (Pós-MVP)
- Filtros avançados (preço, tamanho, cor)
- Wishlist
- Sistema de cupons
- Avaliações de produtos
- Rastreamento de pedidos (integração Correios)

### 9.2 Fase 3 (Scale)
- Dashboard administrativo
- Relatórios de vendas
- Gestão de estoque
- Notificações push (PWA)
- Programa de fidelidade

---

## 10. Glossário

- **RSC**: React Server Components
- **PDP**: Product Detail Page
- **BRL**: Brazilian Real (moeda)
- **RHF**: React Hook Form
- **Server Action**: Função server-side do Next.js 15
- **Query Key**: Identificador único de query no React Query
- **Mutation**: Operação de escrita (POST/PUT/DELETE)

---

## 11. Referências Rápidas

### 11.1 Arquivos de Referência
- Forms: `sign-in-form.tsx`, `sign-up-form.tsx`
- Server Actions: `add-cart-product`
- Hooks Query: `use-cart.ts`
- Hooks Mutation: `use-increase-product-quantity-cart.ts`
- Server/Client: `cart/identification/page.tsx` + `addresses.tsx`

### 11.2 Documentação Externa
- [Next.js 15 Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [React Query](https://tanstack.com/query/latest)
- [Stripe API](https://stripe.com/docs/api)
- [Drizzle ORM](https://orm.drizzle.team)

---

## Changelog

| Versão | Data | Alterações |
|--------|------|------------|
| 1.0.0  | 2025-12-01 | Documento inicial - MVP completo |

---

**Aprovações**:
- [ ] Product Manager
- [ ] Tech Lead
- [ ] QA Lead
- [ ] Security Review
