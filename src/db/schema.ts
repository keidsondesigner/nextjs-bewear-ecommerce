import { relations } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Tipo de relacao: Um para Muitos (Um usuário tem muitos endereços de envio)
export const userRelations = relations(userTable, (params) => ({
  shippingAddresses: params.many(shippingAddressTable),
  cart: params.one(cartTable, {
    fields: [userTable.id],
    references: [cartTable.userId],
  }),
}));

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const accountTable = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationTable = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const categoryTable = pgTable("categories", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productTable = pgTable("products", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),

  // Chave estrangeira para a tabela de categorias
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categoryTable.id, { onDelete: "set null" }),
});

export const productVariantTable = pgTable("product_variants", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  color: text().notNull(),
  size: text().notNull(),
  imageUrl: text("image_url").notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),

  // Chave estrangeira para a tabela de produtos
  productId: uuid("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "cascade" }),
});

// Tipo de relacao: Muitos para Um (Muitos produtos pertencem a uma categoria)
export const categoryRelations = relations(categoryTable, (params) => {
  return {
    products: params.many(productTable),
  };
});

// Tipo de relacao: Um para Muitos (Um produto pertence a uma categoria e tem muitos variantes)
export const productRelations = relations(productTable, (params) => {
  return {
    category: params.one(categoryTable, {
      fields: [productTable.categoryId],
      references: [categoryTable.id],
    }),
    variants: params.many(productVariantTable),
  };
});

// Tipo de relacao: Um para Muitos (Um produto tem Muitos variantes)
export const productVariantRelations = relations(productVariantTable, (params) => {
  return {
    product: params.one(productTable, {
      fields: [productVariantTable.productId],
      references: [productTable.id],
    }),
  };
});



// TABELAS DO CARRINHO DE COMPRAS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// Tabela de endereços de envio
export const shippingAddressTable = pgTable("shipping_address", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }), // Se eu deletar o usuário, deletar também o endereço de envio
  recipientName: text("recipient_name").notNull(),
  street: text().notNull(),
  number: text().notNull(),
  complement: text(),
  city: text().notNull(),
  state: text().notNull(),
  neighborhood: text().notNull(),
  zipCode: text().notNull(),
  country: text().notNull(),
  phone: text().notNull(),
  email: text().notNull(),
  cpfOrCnpj: text().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tipo de relacao: Um para Muitos (Um endereço de envio pertence a um usuário)
// Tipo de relacao: Um para Muitos (Um endereço de envio pertence a um carrinho)
export const shippingAddressRelations = relations(shippingAddressTable, (params) => ({
  user: params.one(userTable, {
    fields: [shippingAddressTable.userId],
    references: [userTable.id],
  }),
  cart: params.one(cartTable, {
    fields: [shippingAddressTable.id],
    references: [cartTable.shippingAddressesId],
  }),
}));

// Tabela de carrinho de compras
export const cartTable = pgTable("cart", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  shippingAddressesId: uuid("shipping_addresses_id")
    .references(() => shippingAddressTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tipo de relacao: Um para Muitos (Um carrinho de compras pertence a um usuário)
export const cartRelations = relations(cartTable, (params) => ({
  user: params.one(userTable, {
    fields: [cartTable.userId],
    references: [userTable.id],
  }),
  shippingAddresses: params.one(shippingAddressTable, {
    fields: [cartTable.shippingAddressesId],
    references: [shippingAddressTable.id],
  }),
  cartItem: params.many(cartItemTable),
}));

// Tabela de itens do carrinho - o item do carrinho, é um produto com sua quantidade.
export const cartItemTable = pgTable("cart_item", {
  id: uuid().primaryKey().defaultRandom(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => cartTable.id, { onDelete: "cascade" }), // Se eu deletar o carrinho, deletar também os itens do carrinho
  productVariantId: uuid("product_variant_id")
    .notNull()
    .references(() => productVariantTable.id, { onDelete: "cascade" }), // Se eu deletar a variante do produto, deletar também o item do carrinho
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tipo de relacao: Um para Muitos (Um item do carrinho pertence a um carrinho)
export const cartItemRelations = relations(cartItemTable, (params) => ({
  cart: params.one(cartTable, {
    fields: [cartItemTable.cartId],
    references: [cartTable.id],
  }),
  productVariant: params.one(productVariantTable, {
    fields: [cartItemTable.productVariantId],
    references: [productVariantTable.id],
  }),
}));