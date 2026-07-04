import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInicio } from '../hooks/useInicio';
import type { QuickAccessProfile } from '../../iam/models/user.model';

const ProfileCard = ({ profile }: { profile: QuickAccessProfile }) => {
  const { t } = useTranslation();
  const isPrincipal = profile.role === t('roles.primaryCaregiver');
  const badgeClasses = isPrincipal
    ? 'bg-[#FDF5D3] text-[#DCA646]'
    : 'bg-gray-100 text-gray-500';

  return (
    <button className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_-5px_rgba(0,0,0,0.08)] transition-all w-full text-left group">
      <div>
        <h3 className="text-[#16333F] font-bold text-lg">{profile.name}</h3>
        <span className={`inline-block mt-1 text-[10px] font-bold px-3 py-1 rounded-full ${badgeClasses}`}>
          {profile.role}
        </span>
      </div>
      <div className="text-gray-300 group-hover:text-[#16333F] transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </button>
  );
};

const AddProfileCard = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className="border-2 border-dashed border-gray-300 rounded-2xl p-5 flex flex-col items-center justify-center text-gray-400 hover:text-[#16333F] hover:border-[#16333F] hover:bg-white/50 transition-all w-full h-full min-h-[90px]"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-1"><path d="M12 5v14M5 12h14"/></svg>
      <span className="text-sm font-semibold">{t('inicio.addProfile')}</span>
    </button>
  );
};

const DonutChart = ({ realFalls, totalEvents }: { realFalls: number, falsePositives: number, totalEvents: number }) => {
  const { t } = useTranslation();
  const realPercentage = totalEvents > 0 ? (realFalls / totalEvents) * 100 : 0;

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
        <path
          className="text-[#FCE07B]"
          strokeWidth="4"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="text-[#DCA646]"
          strokeWidth="4"
          strokeDasharray={`${realPercentage}, 100`}
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-black text-[#16333F] leading-none">{totalEvents}</span>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">{t('inicio.totalEvents')}</span>
      </div>
    </div>
  );
};

export default function Inicio() {
  const { t } = useTranslation();
  const { data, isLoading } = useInicio();
  const navigate = useNavigate();

  if (isLoading || !data) {
    return (
      <div className="h-full flex items-center justify-center text-[#16333F]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#89BAAF] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-semibold">{t('inicio.loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-10">

      <section>
        <h2 className="text-[#16333F] font-bold text-lg mb-5">{t('inicio.quickAccess')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.profiles.map(profile => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
          <AddProfileCard
            onClick={() => navigate('/abuelitos', { state: { openRegisterModal: true } })}
          />
        </div>
      </section>

      <section>
        <h2 className="text-[#16333F] font-bold text-lg mb-5">{t('inicio.securityStats', { month: data.stats.month })}</h2>
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center gap-12 max-w-[800px]">

          <div className="flex-shrink-0">
            <DonutChart
              realFalls={data.stats.realFalls}
              falsePositives={data.stats.falsePositives}
              totalEvents={data.stats.totalEvents}
            />
          </div>

          <div className="flex-1 space-y-8">
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#DCA646] mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-[#16333F] font-bold text-sm">{t('inicio.realFalls')}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{t('inicio.realFallsHint')}</p>
                  </div>
                </div>
                <span className="text-[#DCA646] font-bold text-xl">{data.stats.realFalls}</span>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FCE07B] mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-[#16333F] font-bold text-sm">{t('inicio.falsePositives')}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{t('inicio.falsePositivesHint')}</p>
                  </div>
                </div>
                <span className="text-[#FCE07B] font-bold text-xl">{data.stats.falsePositives}</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 leading-relaxed pr-8">
                {data.stats.summaryMessage}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
