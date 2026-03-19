export const getLocalDate = () => {
  return new Date().toLocaleDateString('en-CA');
};

export const getUPIQR = (config, total, token, orderId) => {
  const tempTr = `ORD-${orderId}-${Date.now()}`; 
  const tempTn = `Order #${orderId}`;
  const upiString = `upi://pay?pa=${config.pa}&pn=${encodeURIComponent(config.pn)}&am=${total}&cu=${config.cu}&tn=${encodeURIComponent(tempTn)}&tr=${tempTr}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
};