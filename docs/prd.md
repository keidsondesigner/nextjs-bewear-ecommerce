## Bewear E-commerce — Product Requirements Document (PRD)

### 1. Contexto e Visão Geral
- Plataforma: Next.js 15 (App Router) + React 19 + TypeScript.
- Stack principal: Tailwind CSS, shadcn/ui, TanStack Query 5, React Hook Form + Zod, BetterAuth, Drizzle ORM (PostgreSQL), Stripe.
- Objetivo macro: oferecer experiência de compra de moda premium com catálogo rico, variações de produto, carrinho persistido e checkout seguro.
- Diferenciais esperados: desempenho alto (RSC), consistência visual (design system shadcn), fluxo de autenticação robusto, e integração Stripe pronta para produção.

### 2. Objetivos de Produto
1. **Conversão**: permitir que usuários autenticados concluam compras com o menor atrito possível.
2. **Retenção**: garantir que o carrinho e endereços sejam persistidos, facilitando compras futuras.
3. **Confiança**: prover autenticação, gestão de senhas e checkout seguro (Stripe) com validações fortes.
4. **Escalabilidade**: manter arquitetura modular (Server/Client Components separados) e padrões replicáveis.

### 3. KPIs & Métricas
- Taxa de conclusão de checkout (pedidos confirmados ÷ sessões autenticadas no fluxo de carrinho).
- Tempo médio do fluxo “adicionar ao carrinho → pagamento”.
- Nº de erros de validação em server actions (meta: <1% das requisições autenticadas).
- Performance Web Vitals (LCP < 2.5s, TBT < 200ms na home e PDP).
- Disponibilidade da API Stripe (monitorar falhas em `create-checkout-session-stripe`).

### 4. Personas Principais
1. **Consumidor Moda (Carla, 29)**: acessa via mobile, busca lançamentos, quer checkout rápido e rastreável.
2. **Clienta Fiel (Joana, 35)**: já possui conta, mantém carrinho ativo e múltiplos endereços.
3. **Administrador Interno (time Bewear)**: utiliza logs e Stripe Dashboard para conciliar pedidos.

### 5. Escopo Funcional
#### 5.1 Catálogo e Descoberta
- Home (`/`): banner, categorias, listas de produtos.
- Categorias dinâmicas (`/category/[slug]`): filtragem por segmento.
- PDP geral (`/product`) e variantes (`/product-variant/[slug]`):
  - Seleção de cor/tamanho via `variant-selector`.
  - Botão “Adicionar ao carrinho” que dispara server action `add-cart-product`.

#### 5.2 Autenticação e Conta
- Fluxo BetterAuth (`/auth`) com tabs Sign-in/Sign-up (`sign-in-form.tsx`, `sign-up-form.tsx`).
- Recuperação de senha (`/auth/forgot-password`), reset com token (`/auth/reset-password/[token]`).
- Sessões expostas via server actions com `auth.api.getSession({ headers: await headers() })`.

#### 5.3 Carrinho e Checkout
- Carrinho persistido por usuário: `cartTable`, `cartItemTable`, hooks `use-cart`.
- Ações suportadas:
  - Adicionar produto (quantidade configurável).
  - Aumentar/diminuir quantidade (`use-increase-product-quantity-cart`, `use-decrease-product-quantity-cart`).
  - Remover item (`use-remove-product-from-cart`).
- Página `/cart/identification` (Server Component):
  - Listagem/seleção de endereços (`addresses.tsx`).
  - Criação de novo endereço (`add-address-form.tsx`) com React Hook Form + Zod.
  - Mutação `update-cart-shipping-address` antes de seguir para `/cart/confirmation`.
- Página `/cart/confirmation`:
  - Revisão final do pedido (component `summary-cart-order`).
  - Ação `finish-purchase` gera pedido e prepara dados para Stripe.

