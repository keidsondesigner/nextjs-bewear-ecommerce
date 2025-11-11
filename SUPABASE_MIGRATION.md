# Migração para Supabase

Este documento descreve como migrar o projeto do Neon Database para o Supabase mantendo o Drizzle ORM.

## Mudanças Implementadas

### 1. Pacotes Instalados

```bash
npm install @supabase/supabase-js @supabase/ssr postgres-js
```

- `@supabase/supabase-js` - Cliente JavaScript do Supabase
- `@supabase/ssr` - Suporte para Server-Side Rendering com Supabase
- `postgres-js` - Cliente PostgreSQL compatível com Supabase (substitui o `pg`)

### 2. Arquivos Modificados

#### [src/db/index.ts](src/db/index.ts)
Atualizado para usar `drizzle-orm/postgres-js` em vez de `drizzle-orm/node-postgres`:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
```

**Nota:** `prepare: false` é necessário para o modo "Transaction" do Supabase Pooler.

#### [.env](.env)
Atualizado com as credenciais do Supabase:

```env
# Supabase Database credentials (Transaction pool mode)
DATABASE_URL="postgresql://postgres.stlnodccbuxsiqgglgme:[YOUR-PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:6543/postgres"

# Supabase Project credentials
NEXT_PUBLIC_SUPABASE_URL=https://stlnodccbuxsiqgglgme.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Novos Arquivos Criados (OPCIONAIS)

#### [src/utils/supabase/server.ts](src/utils/supabase/server.ts)
Cliente Supabase para Server Components (OPCIONAL - apenas para Storage/Realtime):

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* ... */ } }
  );
};
```

#### [src/utils/supabase/client.ts](src/utils/supabase/client.ts)
Cliente Supabase para Client Components (OPCIONAL - apenas para Storage/Realtime):

```typescript
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

**Importante:** Estes clientes **NÃO são usados atualmente** porque:
- **Autenticação**: Você está usando Better Auth, não Supabase Auth
- **Banco de dados**: Você está usando Drizzle ORM, não Supabase Client
- **Uso futuro**: Disponíveis caso você queira usar Supabase Storage ou Realtime

## Passos para Concluir a Migração

### 1. Obter a Senha do Banco de Dados

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto: `stlnodccbuxsiqgglgme`
3. Vá em **Settings** → **Database**
4. Copie a senha do banco de dados (ou redefina se necessário)

### 2. Atualizar o Arquivo .env

Substitua `[YOUR-PASSWORD]` no arquivo `.env` pela senha real do banco:

```env
DATABASE_URL="postgresql://postgres.stlnodccbuxsiqgglgme:sua-senha-aqui@aws-1-sa-east-1.pooler.supabase.com:6543/postgres"
```

### 3. Aplicar o Schema no Supabase

Execute o comando do Drizzle para aplicar as tabelas:

```bash
npx drizzle-kit push
```

Isso criará todas as tabelas definidas em [src/db/schema.ts](src/db/schema.ts) no banco Supabase.

### 4. Executar o Seed

Popule o banco com dados iniciais:

```bash
npx tsx --env-file=.env src/db/seed.ts
```

### 5. Testar a Conexão

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Verifique se a aplicação consegue:
- Conectar ao banco de dados
- Realizar queries
- Autenticar usuários
- Processar carrinhos e pedidos

## Diferenças Entre Neon e Supabase

| Aspecto | Neon | Supabase |
|---------|------|----------|
| **Cliente PostgreSQL** | `pg` (node-postgres) | `postgres-js` |
| **Drizzle Adapter** | `drizzle-orm/node-postgres` | `drizzle-orm/postgres-js` |
| **Pooler Mode** | Session | Transaction (`prepare: false`) |
| **Extras** | Apenas banco | Banco + Auth + Storage + Realtime |

## Vantagens do Supabase

1. **All-in-one Platform**: Banco de dados, autenticação, storage e realtime em um só lugar
2. **Dashboard Intuitivo**: Interface gráfica para gerenciar dados, usuários e configurações
3. **Auth Built-in**: Sistema de autenticação nativo (opcional, você está usando Better Auth)
4. **Realtime Subscriptions**: Possibilidade de adicionar subscriptions em tempo real no futuro
5. **Edge Functions**: Serverless functions integradas (se necessário)
6. **Storage**: Armazenamento de arquivos integrado (útil para imagens de produtos)

## Mantendo o Drizzle ORM

O projeto **continua usando Drizzle ORM** para todas as operações de banco de dados. O Supabase é apenas o provedor de infraestrutura PostgreSQL. Você pode:

- Continuar usando queries do Drizzle normalmente
- Manter todas as suas tipagens e schemas
- Executar migrations com `drizzle-kit`
- Usar os mesmos padrões de desenvolvimento

## Uso dos Clientes Supabase (OPCIONAL)

⚠️ **Importante**: Você **NÃO está usando Supabase Auth** porque já tem Better Auth implementado.

Os clientes Supabase em `src/utils/supabase/` são **totalmente opcionais** e só devem ser usados se você quiser aproveitar recursos extras do Supabase:

### Recursos OPCIONAIS do Supabase (não implementados ainda):

- **Supabase Storage**: Para upload e armazenamento de imagens de produtos
  - Exemplo: Upload de fotos de produtos diretamente no Supabase
  - Vantagem: CDN integrado e redimensionamento automático de imagens

- **Supabase Realtime**: Para notificações em tempo real
  - Exemplo: Atualizar status de pedido em tempo real sem refresh
  - Vantagem: WebSocket automático sem configurar servidor separado

- **Row Level Security (RLS)**: Políticas de segurança a nível de linha
  - Exemplo: Garantir que usuários só vejam seus próprios pedidos
  - Vantagem: Segurança adicional no nível do banco de dados

### O que você CONTINUA usando:

✅ **Drizzle ORM** - Todas as queries de banco de dados
✅ **Better Auth** - Sistema de autenticação e sessões
✅ **Server Actions** - Mutations e validações
✅ **React Query** - Cache e estado do servidor

**Supabase é apenas o provedor de infraestrutura PostgreSQL.**

## Troubleshooting

### Erro: "password authentication failed"

- Verifique se a senha em `DATABASE_URL` está correta
- Confirme que está usando o pooler correto (port 6543 para Transaction mode)

### Erro: "prepared statement ... already exists"

- Certifique-se de que `prepare: false` está configurado no cliente postgres

### Tabelas não aparecem no Dashboard

- Execute `npx drizzle-kit push` novamente
- Verifique a aba **Table Editor** no Supabase Dashboard

## Próximos Passos (Opcionais - Recursos Supabase)

Se quiser aproveitar recursos extras do Supabase no futuro:

1. **Supabase Storage** - Armazenar imagens de produtos com CDN
2. **Supabase Realtime** - Notificações em tempo real de pedidos
3. **Row Level Security (RLS)** - Segurança adicional no banco de dados

**NÃO migre para Supabase Auth** - você já tem Better Auth funcionando perfeitamente!

## Rollback (Voltar para Neon)

Se precisar voltar para o Neon:

1. Restaure o `DATABASE_URL` antigo no `.env`
2. Reverta [src/db/index.ts](src/db/index.ts) para usar `drizzle-orm/node-postgres`
3. Execute `npm install pg` e `npm uninstall postgres-js`

---

**Documentação Oficial:**
- [Drizzle ORM com Supabase](https://orm.drizzle.team/docs/get-started-postgresql#supabase)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase com Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
