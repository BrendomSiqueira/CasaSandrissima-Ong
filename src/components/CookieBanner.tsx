import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Cookie, Check, Info } from 'lucide-react';
import TactileButton from './TactileButton';

const STORAGE_KEY = 'casa_sandrissima_cookie_consent_v1';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  // Cookie preference categories
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [functionalEnabled, setFunctionalEnabled] = useState(true);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Small delay for natural entrance on initial page load
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsVisible(true);
    }

    const handleOpenOptionsEvent = () => {
      setIsVisible(false);
      setIsOptionsModalOpen(true);
    };

    const handleOpenBannerEvent = () => {
      setIsVisible(true);
    };

    window.addEventListener('open-cookie-preferences', handleOpenOptionsEvent);
    window.addEventListener('open-cookie-banner', handleOpenBannerEvent);
    return () => {
      window.removeEventListener('open-cookie-preferences', handleOpenOptionsEvent);
      window.removeEventListener('open-cookie-banner', handleOpenBannerEvent);
    };
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        accepted: true,
        necessary: true,
        analytics: true,
        functional: true,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
    setIsOptionsModalOpen(false);
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        accepted: true,
        necessary: true,
        analytics: analyticsEnabled,
        functional: functionalEnabled,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
    setIsOptionsModalOpen(false);
  };

  return (
    <>
      {/* Floating Cookie Notification Card */}
      <AnimatePresence>
        {isVisible && (
          <motion.aside
            aria-label="Consentimento de Cookies"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center max-w-[calc(100vw-2rem)]"
            id="cookie-consent-notification"
          >
            <div
              className="[--shadow:rgba(60,64,67,0.3)_0_1px_2px_0,rgba(60,64,67,0.15)_0_2px_6px_2px] w-full h-auto rounded-2xl bg-white [box-shadow:var(--shadow)] max-w-[300px] border border-stone-200/80 overflow-visible"
              id="cookie-consent-card"
            >
              <div className="flex flex-col items-center justify-between pt-9 px-6 pb-6 relative">
                
                {/* SVG Cookie Illustration with bite */}
                <span className="relative mx-auto -mt-16 mb-8 drop-shadow-sm pointer-events-none select-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    height="46"
                    width="65"
                    aria-hidden="true"
                  >
                    <path
                      stroke="#000"
                      fill="#EAB789"
                      d="M49.157 15.69L44.58.655l-12.422 1.96L21.044.654l-8.499 2.615-6.538 5.23-4.576 9.153v11.114l4.576 8.5 7.846 5.23 10.46 1.96 7.845-2.614 9.153 2.615 11.768-2.615 7.846-7.846 1.96-5.884.655-7.191-7.846-1.308-6.537-3.922z"
                    />
                    <path
                      fill="#9C6750"
                      d="M32.286 3.749c-6.94 3.65-11.69 11.053-11.69 19.591 0 8.137 4.313 15.242 10.724 19.052a20.513 20.513 0 01-8.723 1.937c-11.598 0-21-9.626-21-21.5 0-11.875 9.402-21.5 21-21.5 3.495 0 6.79.874 9.689 2.42z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    />
                    <path
                      fill="#634647"
                      d="M64.472 20.305a.954.954 0 00-1.172-.824 4.508 4.508 0 01-3.958-.934.953.953 0 00-1.076-.11c-.46.252-.977.383-1.502.382a3.154 3.154 0 01-2.97-2.11.954.954 0 00-.833-.634 4.54 4.54 0 01-4.205-4.507c.002-.23.022-.46.06-.687a.952.952 0 00-.213-.767 3.497 3.497 0 01-.614-3.5.953.953 0 00-.382-1.138 3.522 3.522 0 01-1.5-3.992.951.951 0 00-.762-1.227A22.611 22.611 0 0032.3 2.16 22.41 22.41 0 0022.657.001a22.654 22.654 0 109.648 43.15 22.644 22.644 0 0032.167-22.847zM22.657 43.4a20.746 20.746 0 110-41.493c2.566-.004 5.11.473 7.501 1.407a22.64 22.64 0 00.003 38.682 20.6 20.6 0 01-7.504 1.404zm19.286 0a20.746 20.746 0 112.131-41.384 5.417 5.417 0 001.918 4.635 5.346 5.346 0 00-.133 1.182A5.441 5.441 0 0046.879 11a5.804 5.804 0 00-.028.568 6.456 6.456 0 005.38 6.345 5.053 5.053 0 006.378 2.472 6.412 6.412 0 004.05 1.12 20.768 20.768 0 01-20.716 21.897z"
                    />
                    <path
                      fill="#644647"
                      d="M54.962 34.3a17.719 17.719 0 01-2.602 2.378.954.954 0 001.14 1.53 19.637 19.637 0 002.884-2.634.955.955 0 00-1.422-1.274z"
                    />
                    <path
                      strokeWidth="1.8"
                      stroke="#644647"
                      fill="#845556"
                      d="M44.5 32.829c-.512 0-1.574.215-2 .5-.426.284-.342.263-.537.736a2.59 2.59 0 104.98.99c0-.686-.458-1.241-.943-1.726-.485-.486-.814-.5-1.5-.5zm-30.916-2.5c-.296 0-.912.134-1.159.311-.246.177-.197.164-.31.459a1.725 1.725 0 00-.086.932c.058.312.2.6.41.825.21.226.477.38.768.442.291.062.593.03.867-.092s.508-.329.673-.594a1.7 1.7 0 00.253-.896c0-.428-.266-.774-.547-1.076-.281-.302-.471-.31-.869-.311zm17.805-11.375c-.143-.492-.647-1.451-1.04-1.78-.392-.33-.348-.255-.857-.31a2.588 2.588 0 10.441 5.06c.66-.194 1.064-.788 1.395-1.39.33-.601.252-.92.06-1.58zm-22 2c-.143-.492-.647-1.451-1.04-1.78-.391-.33-.347-.255-.856-.31a2.589 2.589 0 10.44 5.06c.66-.194 1.064-.788 1.395-1.39.33-.601.252-.92.06-1.58zM38.112 7.329c-.395 0-1.216.179-1.545.415-.328.236-.263.218-.415.611-.151.393-.19.826-.114 1.243.078.417.268.8.548 1.1.28.301.636.506 1.024.59.388.082.79.04 1.155-.123.366-.163.678-.438.898-.792.22-.354.337-.77.337-1.195 0-.57-.354-1.031-.73-1.434-.374-.403-.628-.415-1.158-.415zm-19.123.703c.023-.296-.062-.92-.219-1.18-.157-.26-.148-.21-.432-.347a1.726 1.726 0 00-.922-.159 1.654 1.654 0 00-.856.344 1.471 1.471 0 00-.501.73c-.085.285-.077.589.023.872.1.282.287.532.538.718a1.7 1.7 0 00.873.323c.427.033.793-.204 1.116-.46.324-.256.347-.445.38-.841z"
                    />
                    <path
                      fill="#634647"
                      d="M15.027 15.605a.954.954 0 00-1.553 1.108l1.332 1.863a.955.955 0 001.705-.77.955.955 0 00-.153-.34l-1.331-1.861z"
                    />
                    <path
                      fill="#644647"
                      d="M43.31 23.21a.954.954 0 101.553-1.11l-1.266-1.772a.954.954 0 10-1.552 1.11l1.266 1.772z"
                    />
                    <path
                      fill="#634647"
                      d="M19.672 35.374a.954.954 0 00-.954.953v2.363a.954.954 0 001.907 0v-2.362a.954.954 0 00-.953-.954z"
                    />
                    <path
                      fill="#644647"
                      d="M33.129 29.18l-2.803 1.065a.953.953 0 00-.053 1.764.957.957 0 00.73.022l2.803-1.065a.953.953 0 00-.677-1.783v-.003zm24.373-3.628l-2.167.823a.956.956 0 00-.054 1.764.954.954 0 00.73.021l2.169-.823a.954.954 0 10-.678-1.784v-.001z"
                    />
                  </svg>
                </span>

                {/* Heading */}
                <h5 className="text-sm font-semibold mb-2 text-left mr-auto text-zinc-700" id="cookie-heading">
                  Sua privacidade é importante para nós
                </h5>

                {/* Description Body */}
                <p className="w-full mb-4 text-xs sm:text-sm text-justify text-zinc-600 leading-relaxed font-sans">
                  Processamos suas informações para aprimorar nossos serviços, apoiar nossas campanhas comunitárias e oferecer uma navegação segura.
                  <br />
                  Para mais detalhes, consulte nossa{' '}
                  <button
                    type="button"
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="cursor-pointer font-semibold transition-colors hover:text-[#634647] underline underline-offset-2 text-[#634647]"
                  >
                    Política de Privacidade
                  </button>
                  .
                </p>

                {/* Action Buttons: More Options + Accept */}
                <div className="w-full flex items-center justify-between mt-1 pt-2 gap-2">
                  <button
                    type="button"
                    id="btn-cookie-more-options"
                    onClick={() => setIsOptionsModalOpen(true)}
                    className="text-xs mr-auto text-zinc-600 cursor-pointer font-semibold transition-colors hover:text-[#634647] hover:underline underline-offset-2"
                  >
                    Mais Opções
                  </button>

                  <TactileButton
                    type="button"
                    id="btn-cookie-accept"
                    onClick={handleAcceptAll}
                    variant="primary"
                    size="sm"
                    icon={<Check className="h-3.5 w-3.5" />}
                  >
                    Aceitar
                  </TactileButton>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {isPrivacyModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsPrivacyModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 text-left my-8 max-h-[85vh] flex flex-col"
            >
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-4 text-emerald-800">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-stone-900">Política de Privacidade & Cookies</h3>
              </div>

              <div className="overflow-y-auto pr-2 space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                <p>
                  A <strong>Casa Sandríssima</strong> tem o compromisso inequívoco com a transparência, privacidade e proteção dos dados de todos os seus associados, alunos, voluntários e doadores, em conformidade com a <em>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</em>.
                </p>
                
                <div>
                  <h4 className="font-bold text-stone-800 text-sm mb-1">1. Finalidade do Uso de Dados e Cookies</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Garantir o funcionamento seguro da autenticação e sessão no Portal e SGE.</li>
                    <li>Registrar presenças e matrículas em oficinas com total proteção de imagem de crianças e jovens.</li>
                    <li>Gerar comprovantes nominais instantâneos de doações para fins de prestação de contas transparente.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-stone-800 text-sm mb-1">2. Não Compartilhamento com Terceiros</h4>
                  <p>
                    Seus dados nunca são comercializados ou compartilhados com fins publicitários invasivos. Todos os dados permanecem confinados à infraestrutura segura do projeto social.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-stone-800 text-sm mb-1">3. Controle dos Seus Direitos</h4>
                  <p>
                    Você pode a qualquer momento revogar consentimentos, solicitar a exclusão ou exportação de seus registros através do e-mail <code>casandrissima@gmail.com</code>.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
                <TactileButton
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(false)}
                  variant="primary"
                  size="md"
                >
                  Entendi e Fechar
                </TactileButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* More Options / Cookie Preferences Modal */}
      <AnimatePresence>
        {isOptionsModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOptionsModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 text-left my-8"
            >
              <button
                type="button"
                onClick={() => setIsOptionsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-2 text-stone-900">
                <Cookie className="h-6 w-6 text-[#634647]" />
                <h3 className="text-xl font-bold text-stone-900">Preferências de Cookies</h3>
              </div>
              <p className="text-xs text-stone-500 mb-5">
                Personalize quais categorias de cookies e dados de navegação você autoriza a Casa Sandríssima a utilizar.
              </p>

              <div className="space-y-4">
                
                {/* Category 1: Essential (Mandatory) */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900">Essenciais & Segurança</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Sempre Ativo
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Necessários para login autenticado, segurança de sessão e proteção contra requisições maliciosas.
                    </p>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Category 2: Functional / Preferences */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-sm font-bold text-stone-900 block">Funcionalidades & Preferências</span>
                    <p className="text-xs text-stone-600 mt-1">
                      Lembram suas configurações locais, abas ativas recentes e filtros de busca da galeria.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={functionalEnabled}
                      onChange={(e) => setFunctionalEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Category 3: Analytics & Community Reach */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-sm font-bold text-stone-900 block">Métricas de Impacto Social</span>
                    <p className="text-xs text-stone-600 mt-1">
                      Ajudam a quantificar anonimamente o alcance de campanhas e engajamento comunitário da ONG.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

              </div>

              {/* Preferences Modal Actions */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                <TactileButton
                  type="button"
                  onClick={handleSavePreferences}
                  variant="secondary"
                  size="sm"
                >
                  Salvar Escolhas
                </TactileButton>

                <TactileButton
                  type="button"
                  onClick={handleAcceptAll}
                  variant="primary"
                  size="sm"
                  icon={<Check className="h-3.5 w-3.5" />}
                >
                  Aceitar Todos
                </TactileButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
