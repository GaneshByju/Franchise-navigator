import React, { useState } from 'react';
import { FranchiseListing, Territory } from '../../types';
import { api } from '../../services/api';
import {
  MapPin,
  PlusCircle,
  CheckCircle2,
  ShieldCheck,
  Building,
  Lock,
  Compass
} from 'lucide-react';

interface TerritoryManagerProps {
  listings: FranchiseListing[];
}

export const TerritoryManager: React.FC<TerritoryManagerProps> = ({ listings }) => {
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number>(listings[0]?.id || 1);
  const activeListing = listings.find((l) => l.id === Number(selectedFranchiseId)) || listings[0];
  const territories = activeListing?.territories || [];

  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [territoryName, setTerritoryName] = useState('');
  const [isExclusive, setIsExclusive] = useState(true);
  const [adding, setAdding] = useState(false);

  const handleAddTerritory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !territoryName) return;
    setAdding(true);

    try {
      const res = await api.addTerritory(selectedFranchiseId, {
        country: 'India',
        state,
        city,
        territory_name: territoryName,
        is_exclusive: isExclusive ? 1 : 0,
        status: 'Available',
      });

      if (res.success) {
        alert('Territory successfully added to brand roster!');
        setCity('');
        setTerritoryName('');
        // Refresh local listing territories
        if (activeListing) {
          activeListing.territories = [...(activeListing.territories || []), res.data];
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add territory');
    } finally {
      setAdding(false);
    }
  };

  if (listings.length === 0) {
    return (
      <div className="space-y-6 font-sans">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Territory Exclusivity &amp; Expansion Zone Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define protected geographic zones, configure exclusivity radiuses, and track territory allocation.
          </p>
        </div>

        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-base">
            Listing Required to Manage Territories
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Please publish your first commercial franchise listing to configure pin zones, exclusive territory radiuses, and state allocations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Territory Exclusivity & Expansion Zone Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Define protected geographic zones, configure exclusivity radiuses, and track territory allocation states across cities.
        </p>
      </div>

      {/* Select Brand */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm flex items-center justify-center">
            {activeListing?.name.charAt(0)}
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Managing Territories For:
            </label>
            <select
              value={selectedFranchiseId}
              onChange={(e) => setSelectedFranchiseId(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-900 text-sm focus:outline-none cursor-pointer"
            >
              {listings.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total Zones: <strong className="text-slate-900">{territories.length}</strong>
        </div>
      </div>

      {/* 2 COLUMNS: ADD TERRITORY FORM & EXISTING TERRITORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ADD TERRITORY FORM (5 COLS) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            Add New Expansion Zone
          </h3>

          <form onSubmit={handleAddTerritory} className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Pune"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Zone / Radius Name *</label>
              <input
                type="text"
                required
                value={territoryName}
                onChange={(e) => setTerritoryName(e.target.value)}
                placeholder="e.g. Koregaon Park & Kalyani Nagar Zone"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-indigo-600"
              />
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isExclusive}
                onChange={(e) => setIsExclusive(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-slate-700">Grant exclusive territory lock to single franchisee</span>
            </label>

            <button
              type="submit"
              disabled={adding}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {adding ? (
                <span>Registering Zone...</span>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Register Territory Zone</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* EXISTING TERRITORIES LIST (7 COLS) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Configured Territory Zones ({territories.length})
          </h3>

          {territories.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No specific territory zones defined yet. Add your first zone on the left!
            </div>
          ) : (
            <div className="space-y-3">
              {territories.map((t) => (
                <div
                  key={t.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{t.territory_name}</span>
                      {t.is_exclusive === 1 && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Exclusive
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {t.city}, {t.state} ({t.country})
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    t.status === 'Available'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : t.status === 'Reserved'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
