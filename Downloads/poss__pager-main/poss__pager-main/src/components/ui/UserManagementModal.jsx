import React from 'react';
import { X, User } from 'lucide-react';

export default function UserManagementModal({ isOpen, onClose, currentUser }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 dark:text-white rounded-xl shadow-2xl p-6">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg">User Profile</h2>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <div className="text-center opacity-60 mb-6">
           <User size={48} className="mx-auto mb-4"/>
           <p className="text-sm">Logged in as:</p>
           <p className="font-bold text-lg">{currentUser?.email || 'User'}</p>
           <p className="text-xs uppercase mt-1 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">
             {currentUser?.role || 'Vendor'}
           </p>
        </div>

        <button onClick={onClose} className="w-full py-2 bg-gray-200 dark:bg-slate-800 rounded font-bold hover:opacity-80">
            Close
        </button>
      </div>
    </div>
  );
}