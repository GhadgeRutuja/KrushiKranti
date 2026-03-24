import { useTranslation } from 'react-i18next';

/**
 * Resolves a localised product field.
 *
 * Strategy:
 *  1. Look for a translation key `products.items.<productId>.<field>` in the
 *     active locale file. This lets translators override any product string.
 *  2. Fall back to the raw English value already stored on the Product object.
 *
 * Usage:
 *   const { localise } = useProductLocale();
 *   <p>{localise(product.id, 'name', product.name)}</p>
 *   <p>{localise(product.id, 'description', product.description)}</p>
 */
export function useProductLocale() {
    const { t, i18n } = useTranslation();

    const localise = (
        productId: string,
        field: 'name' | 'description' | 'category',
        fallback: string
    ): string => {
        const key = `products.items.${productId}.${field}`;
        const translated = t(key, { defaultValue: '' });
        // i18next returns the key itself when no translation found; treat that as empty
        return translated && translated !== key ? translated : fallback;
    };

    return { localise, language: i18n.language };
}
