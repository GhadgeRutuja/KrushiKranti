import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">
              Krushi<span className="text-accent-400">Kranti</span>
            </h3>
            <p className="text-sm leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3 pt-2">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-slate-800 rounded text-slate-400 active:text-white transition-none">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">{t('footer.quick_links')}</h4>
            <ul className="space-y-3 text-sm font-medium">
              {[
                { to: '/products', label: t('common.products') },
                { to: '/about', label: t('common.about') },
                { to: '/contact', label: t('common.contact') },
                { to: '/faq', label: t('footer.faq') },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="active:text-primary-400 transition-none">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">{t('footer.for_business')}</h4>
            <ul className="space-y-3 text-sm font-medium">
              {[
                { to: '/register', label: t('home.become_seller') },
                { to: '/wholesale', label: t('footer.wholesale') },
                { to: '/partnerships', label: t('footer.partnerships') },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="active:text-primary-400 transition-none">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">{t('footer.contact_us')}</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary-500 shrink-0" />
                <span>Maharashtra, India</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-primary-500 shrink-0" />
                <span>+91 1234 567 890</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-primary-500 shrink-0" />
                <span>info@krushikranti.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            © {currentYear} KrushiKranti. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
            <Link to="/privacy" className="active:text-primary-400 transition-none">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="active:text-primary-400 transition-none">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
