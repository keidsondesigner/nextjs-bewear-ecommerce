import { relations } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  name: text().notNull(),
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
    .references(() => categoryTable.id, { onDelete: "cascade" }),
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