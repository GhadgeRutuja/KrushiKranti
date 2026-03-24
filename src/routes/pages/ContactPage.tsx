import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { contactService } from "../../services/contactService";

export function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: "✉",
      label: t("contact.email_label"),
      value: t("contact.email"),
      href: `mailto:${t("contact.email")}`,
    },
    {
      icon: "📞",
      label: t("contact.phone_label"),
      value: t("contact.phone"),
      href: `tel:${t("contact.phone").replace(/\s/g, "")}`,
    },
    {
      icon: "📍",
      label: t("contact.address_label"),
      value: t("contact.address"),
      href: null,
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      await contactService.submitContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      toast.success("Message sent successfully");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error((error as Error).message || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950">
      {/* Hero Banner - Full Width */}
      <section className="relative bg-[#f7f5ef] dark:bg-gray-950 overflow-hidden border-b border-slate-200/60 dark:border-slate-800">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[40%] h-full bg-green-100/30 dark:bg-green-900/10 skew-x-[-12deg] translate-x-12 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 lg:py-24 relative z-10">
          <div className="max-w-3xl text-center md:text-left">
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
              {t("contact.hero_title_1")} <span className="text-[#16a34a]">{t("contact.hero_grow")}</span> {t("contact.hero_title_2")} <br className="hidden lg:block" />
              {t("contact.hero_title_3")} <span className="text-[#fbb72c]">{t("contact.hero_touch")}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg lg:text-xl font-medium max-w-xl leading-relaxed">
              {t("contact.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 grid lg:grid-cols-3 gap-10">
        {/* Left: contact info */}
        <aside className="space-y-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {t("contact.info_heading")}
          </h2>
          {contactInfo.map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <span className="text-xl mt-0.5">{item.icon}</span>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-sm text-slate-700 dark:text-slate-300 font-medium hover:text-green-600 dark:hover:text-green-400"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.value}</p>
                )}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
              {t("contact.hours_label")}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("contact.hours")}</p>
          </div>
        </aside>

        {/* Right: form */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6">
            {t("contact.form_heading")}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  {t("contact.form.name")}
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ramesh Kumar"
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  {t("contact.form.email")}
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                {t("contact.form.subject")}
              </label>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-slate-900 dark:text-white outline-none"
              >
                <option value="">{t("contact.form.select_topic")}</option>
                <option value="support">{t("contact.form.topic_support")}</option>
                <option value="partnership">{t("contact.form.topic_partnership")}</option>
                <option value="farmer">{t("contact.form.topic_farmer")}</option>
                <option value="wholesale">{t("contact.form.topic_wholesale")}</option>
                <option value="other">{t("contact.form.topic_other")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                {t("contact.form.message")}
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                placeholder={t("contact.form.message_placeholder")}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
            >
              {submitting ? t("contact.form.sending") : t("contact.form.send")}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
