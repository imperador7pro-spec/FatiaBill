import React from 'react';
import { Camera, Sparkles, Check, TrendingUp, Receipt, Archive, FolderOpen, Tag } from 'lucide-react';

export function Scanner({ theme, scanning, scanResult, documents, onScan, onClassify }) {
  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="text-center">
        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <Camera size={26} />
        </div>
        <h3 className="font-black text-lg">Scanner</h3>
      </div>
      <button
        onClick={onScan}
        disabled={scanning}
        className={`w-full py-10 border-2 border-dashed rounded-3xl flex flex-col items-center gap-2 ${scanning ? 'border-indigo-500' : 'hover:border-indigo-500'} ${theme.bd}`}
      >
        {scanning ? (
          <>
            <Sparkles className="animate-spin text-indigo-500" size={28} />
            <span className="font-bold text-sm text-indigo-500">OCR...</span>
          </>
        ) : (
          <>
            <Camera size={28} className={theme.mt} />
            <span className={`font-bold text-sm ${theme.mt}`}>Photographier un reçu</span>
          </>
        )}
      </button>
      {scanResult && (
        <div className={`p-5 rounded-2xl border-2 border-indigo-500 ${theme.cd} space-y-4`}>
          <p className="font-black text-xs flex items-center gap-2">
            <Check size={16} className="text-emerald-500" />Classez:
          </p>
          <div className={`p-3 rounded-xl ${theme.sf}`}>
            <div className="flex justify-between text-xs mb-1">
              <span className={theme.mt}>Montant</span>
              <span className="font-black">{scanResult.a} CHF</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={theme.mt}>Libellé</span>
              <span className="font-bold">{scanResult.l}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => onClassify('CLIENT')} className="py-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 flex flex-col items-center gap-1">
              <TrendingUp size={22} className="text-emerald-600" />
              <span className="font-black text-[10px] text-emerald-700">CLIENT</span>
            </button>
            <button onClick={() => onClassify('FOURNISSEUR')} className="py-4 rounded-xl border-2 border-rose-500 bg-rose-50 flex flex-col items-center gap-1">
              <Receipt size={22} className="text-rose-600" />
              <span className="font-black text-[10px] text-rose-700">FOURNISSEUR</span>
            </button>
            <button onClick={() => onClassify('JUSTIFICATIF')} className="py-4 rounded-xl border-2 border-amber-500 bg-amber-50 flex flex-col items-center gap-1">
              <Archive size={22} className="text-amber-600" />
              <span className="font-black text-[10px] text-amber-700">ARCHIVE</span>
            </button>
          </div>
        </div>
      )}
      {documents.length > 0 && (
        <div className={`rounded-2xl border ${theme.cd} ${theme.bd}`}>
          <div className={`p-3 border-b ${theme.bd}`}>
            <h4 className="font-black text-xs flex items-center gap-2">
              <FolderOpen size={14} />Archives ({documents.length})
            </h4>
          </div>
          {documents.map((d) => (
            <div key={d.id} className={`p-2.5 flex items-center justify-between border-b ${theme.bd}`}>
              <div className="flex items-center gap-2">
                <Tag size={12} className={d.type === 'CLIENT' ? 'text-emerald-500' : 'text-rose-500'} />
                <span className="text-[10px] font-bold truncate max-w-48">{d.l}</span>
              </div>
              <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full ${d.type === 'CLIENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {d.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
