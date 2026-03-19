import React, { useState, useEffect } from 'react';

const OrderTimer = ({ startedAt, large = false }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const update = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [startedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = String(elapsed % 60).padStart(2, '0');
  
  const colorClass = mins > 15 ? 'text-red-500 font-bold' : mins > 10 ? 'text-orange-500' : 'text-stone-500';
  const sizeClass = large ? 'text-2xl' : 'text-xs';

  return <span className={`font-mono ${colorClass} ${sizeClass}`}>{mins}:{secs}</span>;
};

export default OrderTimer;