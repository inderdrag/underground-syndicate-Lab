import React, { useState } from 'react';
import { pharmaPackConfig } from '../../config/pharmaPackData';
import { PharmaGameState, PharmaClient, PharmaNewsItem } from '../../types/pharma';
import { processClientDeal } from '../../services/pharmaEngine';
import {
  Building2,
  Users,
  Shield,
  Newspaper,
  DollarSign,
  Briefcase,
  AlertOctagon,
  HeartPulse,
  TrendingUp,
  UserCheck,
  Award
} from 'lucide-react';

interface PharmaFacadeViewProps {
  pharmaState: PharmaGameState;
  onUpdatePharmaState: (updater: (prev: PharmaGameState) => PharmaGameState) => void;
  onAddCash: (amount: number) => void;
  onAddHeat: (heat: number) => void;
  currentDay: number;
}

export const PharmaFacadeView: React.FC<PharmaFacadeViewProps> = ({
  pharmaState,
  onUpdatePharmaState,
  onAddCash,
  onAddHeat,
  currentDay
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'clients' | 'facade' | 'news' | 'bribes'>('clients');
  const [dealNotification, setDealNotification] = useState<string | null>(null);

  const handleSellToClient = (client: PharmaClient) => {
    // Find item matching client's preferred subgroup
    const item = pharmaPackConfig.items.find(i => i.subgroup === client.preferredSubgroup) || pharmaPackConfig.items[0];
    const available = pharmaState.inventory[item.id] || 0;

    if (available < 1) {
      setDealNotification(`Нет в наличии предмета подгруппы ${client.preferredSubgroup} (${item.name})!`);
      return;
    }

    const purity = pharmaState.purityStock[item.id] || item.basePurity;

    const dealResult = processClientDeal(client, item, purity, 1, currentDay);

    // Update state
    onUpdatePharmaState(prev => {
      const nextInv = { ...prev.inventory };
      nextInv[item.id] = Math.max(0, (nextInv[item.id] || 0) - 1);

      const nextNews = dealResult.newsItem
        ? [dealResult.newsItem, ...prev.newsFeed]
        : prev.newsFeed;

      return {
        ...prev,
        inventory: nextInv,
        newsFeed: nextNews
      };
    });

    onAddCash(dealResult.totalCashEarned);
    if (dealResult.overdoseTriggered) {
      onAddHeat(15);
    }

    setDealNotification(dealResult.clientMessage);
  };

  const handleLaunderMoney = () => {
    if (!pharmaState.facade.isUnlocked) return;
    const amountToLaunder = 500;
    onAddCash(amountToLaunder);
    onUpdatePharmaState(prev => ({
      ...prev,
      facade: {
        ...prev.facade,
        launderedCashToday: prev.facade.launderedCashToday + amountToLaunder
      }
    }));
    setDealNotification(`Успешно отмыто $${amountToLaunder} легальной выручки через Аптеку-Фасад!`);
  };

  const handleBribeCop = () => {
    onAddCash(-pharmaState.bribeStatus.copPrice);
    onAddHeat(-25);
    onUpdatePharmaState(prev => ({
      ...prev,
      bribeStatus: {
        ...prev.bribeStatus,
        corruptCopBribed: true,
        bribeExpiryDay: currentDay + 5
      }
    }));
    setDealNotification(`Подкуплен офицер полиции. Жар снижен на -25, иммунитет на 5 дней!`);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner & Facade Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/90 border border-purple-500/30 p-5 rounded-2xl backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-3xl shadow-inner">
            🏥
          </div>
          <div>
            <h2 className="text-2xl font-bold font-unbounded text-purple-400">Легальный Фасад & CRM Сбыта</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Сеть постоянных клиентов, отмыв денег через аптеку, взятки полиции и лента новостей
            </p>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('clients')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeSubTab === 'clients'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> CRM Клиенты
          </button>

          <button
            onClick={() => setActiveSubTab('facade')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeSubTab === 'facade'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" /> Аптека-Фасад
          </button>

          <button
            onClick={() => setActiveSubTab('bribes')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeSubTab === 'bribes'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" /> Коррупция & Копы
          </button>

          <button
            onClick={() => setActiveSubTab('news')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeSubTab === 'news'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Newspaper className="w-4 h-4" /> Новости ({pharmaState.newsFeed.length})
          </button>
        </div>
      </div>

      {dealNotification && (
        <div className="bg-purple-950/80 border border-purple-500/50 p-4 rounded-xl text-purple-200 text-xs font-bold flex items-center justify-between">
          <span>{dealNotification}</span>
          <button onClick={() => setDealNotification(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Sub-tab 1: Clients & Addiction CRM */}
      {activeSubTab === 'clients' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-unbounded">
            <Users className="w-5 h-5 text-purple-400" /> Профили Клиентов & Уровень Тяги (Craving)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pharmaState.clients.map(client => (
              <div key={client.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl">
                      {client.avatarIcon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100">{client.name}</h4>
                      <div className="text-xs text-purple-400 font-semibold capitalize">{client.type}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                      client.state === 'hospitalized'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {client.state === 'hospitalized' ? '🏥 В больнице' : '🟢 Активен'}
                  </span>
                </div>

                <div className="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Предпочтение:</span>
                    <span className="font-bold text-purple-300 capitalize">{client.preferredSubgroup}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Уровень тяги (Craving):</span>
                    <span className="font-bold text-amber-400">{client.cravingLevel}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Лояльность:</span>
                    <span className="font-bold text-emerald-400">{client.loyalty}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Кошелек:</span>
                    <span className="font-bold text-slate-200">${client.walletCash}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSellToClient(client)}
                  disabled={client.state === 'hospitalized'}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all"
                >
                  Продать Препарат
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Pharmacy Facade */}
      {activeSubTab === 'facade' && (
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold font-unbounded text-slate-100">{pharmaState.facade.name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Легальная аптечная вывеска для отмывания наличности и снижения внимания полиции
              </p>
            </div>

            <button
              onClick={handleLaunderMoney}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" /> Отмыть $500
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Лимит отмыва в день</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">${pharmaState.facade.dailyLaunderLimit}</div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Отмыто сегодня</div>
              <div className="text-lg font-bold text-cyan-400 mt-1">${pharmaState.facade.launderedCashToday}</div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Риск проверки Минздрава</div>
              <div className="text-lg font-bold text-amber-400 mt-1">{pharmaState.facade.inspectionRisk}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Corrupt Cops & Bribes */}
      {activeSubTab === 'bribes' && (
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold font-unbounded text-slate-100">Коррумпированный Капитан</h3>
              <p className="text-xs text-slate-400 mt-1">Оплата регулярного «крышевания» для сброса внимания полиции</p>
            </div>

            <button
              onClick={handleBribeCop}
              className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-600/30 transition-all"
            >
              Дать Взятку (${pharmaState.bribeStatus.copPrice})
            </button>
          </div>
        </div>
      )}

      {/* Sub-tab 4: News Feed */}
      {activeSubTab === 'news' && (
        <div className="space-y-3">
          {pharmaState.newsFeed.map(news => (
            <div key={news.id} className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-100 text-sm">{news.title}</h4>
                <span className="text-[11px] font-mono text-purple-400">День {news.day}</span>
              </div>
              <p className="text-xs text-slate-400">{news.body}</p>
              <div className="text-xs font-semibold text-emerald-400 mt-2">Эффект: {news.impactText}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
