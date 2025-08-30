// recebo as variantes do produto para exibir na tela

import Image from "next/image";
import Link from "next/link";

import { productVariantTable } from "@/db/schema";

interface VariantSelectorProps {
    selectedVariantSlug: string;
    variants: (typeof productVariantTable.$inferSelect[]);
}

const VariantSelector = ({variants, selectedVariantSlug}: VariantSelectorProps) => {
    return (
        <div className="flex items-center gap-4">
            {variants.map((variant) => (
                <Link
                    href={`/product-variant/${variant.slug}`}
                    key={variant.id}
                    className={selectedVariantSlug === variant.slug ? "border-2 border-primary rounded-xl" : ""}
                >
                    <Image
                        src={variant.imageUrl}
                        alt={variant.name}
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="w-20 h-20 rounded-xl"
                    />
                </Link>
            ))}
        </div>
    )
}

export default VariantSelector;
