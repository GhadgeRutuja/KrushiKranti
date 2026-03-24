import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaStar, FaChevronUp, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { BannerCarousel } from "../../components/home/BannerCarousel";
import img1 from "../../assets/img1.png";
import img2 from "../../assets/img2.png";
import vector1 from "../../assets/Vector 1.png";
import vector2 from "../../assets/Vector 2.png";
import faqimg from "../../assets/faqimg.png";
import faqsection from "../../assets/faqsection.png";

// Count-up component — animates from 0 to `end` when scrolled into view
function StatCounter({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const startTime = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center py-8 px-6 rounded-2xl bg-green-50/60 dark:bg-green-900/10 border border-green-100/50 dark:border-green-800/20 shadow-sm">
      <span className="text-4xl font-black mb-1 font-sans text-green-700 dark:text-green-400">
        {count}{suffix}
      </span>
      <span className="text-[10px] font-bold text-green-600/70 dark:text-green-500/50 uppercase tracking-[0.2em] font-sans">
        {label}
      </span>
    </div>
  );
}

export function HomePage() {
  const { t } = useTranslation();
  const stats = [
    { end: 50, suffix: "K+", label: t("home.stats.active_farmers") },
    { end: 200, suffix: "+", label: t("home.stats.cities_covered") },
    { end: 98, suffix: "%", label: t("home.stats.quality_pass_rate") },
    { end: 24, suffix: "h", label: t("home.stats.avg_delivery_time") },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Bonnie Tolbert",
      role: t("home.testimonials.items.1.role"),
      text: t("home.testimonials.items.1.text"),
      image: "https://i.pravatar.cc/150?u=bonnie",
      rating: 5
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      role: t("home.testimonials.items.2.role"),
      text: t("home.testimonials.items.2.text"),
      image: "https://i.pravatar.cc/150?u=rajesh",
      rating: 5
    },
    {
      id: 3,
      name: "Sarah Miller",
      role: t("home.testimonials.items.3.role"),
      text: t("home.testimonials.items.3.text"),
      image: "https://i.pravatar.cc/150?u=sarah",
      rating: 5
    }
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const [activeFaq, setActiveFaq] = useState<number | null>(1);

  const faqs = [
    {
      q: t("home.faq.items.1.q"),
      a: t("home.faq.items.1.a")
    },
    {
      q: t("home.faq.items.2.q"),
      a: t("home.faq.items.2.a")
    },
    {
      q: t("home.faq.items.3.q"),
      a: t("home.faq.items.3.a")
    }
  ];

  return (
    <div className="min-h-screen">
      {/* ======================================
          OLD HERO SECTION - COMMENTED OUT
          REPLACED WITH BANNER CAROUSEL BELOW
          ====================================== */}
      {/* 
      <section className="relative text-white py-20 lg:py-32">
        {/* Isolated background container to manage scale/overflow without clipping floating cards */}
        {/* <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          {/* Video Background */}
          {/* <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          >
            <source src="/homepg.mp4" type="video/mp4" />
          </video> */}
          {/* Dark Overlay */}
          {/* <div className="absolute inset-0 bg-black/70"></div>
        </div> */}

        {/* Content */}
        {/* <div className="container-custom relative z-10 pb-16 lg:pb-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight font-sans">
              {t("home.hero_title")}
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-xl">
              {t("home.hero_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                {t("home.browse_products")}
                <FaArrowRight size={15} />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 border border-white hover:bg-white hover:text-slate-900 text-white font-bold py-3 px-8 rounded-lg transition-all"
              >
                {t("home.become_seller")}
              </Link>
            </div>
          </div>
        </div> */}

        {/* Floating Feature Cards */}
        {/* <div className="relative md:absolute md:bottom-0 md:left-0 md:w-full z-40 translate-y-0 md:translate-y-1/2 pointer-events-none mt-16 md:mt-0 pb-12 md:pb-0">
          <div className="container-custom pointer-events-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
              {[
                {
                  icon: FiGlobe,
                  title: t("home.tech_feature_title"),
                  desc: t("home.tech_feature_desc"),
                  iconColor: "text-green-600",
                  bgColor: "bg-green-100 dark:bg-green-900/20",
                  cardBg: "bg-green-50 dark:bg-green-900/10"
                },
                {
                  icon: FiShoppingCart,
                  title: t("home.organic_feature_title"),
                  desc: t("home.organic_feature_desc"),
                  iconColor: "text-yellow-600",
                  bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
                  cardBg: "bg-yellow-50 dark:bg-yellow-900/10"
                },
                {
                  icon: FiUsers,
                  title: t("home.systems_feature_title"),
                  desc: t("home.systems_feature_desc"),
                  iconColor: "text-lime-600",
                  bgColor: "bg-lime-100 dark:bg-lime-900/20",
                  cardBg: "bg-lime-50 dark:bg-lime-900/10"
                },
              ].map((card, idx) => (
                <div key={idx} className={`${card.cardBg} rounded-xl p-6 shadow-md flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-1 group border border-slate-100/50 dark:border-slate-800/50 bg-white dark:bg-gray-900/40`}>
                  <div className={`w-16 h-16 rounded-full ${card.bgColor} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm`}>
                    <card.icon className={`${card.iconColor} text-4xl`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 font-sans">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      */}

      {/* ====================================== 
          NEW BANNER CAROUSEL SECTION
          ====================================== */}
      <BannerCarousel />

      {/* Introduction Section */}
      <section className="pt-24 md:pt-[240px] pb-24 bg-white dark:bg-gray-950 overflow-hidden relative z-10">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left: Overlapping Circular Images */}
            <div className="relative">
              <div className="relative w-full aspect-square max-w-[450px] mx-auto">
                {/* Large Background Circle/Image */}
                <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl ring-8 ring-white dark:ring-gray-900 z-10 transition-transform hover:scale-[1.02]">
                  <img
                    src={img1}
                    alt="Farm Field"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Small Foreground Overlapping Circle/Image */}
                <div className="absolute -bottom-6 -left-6 w-3/5 aspect-square rounded-full overflow-hidden shadow-2xl ring-8 ring-white dark:ring-gray-900 transition-transform hover:scale-105 z-20">
                  <img
                    src={img2}
                    alt="Fresh Produce"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="relative">
              <span className="text-accent-500 font-bold mb-4 block uppercase tracking-wider text-sm font-sans">
                {t("home.intro_subtitle")}
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight font-sans">
                {t("home.intro_title")}
              </h2>
              <p className="text-primary-600 dark:text-primary-400 font-bold text-lg mb-6">
                {t("home.intro_highlight")}
              </p>
              <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed max-w-lg">
                {t("home.intro_desc")}
              </p>

              {/* Feature Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 shadow-md flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 transition-transform hover:scale-105">
                    <img src={vector1} alt="Direct Trade Vector" className="w-10 h-10 object-contain" />
                  </div>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white leading-tight font-sans">
                    {t("home.feature_growing_title")}
                  </span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 shadow-md flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 transition-transform hover:scale-105">
                    <img src={vector2} alt="Quality Assured Vector" className="w-10 h-10 object-contain" />
                  </div>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white leading-tight font-sans">
                    {t("home.feature_ripening_title")}
                  </span>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-4 mb-10 text-slate-700 dark:text-slate-300 font-bold font-sans">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{t("home.checklist_1")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{t("home.checklist_2")}</span>
                </div>
              </div>

              {/* Button */}
              <Link
                to="/about"
                className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-primary-600/30 font-sans"
              >
                {t("home.discover_more")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Board Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat) => (
              <StatCounter key={stat.label} end={stat.end} suffix={stat.suffix} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* About/Detail Section - Simple & Minimal */}
      <section className="py-20 bg-slate-50 dark:bg-gray-900 border-y border-slate-100 dark:border-slate-800 font-sans">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                {t("home.empowering_farmers")}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                {t("home.empowering_desc")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  t("home.pillars.direct_access"),
                  t("home.pillars.market_data"),
                  t("home.pillars.bulk_procurement"),
                  t("home.pillars.organic_cert"),
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300"
                  >
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                    {item}
                  </div>
                ))}
              </div>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold"
              >
                {t("home.learn_more")}
                <FaArrowRight size={15} />
              </Link>
            </div>
            <div className="bg-slate-200 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80"
                alt="Agricultural landscape"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Matches Image Request */}
      <section className="py-24 bg-[#fbf9f1] dark:bg-gray-950 font-sans relative overflow-hidden">
        {/* Subtle Decorative elements similar to the style */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-100/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

            {/* Left Content */}
            <div className="relative">
              <span className="text-accent-500 font-bold mb-4 block text-lg font-serif">
                {t("home.testimonials.label")}
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white mb-8 leading-[1.15]">
                {t("home.testimonials.title_pre")}<span className="text-[#16a34a]">Krushi</span><span className="text-[#fbb72c]">Kranti</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed text-lg max-w-lg">
                {t("home.testimonials.desc")}
              </p>

              <Link
                to="/testimonials"
                className="inline-flex items-center justify-center bg-[#56b54a] hover:bg-green-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-green-600/20 transition-all hover:-translate-y-1"
              >
                {t("home.testimonials.view_all")}
              </Link>
            </div>

            {/* Right Card Column */}
            <div className="relative pt-12 lg:pt-0">
              {/* Testimonial Card with Animation */}
              <div className="relative h-[450px] md:h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-50 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
                      "{testimonials[activeTestimonial].text}"
                    </p>

                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-0.5">{testimonials[activeTestimonial].name}</h4>
                        <p className="text-[#56b54a] font-bold text-xs uppercase tracking-[0.15em] mb-2">{testimonials[activeTestimonial].role}</p>
                        <div className="flex gap-1 text-yellow-500">
                          {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                            <FaStar key={i} size={14} />
                          ))}
                        </div>
                      </div>

                      {/* Circular Avatar with dashed border */}
                      <div className="relative group">
                        <div className="w-24 h-24 p-1.5 rounded-full border-2 border-dashed border-yellow-500 flex items-center justify-center transition-transform group-hover:rotate-12">
                          <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 ring-4 ring-white dark:ring-gray-800">
                            <img
                              src={testimonials[activeTestimonial].image}
                              alt={testimonials[activeTestimonial].name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        {/* Small green floating circle */}
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[#56b54a] border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg">
                          <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Arrows - Left of Card */}
              <div className="absolute left-0 top-1/2 -track-x-12 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
                <button
                  onClick={prevTestimonial}
                  className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-50 transition-all border border-slate-100 dark:border-slate-700 hover:scale-110 active:scale-95"
                >
                  <FaChevronUp size={18} />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-50 transition-all border border-slate-100 dark:border-slate-700 hover:scale-110 active:scale-95"
                >
                  <FaChevronDown size={18} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section - Based on Image */}
      <section className="py-24 bg-white dark:bg-gray-900 font-sans overflow-hidden">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Decorative Image and Call Card */}
            <div className="relative">
              {/* Green background Frame Image instead of block+SVGs */}
              <div className="absolute top-0 left-0 w-4/5 h-full rounded-3xl -ml-12 lg:-ml-20 overflow-hidden shadow-xl">
                <img
                  src={faqsection}
                  alt="Decorative Frame"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Main Image */}
              <div className="relative z-10 pl-8 pt-12 pb-12 pr-4 md:pl-20">
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800 aspect-[4/5] max-w-[420px] transition-transform hover:scale-[1.01]">
                  <img
                    src={faqimg}
                    alt="Farmer with crops"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Yellow Call Card Overlay */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-[320px]">
                  <div className="bg-[#fbbf24] p-6 lg:p-8 rounded-[2.5rem] shadow-2xl text-center border-4 border-white dark:border-gray-800">
                    <span className="text-white font-serif italic text-base mb-1 block">{t("home.faq.call_us")}</span>
                    <h4 className="text-white text-2xl lg:text-3xl font-black tabular-nums tracking-wider leading-none">666 888 0000</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: FAQ Content */}
            <div className="relative pt-10">
              <span className="text-accent-500 font-bold mb-4 block text-lg font-serif">
                {t("home.faq.label")}
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white mb-10 leading-[1.15]">
                {t("home.faq.title")}
              </h2>

              {/* FAQ Accordion List - Mirroring Image Style */}
              <div className="space-y-4 max-w-xl">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="group">
                    <div
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className={`flex items-center justify-between p-7 rounded-[1.8rem] transition-all duration-300 cursor-pointer ${activeFaq === idx
                        ? "bg-[#f4f2ea] text-slate-900 dark:bg-gray-800 dark:text-gray-100 shadow-lg shadow-black/5"
                        : "bg-[#f4f2ea]/60 text-slate-900 dark:bg-gray-800/40 dark:text-gray-100 hover:bg-gray-100 hover:text-slate-900 dark:hover:bg-gray-700 dark:hover:text-white"
                        }`}
                    >
                      <span className="text-xl font-bold text-slate-900 dark:text-gray-100 group-hover:text-slate-900 dark:group-hover:text-white transition-colors line-clamp-1 pr-4">
                        {faq.q}
                      </span>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-green-500 text-white shrink-0 shadow-md transition-all duration-300 ${activeFaq === idx ? "bg-green-600 rotate-90 scale-105" : "group-hover:bg-green-600"
                        }`}>
                        <FaChevronRight size={18} />
                      </div>
                    </div>

                    {/* Animated Answer Expansion */}
                    <AnimatePresence>
                      {activeFaq === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: "circOut" }}
                          className="overflow-hidden"
                        >
                          <div className="p-8 pb-10 text-slate-500 dark:text-slate-400 leading-relaxed font-semibold md:text-lg border-x-[12px] border-transparent">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA - Final simple push */}
      <section className="py-20 bg-primary-600 text-white text-center font-sans">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-4 font-sans">{t("home.ready_started")}</h2>
          <p className="text-primary-50 mb-8 max-w-xl mx-auto">
            {t("home.join_thousands")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-accent-400 text-slate-900 font-bold py-3 px-10 rounded-lg"
            >
              {t("auth.create_account")}
            </Link>
            <Link
              to="/products"
              className="border border-white text-white font-bold py-3 px-10 rounded-lg"
            >
              {t("home.browse_products")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
