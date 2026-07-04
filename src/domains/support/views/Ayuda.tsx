import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CONTACT_INFO, FAQ_ITEMS, type FaqItem } from '../data/faq.data';

const FAQ_CATEGORY_KEYS: FaqItem['category'][] = ['general', 'dispositivo', 'alertas', 'cuidadores'];

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.339 1.84.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    className={`flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

function FaqAccordionItem({
  id,
  isOpen,
  onToggle,
}: {
  id: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        isOpen
          ? 'border-[#16333F]/20 bg-white shadow-[0_4px_20px_-10px_rgba(22,51,63,0.12)]'
          : 'border-gray-100 bg-white hover:border-gray-200'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span
          className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            isOpen ? 'bg-[#16333F] text-white' : 'bg-[#F9F7F1] text-[#16333F]'
          }`}
        >
          <HelpIcon />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-bold text-[#16333F] leading-snug pr-2">
            {t(`faq.items.${id}.question`)}
          </span>
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 pl-[4.25rem] text-sm text-gray-600 leading-relaxed">
            {t(`faq.items.${id}.answer`)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Ayuda() {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);
  const [activeCategory, setActiveCategory] = useState<FaqItem['category'] | 'all'>('all');

  const filteredFaqs = useMemo(() => {
    if (activeCategory === 'all') return FAQ_ITEMS;
    return FAQ_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const handleToggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-[#16333F] mb-2">{t('ayuda.title')}</h1>
        <p className="text-sm text-gray-500">{t('ayuda.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-[#16333F] to-[#2a4a58] rounded-3xl p-8 text-white shadow-[0_8px_30px_-10px_rgba(22,51,63,0.35)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-5">
                <HelpIcon />
              </div>
              <h2 className="text-xl font-bold mb-2">{t('ayuda.needMoreHelp')}</h2>
              <p className="text-sm text-white/70 leading-relaxed mb-6">
                {t('ayuda.needMoreHelpDescription')}
              </p>

              <div className="space-y-3">
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="flex items-center gap-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl px-4 py-3.5 transition-colors group"
                >
                  <span className="w-10 h-10 rounded-xl bg-[#FDECA6] text-[#16333F] flex items-center justify-center flex-shrink-0">
                    <MailIcon />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-0.5">
                      {t('ayuda.emailLabel')}
                    </p>
                    <p className="text-sm font-semibold truncate group-hover:underline">
                      {t('ayuda.email')}
                    </p>
                  </div>
                </a>

                <a
                  href={`tel:${CONTACT_INFO.phoneHref}`}
                  className="flex items-center gap-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl px-4 py-3.5 transition-colors group"
                >
                  <span className="w-10 h-10 rounded-xl bg-[#FDECA6] text-[#16333F] flex items-center justify-center flex-shrink-0">
                    <PhoneIcon />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-0.5">
                      {t('ayuda.phoneLabel')}
                    </p>
                    <p className="text-sm font-semibold group-hover:underline">{t('ayuda.phone')}</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[#F9F7F1] border border-gray-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-[#16333F] mb-2">{t('ayuda.supportHoursTitle')}</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('ayuda.supportHours')}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#16333F]">{t('ayuda.faqTitle')}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? t('common.question') : t('common.questions')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-[#16333F] text-white'
                    : 'bg-[#F9F7F1] text-gray-500 hover:text-[#16333F]'
                }`}
              >
                {t('common.all')}
              </button>
              {FAQ_CATEGORY_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCategory(key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    activeCategory === key
                      ? 'bg-[#16333F] text-white'
                      : 'bg-[#F9F7F1] text-gray-500 hover:text-[#16333F]'
                  }`}
                >
                  {t(`faq.categories.${key}`)}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((item) => (
                <FaqAccordionItem
                  key={item.id}
                  id={item.id}
                  isOpen={openId === item.id}
                  onToggle={() => handleToggle(item.id)}
                />
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-8">
                {t('ayuda.noQuestionsInCategory')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
