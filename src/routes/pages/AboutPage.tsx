import { useTranslation } from "react-i18next";
import {
  FiCheckCircle,
  FiTarget,
  FiUsers,
  FiShoppingBag,
} from "react-icons/fi";
import { FaHistory, FaLeaf, FaSeedling, FaTint } from "react-icons/fa";
import { Link } from "react-router-dom";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/60 dark:border-slate-800 bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop"
            alt="Agricultural landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 lg:py-24 relative z-10 text-left">
          <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-4">
            {t("about.intro_subtitle")}
          </p>
          <h1 className="text-4xl lg:text-7xl font-black mb-4 leading-tight tracking-tight drop-shadow-2xl text-white max-w-4xl">
            {t("about.hero_title")}{" "}
            <span className="text-primary-500">
              {t("about.hero_highlight")}
            </span>
          </h1>
          <p className="text-white/90 text-lg lg:text-xl font-medium max-w-2xl leading-relaxed drop-shadow-md mb-8">
            {t("about.hero_tagline")}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/products"
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary-600/20 flex items-center gap-2 group"
            >
              <FiShoppingBag className="group-hover:translate-x-1 transition-transform" />
              {t("about.browse_link")}
            </Link>
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-bold uppercase tracking-wide">
                  <FiCheckCircle />
                  {t("about.vision_label")}
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                  {t("about.vision_title")}
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  {t("about.description")}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  <div className="p-7 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm">
                    <FiTarget className="text-primary-600 mb-4" size={22} />
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                      {t("about.mission_label")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t("about.mission_desc")}
                    </p>
                  </div>
                  <div className="p-7 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm">
                    <FaHistory className="text-primary-600 mb-4" size={22} />
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                      {t("about.history_label")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t("about.history_desc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <img
                  src="https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?q=80&w=800&auto=format&fit=crop"
                  alt="Fresh produce"
                  className="rounded-3xl object-cover h-64 w-full shadow-2xl"
                />
                <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200/70 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm">
                  <p className="text-4xl font-black mb-1 text-primary-700 dark:text-primary-400">100%</p>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {t("about.quality_guarantee")}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-primary-700 p-8 rounded-3xl text-white shadow-xl shadow-primary-900/20">
                  <FiUsers size={32} className="mb-4" />
                  <p className="text-2xl font-black leading-tight tracking-tight">
                    {t("about.community_focus")}
                  </p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop"
                  alt="Farmer harvesting fresh produce"
                  className="rounded-3xl object-cover h-80 w-full shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values / Why Us */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-16">
            {t("about.drives_us")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                key: "transparency",
                icon: FiCheckCircle,
              },
              {
                key: "impact",
                icon: FiTarget,
              },
              {
                key: "innovation",
                icon: FaHistory,
              },
            ].map((value, idx) => (
              <div
                key={idx}
                className="group p-10 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-800 text-left"
              >
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <value.icon className="text-primary-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {t(`about.value_title_${value.key}`)}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t(`about.value_desc_${value.key}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What We Offer ─────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f5f2e8] dark:bg-gray-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-bold mb-4">
              <FiCheckCircle size={14} />
              {t("about.services.subtitle")}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
              {t("about.services.title")}
            </h2>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                key: "agriculture",
                Icon: FaLeaf,
                image:
                  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&auto=format&fit=crop",
              },
              {
                key: "organic",
                Icon: FaSeedling,
                image:
                  "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=800&auto=format&fit=crop",
              },
              {
                key: "dairy",
                Icon: FaTint,
                image:
                  "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=800&auto=format&fit=crop",
              },
            ].map(({ key, Icon, image }) => (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-visible"
              >
                {/* Image with icon badge */}
                <div className="relative">
                  <img
                    src={image}
                    alt={t(`about.services.${key}.title`)}
                    className="w-full h-56 object-cover rounded-t-2xl"
                  />
                  <div className="absolute bottom-0 right-5 translate-y-1/2 w-14 h-14 bg-[#7cb518] rounded-xl flex items-center justify-center shadow-lg z-10">
                    <Icon className="text-white" size={26} />
                  </div>
                </div>
                {/* Content */}
                <div className="p-6 pt-10">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {t(`about.services.${key}.title`)}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {t(`about.services.${key}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose KrushiKranti ────────────────────────────────────── */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-xl">
            {/* Left: image + overlay text */}
            <div className="relative h-72 sm:h-96 lg:h-auto min-h-[420px]">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop"
                alt="Farm landscape"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Mustard parallelogram overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="bg-[#c99a2e]/90 px-12 py-8 text-center shadow-2xl"
                  style={{
                    clipPath: "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)",
                  }}
                >
                  <p
                    className="text-white text-2xl leading-snug"
                    style={{ fontFamily: "var(--font-cursive)" }}
                  >
                    {t("about.why_choose.overlay_line1")}
                    <br />
                    {t("about.why_choose.overlay_line2")}
                    <br />
                    {t("about.why_choose.overlay_line3")}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: content */}
            <div className="p-10 lg:p-14 bg-white dark:bg-gray-900 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-bold mb-4 self-start">
                <FiCheckCircle size={14} />
                {t("about.why_choose.subtitle")}
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-5 leading-tight">
                {t("about.why_choose.title")}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-sm">
                {t("about.why_choose.desc")}
              </p>

              {/* Benefits */}
              <div className="space-y-6 mb-10">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-primary-600 shrink-0 flex items-center justify-center shadow-md">
                      <FiCheckCircle className="text-white" size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                        {t(`about.why_choose.benefit${n}_title`)}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        {t(`about.why_choose.benefit${n}_desc`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/products"
                className="inline-block px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary-600/20 self-start"
              >
                {t("about.why_choose.cta")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