#### 5.4 Pagamentos
- Integração Stripe:
  - Server Action `create-checkout-session-stripe` valida sessão, pedido e itens antes de criar `checkout.sessions`.
  - Uso de `@stripe/stripe-js` no client para redirecionar.
  - Webhook `/api/stripe/webhook` (não detalhado aqui) processará eventos pós-pagamento.
  - Variáveis obrigatórias: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`.

#### 5.5 Pós-compra e Pedidos
- Página `/orders` (protegida) lista pedidos do usuário.
- Emails transacionais via Resend (reset de senha inicialmente, extensível para confirmação de pedido).

### 6. Requisitos Funcionais Detalhados
1. **Produtos**
   - RF01: Exibir catálogo com paginação/lazy load (TanStack Query) e filtros básicos por categoria.
   - RF02: PDP deve mostrar variações e validar disponibilidade antes de permitir adicionar ao carrinho.
2. **Carrinho**
   - RF03: Cada usuário autenticado possui carrinho único; criar automaticamente se inexistente (`get-cart`).
   - RF04: Operações de alteração de itens devem invalidar cache (`revalidatePath("/cart/identification")`).
3. **Endereços**
   - RF05: Usuário pode cadastrar múltiplos endereços; dados obrigatórios: nome, rua, número, cidade, CEP, estado, telefone, CPF/CNPJ.
   - RF06: Selecionar endereço existente ou criar novo antes de avançar no checkout.
4. **Checkout**
   - RF07: `finish-purchase` deve criar registro em `orderTable` e `orderItemTable`.
   - RF08: Somente pedidos com endereço associado podem iniciar sessão Stripe.
5. **Pagamentos**
   - RF09: `create-checkout-session-stripe` deve validar se o pedido pertence ao usuário logado.
   - RF10: Pós-retorno Stripe, usuário direcionado para `/checkout/success` ou `/checkout/cancel`.
6. **Autenticação**
   - RF11: Todo fluxo protegido deve verificar sessão e redirecionar para `/auth` se ausente.
   - RF12: Reset de senha deve validar token único e expiração.

### 7. Requisitos Não Funcionais
- RNF01: Manter padrão de segurança descrito em `development-guidelines.md` (checagem de sessão, separação Server/Client Components).
- RNF02: Tempo de resposta server actions < 500ms em média.
- RNF03: Cobertura de validação Zod para todos os formulários e server actions.
- RNF04: Acessibilidade básica (WCAG AA) em formulários e botões críticos.
- RNF05: Internacionalização futura (strings centralizadas), embora MVP em português.

### 8. Fluxos Principais (alto nível)
1. **Funnel compra**
   1. Navega catálogo → abre PDP → seleciona variante → adiciona ao carrinho.
   2. Acessa `/cart/identification` → escolhe ou cria endereço → vai para `/cart/confirmation`.
   3. Confirma itens → dispara `finish-purchase` → chama `create-checkout-session-stripe` → Stripe Checkout → sucesso/cancelamento.
2. **Gestão de endereço**
   1. Seleciona “Adicionar novo” → formulário RHF + Zod → chama `create-shipping-address` → salva e associa ao carrinho.
3. **Autenticação**
   1. Usuário acessa rota protegida → server component verifica sessão → redireciona se inexistente.

### 9. Dependências e Integrações
- BetterAuth + Resend (emails transacionais).
- Stripe (checkout e webhooks).
- PostgreSQL (persistência via Drizzle).
- Sonner (feedback de UX).

### 10. Riscos & Mitigações
- **Falha Stripe**: exibir fallback e permitir retomar pagamento via `/orders`.
- **Dados inconsistentes de carrinho**: sempre validar propriedade do recurso (`cart.userId === session.user.id`).
- **Escalada de complexidade client-side**: manter regras de não usar `"use client"` em `page.tsx` e extrair componentes.
- **Compliance LGPD**: armazenar apenas dados necessários, mascarar CPF/CNPJ quando exibido.

### 11. Roadmap Macro
1. **MVP (Semana 1-3)**: Catálogo, auth, carrinho básico, endereços, integração Stripe sandbox.
2. **Checkout completo (Semana 4-5)**: Página de confirmação, pedidos, emails, webhooks Stripe.
3. **Melhorias (Semana 6+)**: Filtros avançados, wishlist, cupons, relatórios administrativos.

### 12. Critérios de Aceite Gerais
- Fluxo completo de compra executável em ambiente de staging, com pagamento Stripe teste aprovado.
- Nenhuma server action acessível sem sessão válida.
- UI responsiva em breakpoints principais (375px, 768px, 1280px).
- Documentação atualizada (`development-guidelines.md`, `STRIPE_INTEGRATION.md`, este PRD).

