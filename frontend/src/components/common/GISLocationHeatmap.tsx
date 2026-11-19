import React, { useState } from 'react';
import { MapPin, Navigation, TrendingUp, Users, Store, ShieldCheck, AlertCircle, Layers } from 'lucide-react';
import { FranchiseListing } from '../../types';

interface GISLocationHeatmapProps {
  franchise?: FranchiseListing | null;
  selectedCity?: string;
  onSelectZone?: (zoneName: string) => void;
}

interface ZoneDetail {
  id: string;
  name: string;
  footfallScore: number;
  incomeTier: string;
  competitorCount: number;
  demandRatio: string;
  avgRentSqFt: number;
  status: 'Available' | 'Reserved' | 'Sold';
  x: number;
  y: number;
}

const CITY_DATA: Record<string, ZoneDetail[]> = {
  Bangalore: [
    { id: 'b1', name: 'Koramangala 5th Block', footfallScore: 94, incomeTier: 'Upper Middle & Tech', competitorCount: 3, demandRatio: '4.8x', avgRentSqFt: 180, status: 'Available', x: 25, y: 35 },
    { id: 'b2', name: 'Indiranagar 100ft Road', footfallScore: 96, incomeTier: 'High / Premium', competitorCount: 5, demandRatio: '5.2x', avgRentSqFt: 220, status: 'Reserved', x: 45, y: 25 },
    { id: 'b3', name: 'Whitefield IT Corridor', footfallScore: 88, incomeTier: 'Corporate Tech Professionals', competitorCount: 2, demandRatio: '4.1x', avgRentSqFt: 140, status: 'Available', x: 75, y: 40 },
    { id: 'b4', name: 'HSR Layout Sector 1', footfallScore: 91, incomeTier: 'Young Startups & Families', competitorCount: 4, demandRatio: '4.5x', avgRentSqFt: 160, status: 'Available', x: 35, y: 65 },
    { id: 'b5', name: 'Electronic City Phase 1', footfallScore: 82, incomeTier: 'Tech Employees', competitorCount: 1, demandRatio: '3.6x', avgRentSqFt: 110, status: 'Available', x: 60, y: 75 },
    { id: 'b6', name: 'Jayanagar 4th Block', footfallScore: 89, incomeTier: 'Established Residential', competitorCount: 4, demandRatio: '3.9x', avgRentSqFt: 150, status: 'Sold', x: 20, y: 55 },
  ],
  Mumbai: [
    { id: 'm1', name: 'Bandra West (Linking Rd)', footfallScore: 98, incomeTier: 'Ultra Premium & HNIs', competitorCount: 6, demandRatio: '5.5x', avgRentSqFt: 350, status: 'Reserved', x: 30, y: 30 },
    { id: 'm2', name: 'Andheri West (Lokhandwala)', footfallScore: 92, incomeTier: 'Upper Middle Class', competitorCount: 4, demandRatio: '4.4x', avgRentSqFt: 240, status: 'Available', x: 40, y: 20 },
    { id: 'm3', name: 'Lower Parel (BKC Hub)', footfallScore: 95, incomeTier: 'Corporate Executives', competitorCount: 5, demandRatio: '5.0x', avgRentSqFt: 310, status: 'Available', x: 35, y: 55 },
    { id: 'm4', name: 'Powai Hiranandani', footfallScore: 89, incomeTier: 'Tech & Modern Gated', competitorCount: 2, demandRatio: '4.0x', avgRentSqFt: 210, status: 'Available', x: 65, y: 35 },
  ],
  Delhi: [
    { id: 'd1', name: 'Connaught Place Inner Circle', footfallScore: 97, incomeTier: 'High Commerce & Tourists', competitorCount: 5, demandRatio: '5.1x', avgRentSqFt: 320, status: 'Reserved', x: 45, y: 40 },
    { id: 'd2', name: 'South Extension II', footfallScore: 93, incomeTier: 'High Net Worth Families', competitorCount: 3, demandRatio: '4.6x', avgRentSqFt: 260, status: 'Available', x: 50, y: 60 },
    { id: 'd3', name: 'Cyber City (Gurugram)', footfallScore: 95, incomeTier: 'MNC Corporate Hub', competitorCount: 4, demandRatio: '4.9x', avgRentSqFt: 270, status: 'Available', x: 25, y: 75 },
    { id: 'd4', name: 'Noida Sector 18', footfallScore: 87, incomeTier: 'Students & Young Pros', competitorCount: 3, demandRatio: '3.8x', avgRentSqFt: 170, status: 'Available', x: 75, y: 55 },
  ],
  Hyderabad: [
    { id: 'h1', name: 'HITECH City / Madhapur', footfallScore: 95, incomeTier: 'IT Professionals & Expats', competitorCount: 4, demandRatio: '4.9x', avgRentSqFt: 190, status: 'Available', x: 35, y: 35 },
    { id: 'h2', name: 'Jubilee Hills Road No. 36', footfallScore: 97, incomeTier: 'High Net Worth / Ultra Luxury', competitorCount: 5, demandRatio: '5.3x', avgRentSqFt: 280, status: 'Reserved', x: 50, y: 45 },
    { id: 'h3', name: 'Gachibowli Financial District', footfallScore: 91, incomeTier: 'Corporate Tech Executives', competitorCount: 3, demandRatio: '4.4x', avgRentSqFt: 160, status: 'Available', x: 25, y: 65 },
  ],
  Chennai: [
    { id: 'c1', name: 'T. Nagar (Usman Road)', footfallScore: 99, incomeTier: 'Mass Retail & Shoppers', competitorCount: 6, demandRatio: '5.6x', avgRentSqFt: 290, status: 'Available', x: 40, y: 45 },
    { id: 'c2', name: 'Nungambakkam High Rd', footfallScore: 92, incomeTier: 'Upper Middle Class', competitorCount: 3, demandRatio: '4.5x', avgRentSqFt: 210, status: 'Available', x: 55, y: 30 },
    { id: 'c3', name: 'Velachery OMR IT Corridor', footfallScore: 90, incomeTier: 'Young IT Professionals', competitorCount: 4, demandRatio: '4.2x', avgRentSqFt: 150, status: 'Available', x: 65, y: 70 },
  ]
};

