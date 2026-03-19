import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Loader } from 'lucide-react';
import { getTheme, COMMON_STYLES, FONTS } from './theme';

export default function CheckoutModal({ 
  
  isOpen, 
  onClose, 
  onConfirm, 
  cartSubtotal, 
  taxAmount, 
  discount, 
  grandTotal, 
  orderId, 
  isDarkMode, 
  backendUpiData,
  onPaymentComplete // ✅ Receive the new success handler
}) {
  console.log("QR DATA:", backendUpiData);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const theme = getTheme(isDarkMode);

  useEffect(() => { 
    if (isOpen) { 
      setPaymentMethod('cash'); 
      setIsProcessing(false); 
    } 
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (paymentMethod === "upi") {
      // For UPI we do NOT finalize order yet
      await onConfirm({ paymentMethod: "upi", initiate: true });
      return;
    }
  
    setIsProcessing(true);
    await onConfirm({ paymentMethod });
    setIsProcessing(false);
  };

  // ─── UPI QR VIEW ───
  if (backendUpiData?.qr) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${theme.bg.overlay} p-4`} style={{ fontFamily: FONTS.sans }}>
        <div className={`w-full max-w-sm rounded-2xl relative p-8 flex flex-col items-center text-center ${COMMON_STYLES.modal(isDarkMode)}`}>
          <button 
            onClick={onClose} 
            className={`absolute top-4 right-4 p-2 rounded-lg ${theme.button.ghost}`}
          >
            <X size={24} />
          </button>
          <h2 className="text-xl font-semibold mb-6">Payment</h2>
          <div className="bg-white p-4 rounded-xl mb-6 shadow-inner border">
            {/* QR Code */}
            <img src={backendUpiData.qr} alt="UPI QR" className="w-48 h-48 object-contain" />
          </div>
          <p className="text-base font-medium mb-1 opacity-75">{backendUpiData.payee || "Merchant"}</p>
          <p className="text-3xl font-bold mb-8">₹{grandTotal}</p>
          
          {/* ✅ FIX: Call onPaymentComplete instead of onClose */}
          <button 
            onClick={()=>onPaymentComplete("upi")} 
            className={`w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 ${theme.button.primary}`}
          >
            <CheckCircle size={20} /> Payment Done
          </button>
          <div className="grid grid-cols-3 gap-3">
          {paymentMethod === "card" && (
  <div className="mt-4 space-y-3">
    <input
      placeholder="Card Number"
      className={`w-full ${COMMON_STYLES.input(isDarkMode)}`}
    />

    <div className="flex gap-3">
      <input
        placeholder="MM/YY"
        className={`flex-1 ${COMMON_STYLES.input(isDarkMode)}`}
      />
      <input
        placeholder="CVV"
        className={`flex-1 ${COMMON_STYLES.input(isDarkMode)}`}
      />
    </div>

    <input
      placeholder="Cardholder Name"
      className={`w-full ${COMMON_STYLES.input(isDarkMode)}`}
    />
  </div>
)}
          </div>
        </div>
      </div>
    );
  }

  // ─── STANDARD CHECKOUT VIEW ───
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${theme.bg.overlay} p-4`} style={{ fontFamily: FONTS.sans }}>
      <div className={`w-full max-w-md rounded-2xl flex flex-col ${COMMON_STYLES.modal(isDarkMode)}`}>
        <div className={`p-6 flex justify-between items-center border-b ${theme.border.default}`}>
          <div>
            <h2 className="text-xl font-semibold">Checkout</h2>
            <p className={`text-sm font-medium mt-1 ${theme.text.secondary}`}>Order #{orderId}</p>
          </div>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-lg ${theme.button.ghost}`}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className={`p-5 rounded-xl border space-y-2 ${theme.border.default} ${theme.bg.subtle}`}>
            <div className={`flex justify-between text-sm font-medium ${theme.text.secondary}`}>
              <span>Subtotal</span>
              <span>₹{cartSubtotal}</span>
            </div>
            <div className={`flex justify-between text-sm font-medium ${theme.text.secondary}`}>
              <span>Discount</span>
              <span>-₹{discount}</span>
            </div>
            <div className={`flex justify-between text-sm font-medium ${theme.text.secondary}`}>
              <span>Tax</span>
              <span>₹{Math.round(taxAmount)}</span>
            </div>
            <div className={`flex justify-between text-xl font-semibold pt-4 mt-2 border-t ${theme.border.default}`}>
              <span>Total</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>
          
          <div>
            <label className={`block text-xs font-medium uppercase mb-3 ${theme.text.secondary}`}>
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'cash', label: 'Cash' }, 
                { id: 'upi', label: 'UPI' }, 
                { id: 'card', label: 'Card' }
              ].map((m) => (
                <button 
                  key={m.id} 
                  onClick={() => setPaymentMethod(m.id)} 
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border font-medium gap-2 transition ${paymentMethod === m.id ? theme.button.primary : theme.button.secondary}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleConfirm} 
            disabled={isProcessing} 
            className={`w-full py-3 rounded-lg font-medium text-sm flex justify-center items-center gap-2 ${theme.button.primary}`}
          >
            {isProcessing ? <Loader className="animate-spin" /> : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}