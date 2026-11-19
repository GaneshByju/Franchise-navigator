import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Lock,
  Sparkles,
  Receipt,
  Download,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

interface FranchisePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  amount: number;
  paymentType: 'Listing Fee' | 'Monthly Maintenance' | 'Package Upgrade';
  relatedName: string;
  onPaymentSuccess: (txnRef: string) => void;
}

export const FranchisePaymentModal: React.FC<FranchisePaymentModalProps> = ({
  isOpen,
  onClose,
  title,
  amount,
  paymentType,
  relatedName,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('franchise@upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8910');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [loading, setLoading] = useState(false);
  const [completedTxn, setCompletedTxn] = useState<string | null>(null);

  if (!isOpen) return null;

  const gstRate = 0.18;
  const gstAmount = Math.round(amount * gstRate);
  const totalPayable = amount + gstAmount;

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.processPayment({
        purpose: `${paymentType} for ${relatedName}`,
        amount: totalPayable,
        payment_type: paymentType,
        payment_method: method === 'upi' ? `UPI (${upiId})` : method === 'card' ? 'Credit / Debit Card' : `NetBanking (${selectedBank})`,
      });

      const txnRef = res.transaction_ref || `TXN_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setCompletedTxn(txnRef);
      onPaymentSuccess(txnRef);
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col relative my-auto">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-[10px] text-slate-400">
                Secure PCI-DSS 256-Bit Platform Payment Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!completedTxn ? (
          <form onSubmit={handleProcessPayment} className="p-5 space-y-4 text-xs">
            {/* Summary Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Item / Purpose:</span>
                <span className="font-bold text-slate-900">{relatedName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Base Fee:</span>
                <span className="font-mono text-slate-800">₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Statutory GST (18%):</span>
                <span className="font-mono text-slate-800">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Payable:</span>
                <span className="text-emerald-600 font-mono">₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    method === 'upi'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10.5px]">Instant UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    method === 'card'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10.5px]">Credit / Debit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('netbanking')}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    method === 'netbanking'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10.5px]">Net Banking</span>
                </button>
              </div>
            </div>

            {/* Method Inputs */}
            {method === 'upi' && (
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">UPI Instant QR / VPA ID</span>
                  <span className="text-[9.5px] text-emerald-700 font-bold">Zero Convenience Fee</span>
                </div>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="name@upi"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:outline-emerald-600"
                />
              </div>
            )}

            {method === 'card' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-700">Select Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-800"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authorizing Payment...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay ₹{totalPayable.toLocaleString('en-IN')} Now</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Tax Invoice Receipt View */
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">Payment Settled Successfully!</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Transaction Reference: <strong className="font-mono text-slate-800">{completedTxn}</strong>
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  Official Tax Invoice Receipt
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">
                  Paid
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Purpose:</span>
                <strong className="text-slate-800">{paymentType}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Listing / Brand:</span>
                <strong className="text-slate-800">{relatedName}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Base Amount:</span>
                <span className="font-mono">₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%):</span>
                <span className="font-mono">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Total Amount Settled:</span>
                <span className="font-mono text-emerald-600 text-sm">₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Done &amp; Close Receipt
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
