import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useDebounce } from '../../../shared/hooks';
import { fetchProducts, fetchCategories, setFilters, clearFilters, setPage } from '../productSlice';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { useTranslation } from 'react-i18next';
import { RiPlantLine } from 'react-icons/ri';
import type { ProductCategory } from '../types';
import fruits from '../../../assets/fruits.png';
import { EmptyState, ErrorState } from '../../../shared/components/ui';

export function ProductListPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { products, categories, filters, pagination, isLoading, error } = useAppSelector(
    (state) => state.product
  );
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const categoryLabels: Record<ProductCategory, string> = {
    vegetables: t('categories.vegetables'),
    fruits: t('categories.fruits'),
    grains: t('categories.grains'),
    pulses: t('categories.pulses'),
    spices: t('categories.spices'),
    dairy: t('categories.dairy'),
    other: t('categories.other'),
  };

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    dispatch(setFilters({ search: debouncedSearch }));
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({ filters, page: pagination.page, limit: pagination.limit }));
  }, [dispatch, filters, pagination.page, pagination.limit]);

  const handleCategoryChange = (category: string) => {
    dispatch(setFilters({ category: category === '' ? undefined : (category as ProductCategory) }));
    dispatch(setPage(1));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchInput('');
    dispatch(setPage(1));
  };

  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = !!(filters.category || filters.search || filters.organic);

  // --- Clean minimal filter sidebar ---
  const FilterPanel = () => (
    <div>
      {/* Category section */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">{t('products.category_label')}</p>
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => handleCategoryChange('')}
              className={`w-full text-left px-2 py-1.5 text-sm rounded transition-none ${!filters.category
                ? 'text-green-700 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20'
                : 'text-slate-600 dark:text-slate-400'
                }`}
            >
              {t('products.all_products')}
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => handleCategoryChange(cat)}
                className={`w-full text-left px-2 py-1.5 text-sm rounded capitalize transition-none ${filters.category === cat
                  ? 'text-green-700 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20'
                  : 'text-slate-600 dark:text-slate-400'
                  }`}
              >
                {categoryLabels[cat]}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Organic section */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">{t('products.type_label')}</p>
        <label className="flex items-center gap-3 cursor-pointer px-2 py-1.5">
          <div
            role="checkbox"
            aria-checked={!!filters.organic}
            onClick={() => dispatch(setFilters({ organic: filters.organic ? undefined : true }))}
            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 cursor-pointer ${filters.organic
              ? 'bg-green-600 border-green-600'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900'
              }`}
          >
            {filters.organic && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400">{t('products.organic_only')}</span>
        </label>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="text-xs text-slate-400 dark:text-slate-500 px-2 py-1 underline underline-offset-2"
        >
          {t('products.clear_all_filters')}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950">
      {/* Refined Page Header Banner - Full Width */}
      <div className="relative bg-[#f7f5ef] dark:bg-gray-950 overflow-hidden border-b border-slate-200/60 dark:border-slate-800">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[40%] h-full bg-green-100/30 dark:bg-green-900/10 skew-x-[-12deg] translate-x-12 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 lg:py-14 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center md:text-left">
              <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                {t('products.hero_title_1')} <span className="text-primary-600">{t('products.hero_harvests')}</span> <br className="hidden lg:block" /> {t('products.hero_title_2')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base lg:text-lg font-medium max-w-md leading-relaxed">
                {t('products.hero_subtitle')}
              </p>
            </div>

            {/* Right side: Fruit Image */}
            <div className="relative w-full md:w-1/2 lg:w-2/5 flex justify-center md:justify-end pointer-events-none">
              <div className="relative group">
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-yellow-400/20 blur-[50px] rounded-full scale-125" />
                <img
                  src={fruits}
                  alt="Harvest Fruits"
                  className="relative z-10 w-full max-w-[320px] object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.1)] transition-all duration-1000 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Control Bar */}
      <div className="sticky top-0 z-30 px-4 md:px-8 py-6 bg-[#F8FAFC]/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white hidden md:block">
              {t('products.fresh_products')}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full shrink-0">
              {pagination.total} {t('products.items_label')}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-80">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder={t('products.search_placeholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all shadow-sm"
              />
            </div>

            {/* Mobile filter toggle */}
            <button
              className="lg:hidden flex items-center justify-center w-12 h-12 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 bg-white dark:bg-gray-900 shadow-sm transition-all active:scale-95"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-64 bg-white dark:bg-gray-900 h-full overflow-y-auto p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{t('products.filters_label')}</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-44 shrink-0 pt-1">
          <FilterPanel />
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="mb-5">
              <ErrorState message={error} onRetry={() => dispatch(fetchProducts({ filters, page: pagination.page, limit: pagination.limit }))} />
            </div>
          )}

          {!isLoading && products.length > 0 && (
            <p className="text-xs text-slate-400 mb-5">
              {t('products.showing')} <strong className="text-slate-600 dark:text-slate-300">{products.length}</strong> {t('products.of')} {pagination.total} {t('products.products_text')}
              {filters.category && (
                <> · {t('products.filtered_by')} <strong className="text-green-600">{categoryLabels[filters.category as ProductCategory]}</strong></>
              )}
            </p>
          )}

          {/* Grid: max 3 columns with centered wider cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 justify-items-center gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
          </div>

          {/* Empty state */}
          {!isLoading && products.length === 0 && (
            <EmptyState
              icon={<RiPlantLine size={26} />}
              title={t('products.no_products')}
              message={t('products.no_products_desc')}
              actionLabel={hasActiveFilters ? t('products.clear_filters') : undefined}
              onAction={hasActiveFilters ? handleClearFilters : undefined}
            />
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 text-slate-600 dark:text-slate-400 disabled:opacity-40"
              >
                ←
              </button>
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-9 h-9 text-sm font-semibold rounded-lg ${pagination.page === i + 1
                    ? 'bg-green-600 text-white'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 text-slate-600 dark:text-slate-400'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 text-slate-600 dark:text-slate-400 disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