export const GISLocationHeatmap: React.FC<GISLocationHeatmapProps> = ({
  franchise,
  selectedCity: initialCity = 'Bangalore',
  onSelectZone
}) => {
  const [city, setCity] = useState<string>(initialCity);
  const [activeZone, setActiveZone] = useState<ZoneDetail | null>(CITY_DATA[initialCity]?.[0] || null);
  const [viewFilter, setViewFilter] = useState<'all' | 'available' | 'heatmap'>('all');

  const zones = CITY_DATA[city] || CITY_DATA['Bangalore'];

  const filteredZones = zones.filter(z => {
    if (viewFilter === 'available') return z.status === 'Available';
    return true;
  });

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const newZones = CITY_DATA[newCity] || CITY_DATA['Bangalore'];
    setActiveZone(newZones[0] || null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border-2 border-slate-200 overflow-hidden font-sans">
      {/* Header */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-600 rounded-xl text-white shadow-md">
              <MapPin className="w-6 h-6" />
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              GIS Location Intelligence & Territory Heatmap
            </h3>
          </div>
          <p className="text-sm text-slate-300 mt-1.5 font-medium">
            Real-time demographic demand analysis, foot traffic index, & exclusive territory availability
            {franchise ? ` for ${franchise.name}` : ''}
          </p>
        </div>

        {/* City Select Pills */}
        <div className="flex flex-wrap items-center bg-slate-800/90 p-1.5 rounded-xl border border-slate-700 gap-1">
          {Object.keys(CITY_DATA).map(cName => (
            <button
              key={cName}
              onClick={() => handleCityChange(cName)}
              className={`px-4 py-2 text-xs sm:text-sm font-black rounded-lg transition-all ${
                city === cName
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* Map Simulator Canvas (Left 7 Cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 bg-slate-950 relative min-h-[440px] flex flex-col justify-between overflow-hidden">
          
          {/* Background GIS Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#3b82f6 1.5px, transparent 1.5px), radial-gradient(#1e293b 1.5px, #020617 1.5px)`,
              backgroundSize: '28px 28px',
              backgroundPosition: '0 0, 14px 14px'
            }}
          />

          {/* Map Controls Top Bar */}
          <div className="relative z-10 flex justify-between items-center gap-2 mb-4">
            <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 font-semibold">
              <Navigation className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>Target Region: <strong className="text-white font-black">{city} Metro Zone</strong></span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setViewFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition ${viewFilter === 'all' ? 'bg-slate-700 text-white font-extrabold' : 'text-slate-400 hover:text-white'}`}
              >
                All Zones
              </button>
              <button
                onClick={() => setViewFilter('available')}
                className={`px-3 py-1.5 rounded-lg transition ${viewFilter === 'available' ? 'bg-emerald-600 text-white font-extrabold' : 'text-slate-400 hover:text-white'}`}
              >
                Available Only
              </button>
            </div>
          </div>

          {/* Interactive GIS Pins Canvas */}
          <div className="relative z-10 w-full h-[320px] sm:h-[350px] bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-inner">
            
            {/* Visual Simulated Roadmap Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 stroke-slate-500" strokeWidth="2" strokeDasharray="6 6">
              <line x1="10%" y1="30%" x2="90%" y2="70%" />
              <line x1="30%" y1="10%" x2="40%" y2="90%" />
              <line x1="70%" y1="15%" x2="25%" y2="80%" />
            </svg>

            {/* Zone Map Pins */}
            {filteredZones.map(zone => {
              const isSelected = activeZone?.id === zone.id;
              const statusColor = 
                zone.status === 'Available' ? 'bg-emerald-500 border-emerald-200 text-slate-950 font-black' :
                zone.status === 'Reserved' ? 'bg-amber-400 border-amber-200 text-slate-950 font-black' :
                'bg-rose-500 border-rose-200 text-white font-black';

              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    setActiveZone(zone);
                    if (onSelectZone) onSelectZone(zone.name);
                  }}
                  style={{ top: `${zone.y}%`, left: `${zone.x}%` }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group focus:outline-none ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing ring for selected pin */}
                    {isSelected && (
                      <span className="absolute w-12 h-12 rounded-full bg-blue-500/50 animate-ping" />
                    )}
                    
                    {/* Pin Badge */}
                    <div className={`px-3 py-1.5 rounded-full text-xs font-black shadow-xl border-2 flex items-center gap-1.5 ${statusColor}`}>
                      <MapPin className="w-4 h-4 fill-current" />
                      <span>{zone.name.split(' ')[0]}</span>
                    </div>
                  </div>

                  {/* Tooltip Hover Preview */}
                  <div className="hidden group-hover:block absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-52 bg-slate-900 text-white p-3 rounded-xl text-xs shadow-2xl border border-slate-700 pointer-events-none z-40 text-left">
                    <p className="font-black text-blue-300 text-sm">{zone.name}</p>
                    <p className="text-slate-300 mt-1 font-medium">Footfall Index: <strong>{zone.footfallScore}/100</strong></p>
                    <p className="text-slate-300 font-medium">Demand Ratio: <strong>{zone.demandRatio}</strong></p>
                    <p className="mt-1 font-black text-emerald-400">{zone.status} Territory</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Map Legend */}
          <div className="relative z-10 flex items-center justify-between mt-4 text-xs font-bold text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <span className="font-black text-slate-200">Territory Status:</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Exclusive Available</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span> Reserved</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> Sold Out</span>
            </div>
          </div>
        </div>

        {/* Selected Zone Analytics Drawer (Right 5 Cols) */}
        <div className="lg:col-span-5 p-6 bg-slate-50 flex flex-col justify-between space-y-6">
          {activeZone ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1.5 ${
                    activeZone.status === 'Available' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                    activeZone.status === 'Reserved' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    {activeZone.status} Territory
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900">{activeZone.name}</h4>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold">{city} Metro Region</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block font-bold">Est. Sq. Ft. Rent</span>
                  <span className="text-base sm:text-lg font-black text-slate-900">₹{activeZone.avgRentSqFt} <span className="text-xs font-medium text-slate-500">/ sq ft</span></span>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider">Footfall Index</span>
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">{activeZone.footfallScore}</span>
                    <span className="text-xs font-bold text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${activeZone.footfallScore}%` }}></div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider">Demand Ratio</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 block mt-1">{activeZone.demandRatio}</span>
                  <p className="text-xs font-bold text-emerald-700 mt-1">High customer pull</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider">Competitors</span>
                    <Store className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 block mt-1">{activeZone.competitorCount} Brands</span>
                  <p className="text-xs font-medium text-slate-500 mt-1">Within 2km radius</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider">Target Income</span>
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-snug mt-1">{activeZone.incomeTier}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    if (onSelectZone) onSelectZone(activeZone.name);
                  }}
                  disabled={activeZone.status === 'Sold'}
                  className={`w-full py-3.5 px-5 rounded-xl text-sm font-black transition-all shadow-md flex items-center justify-center gap-2 ${
                    activeZone.status === 'Available'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.01]'
                      : activeZone.status === 'Reserved'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white hover:scale-[1.01]'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  {activeZone.status === 'Available'
                    ? `Reserve Territory in ${activeZone.name}`
                    : activeZone.status === 'Reserved'
                    ? `Join Waitlist for ${activeZone.name}`
                    : `Territory Sold Out`}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm font-medium">
              Select a zone pin on the map to inspect location analytics
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
