import React, { useState } from 'react';
import { FranchiseListing } from '../../types';
import { api } from '../../services/api';
import {
  Store,
  CreditCard,
  PlusCircle,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  MapPin,
  Image as ImageIcon,
  X,
  Plus,
  Shield,
  Lock,
  MessageSquare
} from 'lucide-react';

interface FranchiserListingsViewProps {
  listings: FranchiseListing[];
  onOpenAddModal: () => void;
  onRefresh: () => void;
  onRequestQuotaRevision?: (listing: FranchiseListing) => void;
}

export const FranchiserListingsView: React.FC<FranchiserListingsViewProps> = ({
  listings,
  onOpenAddModal,
  onRefresh,
  onRequestQuotaRevision,
}) => {

  const [editingImageListing, setEditingImageListing] = useState<FranchiseListing | null>(null);
  const [editCoverUrl, setEditCoverUrl] = useState<string>('');
  const [editGalleryUrls, setEditGalleryUrls] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState<string>('');
  const [savingImages, setSavingImages] = useState(false);

  const handlePayListingFee = async (id: number) => {
    try {
      const res = await api.payListingFee(id);
      if (res.success) {
        alert('Listing fee (₹5,000) successfully paid. Your brand is now verified in search rankings.');
        onRefresh();
      }
    } catch (e: any) {
      alert(e.message || 'Payment failed');
    }
  };

  const handlePayMaintenanceFee = async (id: number) => {
    try {
      const res = await api.payMaintenanceFee(id);
      if (res.success) {
        alert('Monthly catalog maintenance fee (₹1,500) successfully settled.');
        onRefresh();
      }
    } catch (e: any) {
      alert(e.message || 'Payment failed');
    }
  };

  const openImageEditor = (l: FranchiseListing) => {
    setEditingImageListing(l);
    setEditCoverUrl(l.image_url || '');
    setEditGalleryUrls(Array.from(new Set([
      l.image_url,
      ...(l.images || [])
    ].filter(Boolean))) as string[]);
  };

  const handleSaveImages = async () => {
    if (!editingImageListing) return;
    setSavingImages(true);
    try {
      const res = await api.updateFranchiseImages(editingImageListing.id, editCoverUrl, editGalleryUrls);
      if (res.success) {
        alert('Franchise reference photos updated successfully!');
        setEditingImageListing(null);
        onRefresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update images');
    } finally {
      setSavingImages(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Brand Listings & Media Management ({listings.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain catalog active status, upload operational reference photos, and manage unit availability.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {listings.length >= 1 ? (
            <span className="px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1 / 1 Max Listing Limit Reached</span>
            </span>
          ) : (
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Brand</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {listings.map((l) => {
          const isListingFeePaid = l.listing_fee_paid === 1;
          const isMaintenancePaid = l.maintenance_fee_status === 'Paid';
          const listImages = Array.from(new Set([l.image_url, ...(l.images || [])].filter(Boolean))) as string[];

          return (
            <div
              key={l.id}
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {listImages.length > 0 ? (
                    <img
                      src={listImages[0]}
                      alt={l.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xl flex items-center justify-center shrink-0">
                      {l.name.charAt(0)}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{l.name}</h3>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold">
                        {l.business_type}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                        {l.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                      {l.description}
                    </p>
                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3 pt-1">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Fixed Quota: <strong>{l.available_units} Available</strong> / {l.total_units} Total ({l.sold_units || (l.total_units - l.available_units)} Sold)</span>
                      </span>
                      <span>•</span>
                      <span>Est Investment: <strong>₹{(l.total_investment_est / 100000).toFixed(1)}L</strong></span>
                      <span>•</span>
                      <span>Royalty: <strong>{l.royalty_type} ({l.royalty_value}%)</strong></span>
                      <span>•</span>
                      <span>Views: <strong>{l.views_count}</strong></span>
                    </div>

                    <div className="mt-2 p-2.5 bg-slate-100/80 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Units are fixed by statutory listing contract. Need to increase total franchise units?</span>
                      </div>
                      <button
                        onClick={() => {
                          if (onRequestQuotaRevision) {
                            onRequestQuotaRevision(l);
                          }
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 font-extrabold text-[10px] rounded-lg border border-indigo-200 transition shrink-0 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                      >
                        Request Quota Revision →
                      </button>

                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
                  {/* Edit Reference Photos Button */}
                  <button
                    onClick={() => openImageEditor(l)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-slate-300"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Reference Photos ({listImages.length})</span>
                  </button>

                  {/* Listing Fee Badge & Button */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                      isListingFeePaid
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {isListingFeePaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      <span>Listing Fee: {isListingFeePaid ? 'Paid (₹5,900)' : 'Pending'}</span>
                    </span>

                    {!isListingFeePaid && (
                      <button
                        onClick={() => handlePayListingFee(l.id)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition"
                      >
                        Pay ₹5,000
                      </button>
                    )}
                  </div>

                  {/* Monthly Maintenance Fee Badge & Button */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                      isMaintenancePaid
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {isMaintenancePaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      <span>Maintenance: ₹{l.maintenance_fee}/mo ({l.maintenance_fee_status})</span>
                    </span>

                    {!isMaintenancePaid && (
                      <button
                        onClick={() => handlePayMaintenanceFee(l.id)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
                      >
                        Pay ₹1,500
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Reference Photos Modal */}
      {editingImageListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden relative my-auto max-h-[90vh] flex flex-col text-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Manage Reference Photos: {editingImageListing.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Update main cover photo and operational gallery images shown to investors.
                </p>
              </div>
              <button
                onClick={() => setEditingImageListing(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Main Cover Image URL</label>
                <input
                  type="url"
                  value={editCoverUrl}
                  onChange={(e) => setEditCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-800 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Add Operational Reference Photo</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newUrlInput}
                    onChange={(e) => setNewUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-800 focus:outline-indigo-600"
                  />
                  <button
                    onClick={() => {
                      if (newUrlInput.trim()) {
                        if (editGalleryUrls.length >= 10) {
                          alert('A maximum of 10 reference photos is allowed per franchise listing.');
                          return;
                        }
                        setEditGalleryUrls([...editGalleryUrls, newUrlInput.trim()]);
                        setNewUrlInput('');
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-800 mb-2">Attached Gallery Photos ({editGalleryUrls.length} / 10 Max)</div>
                <div className="grid grid-cols-3 gap-3">
                  {editGalleryUrls.map((url, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 group bg-slate-100">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setEditGalleryUrls(editGalleryUrls.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition text-[10px] font-bold shadow-md"
                        title="Delete photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setEditingImageListing(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveImages}
                disabled={savingImages}
                className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition"
              >
                {savingImages ? 'Saving Photos...' : 'Save Gallery Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
