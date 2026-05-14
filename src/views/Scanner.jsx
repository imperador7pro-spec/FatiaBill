import React, { useRef, useState } from 'react';
import {
  Camera, Sparkles, Check, TrendingUp, Receipt, Archive, FolderOpen, Tag,
  Upload, X, AlertCircle, Edit3,
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../data.js';

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.85;

async function downscaleImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(MAX_DIMENSION / img.width, MAX_DIMENSION / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function Scanner({
  theme, scanning, scanResult, scanError, documents,
  onScan, onClassify, onEditResult, onClearError,
}) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    try {
      const dataUrl = await downscaleImage(file);
      setPreview(dataUrl);
      onScan(dataUrl);
    } catch (e) {
      console.error(e);
    }
  };

  const reset = () => {
    setPreview(null);
    setEditing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    onClearError?.();
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="text-center">
        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <Camera size={26} />
        </div>
        <h3 className="font-black text-lg">Scanner IA</h3>
        <p className={`text-[10px] ${theme.mt}`}>Photographiez un reçu — Claude Vision extrait montant, date, fournisseur et TVA</p>
      </div>

      {!preview && !scanResult && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={scanning}
            className={`py-8 border-2 border-dashed rounded-2xl flex flex-col items-center gap-2 transition-colors hover:border-indigo-500 ${theme.bd}`}
          >
            <Camera size={26} className="text-indigo-500" />
            <span className={`font-bold text-xs ${theme.tx}`}>Photo</span>
            <span className={`text-[9px] ${theme.mt}`}>Caméra mobile</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className={`py-8 border-2 border-dashed rounded-2xl flex flex-col items-center gap-2 transition-colors hover:border-indigo-500 ${theme.bd}`}
          >
            <Upload size={26} className="text-indigo-500" />
            <span className={`font-bold text-xs ${theme.tx}`}>Fichier</span>
            <span className={`text-[9px] ${theme.mt}`}>JPG / PNG / HEIC</span>
          </button>
          <input
            ref={cameraInputRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={fileInputRef} type="file" accept="image/*"
            className="hidden" onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {preview && (
        <div className="relative">
          <img src={preview} alt="aperçu" className="w-full rounded-2xl border-2 border-indigo-500" />
          {!scanning && !scanResult && (
            <button onClick={reset} className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full">
              <X size={16} />
            </button>
          )}
          {scanning && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-white">
              <Sparkles size={32} className="animate-spin mb-2 text-indigo-300" />
              <p className="font-black text-sm">Analyse en cours…</p>
              <p className="text-[10px] opacity-70 mt-1">Claude Vision lit votre document</p>
            </div>
          )}
        </div>
      )}

      {scanError && (
        <div className={`p-4 rounded-2xl border ${theme.dk ? 'bg-rose-950/40 border-rose-500/40' : 'bg-rose-50 border-rose-200'} flex items-start gap-3`}>
          <AlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-black text-xs text-rose-700">Erreur de scan</p>
            <p className={`text-[11px] mt-0.5 ${theme.dk ? 'text-rose-300' : 'text-rose-600'}`}>{scanError}</p>
          </div>
          <button onClick={reset} className="text-rose-500 font-bold text-xs">Réessayer</button>
        </div>
      )}

      {scanResult && (
        <div className={`p-5 rounded-2xl border-2 border-indigo-500 ${theme.cd} space-y-4`}>
          <div className="flex items-center justify-between">
            <p className="font-black text-xs flex items-center gap-2">
              <Check size={16} className="text-emerald-500" />Données extraites
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditing(!editing)}
                className={`p-1.5 rounded-lg ${editing ? 'bg-indigo-500 text-white' : theme.sf}`}
              >
                <Edit3 size={12} />
              </button>
              <button onClick={reset} className={`p-1.5 rounded-lg ${theme.sf}`}>
                <X size={12} />
              </button>
            </div>
          </div>

          {editing ? (
            <EditableResult theme={theme} result={scanResult} onSave={(r) => { onEditResult(r); setEditing(false); }} />
          ) : (
            <ResultSummary theme={theme} result={scanResult} />
          )}

          {!editing && (
            <div className="grid grid-cols-3 gap-2">
              <ClassifyButton
                label="CLIENT" sub="Encaissé" color="emerald" icon={TrendingUp}
                suggested={scanResult.suggested_type === 'CLIENT'}
                onClick={() => onClassify('CLIENT')}
              />
              <ClassifyButton
                label="FOURNISSEUR" sub="Payé" color="rose" icon={Receipt}
                suggested={scanResult.suggested_type === 'FOURNISSEUR'}
                onClick={() => onClassify('FOURNISSEUR')}
              />
              <ClassifyButton
                label="ARCHIVE" sub="Justif." color="amber" icon={Archive}
                suggested={scanResult.suggested_type === 'JUSTIFICATIF'}
                onClick={() => onClassify('JUSTIFICATIF')}
              />
            </div>
          )}

          {scanResult.confidence && (
            <p className={`text-[9px] ${theme.mt} text-center`}>
              Confiance IA: <strong className={
                scanResult.confidence === 'high' ? 'text-emerald-500'
                  : scanResult.confidence === 'medium' ? 'text-amber-500'
                    : 'text-rose-500'
              }>{scanResult.confidence}</strong>
              {scanResult.notes && ` · ${scanResult.notes}`}
            </p>
          )}
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
              <div className="flex items-center gap-2 min-w-0">
                <Tag size={12} className={
                  d.type === 'CLIENT' ? 'text-emerald-500'
                    : d.type === 'FOURNISSEUR' ? 'text-rose-500'
                      : 'text-amber-500'
                } />
                <span className="text-[10px] font-bold truncate">{d.label || d.l}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] font-bold tabular-nums">{d.amount || d.a} CHF</span>
                <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                  d.type === 'CLIENT' ? 'bg-emerald-100 text-emerald-700'
                    : d.type === 'FOURNISSEUR' ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                }`}>
                  {d.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultSummary({ theme, result }) {
  return (
    <div className={`p-3 rounded-xl ${theme.sf} space-y-1.5`}>
      <Row label="Libellé" value={result.label || '—'} />
      <Row label="Montant" value={`${result.amount?.toFixed(2) ?? '—'} CHF`} bold />
      <Row label="Date" value={result.date || '—'} />
      {result.vendor && <Row label="Fournisseur" value={result.vendor} />}
      {result.tva_amount != null && <Row label="TVA" value={`${result.tva_amount.toFixed(2)} CHF`} />}
      {result.category && <Row label="Catégorie" value={result.category} />}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-stone-500">{label}</span>
      <span className={bold ? 'font-black' : 'font-bold'}>{value}</span>
    </div>
  );
}

function EditableResult({ theme, result, onSave }) {
  const [form, setForm] = useState({
    label: result.label || '',
    amount: result.amount ?? '',
    date: result.date || '',
    vendor: result.vendor || '',
    tva_amount: result.tva_amount ?? '',
    category: result.category || '',
  });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className={`p-3 rounded-xl ${theme.sf} space-y-2`}>
      <Field theme={theme} label="Libellé">
        <input
          value={form.label} onChange={(e) => update('label', e.target.value)}
          className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold outline-none ${theme.inp}`}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field theme={theme} label="Montant CHF">
          <input
            type="number" step="0.05" value={form.amount}
            onChange={(e) => update('amount', e.target.value)}
            className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold outline-none ${theme.inp}`}
          />
        </Field>
        <Field theme={theme} label="Date">
          <input
            type="date" value={form.date}
            onChange={(e) => update('date', e.target.value)}
            className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold outline-none ${theme.inp}`}
          />
        </Field>
      </div>
      <Field theme={theme} label="Fournisseur / Client">
        <input
          value={form.vendor} onChange={(e) => update('vendor', e.target.value)}
          className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold outline-none ${theme.inp}`}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field theme={theme} label="TVA CHF">
          <input
            type="number" step="0.05" value={form.tva_amount}
            onChange={(e) => update('tva_amount', e.target.value)}
            className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold outline-none ${theme.inp}`}
          />
        </Field>
        <Field theme={theme} label="Catégorie">
          <select
            value={form.category} onChange={(e) => update('category', e.target.value)}
            className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold outline-none ${theme.inp}`}
          >
            <option value="">—</option>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <button
        onClick={() => onSave({
          ...result,
          ...form,
          amount: parseFloat(form.amount) || 0,
          tva_amount: form.tva_amount ? parseFloat(form.tva_amount) : null,
          category: form.category || null,
        })}
        className="w-full py-2 bg-indigo-600 text-white font-black rounded-lg text-xs"
      >
        Valider les corrections
      </button>
    </div>
  );
}

function Field({ theme, label, children }) {
  return (
    <div>
      <label className="text-[8px] font-black uppercase text-stone-400 tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function ClassifyButton({ label, sub, color, icon: Icon, suggested, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative py-4 rounded-xl border-2 flex flex-col items-center gap-1 transition-transform hover:scale-105 ${
        suggested
          ? `border-${color}-500 bg-${color}-50`
          : `border-stone-200 bg-stone-50`
      }`}
    >
      {suggested && (
        <span className={`absolute -top-1 -right-1 px-1 py-0.5 rounded-full text-[7px] font-black uppercase bg-${color}-500 text-white`}>
          IA
        </span>
      )}
      <Icon size={22} className={`text-${color}-600`} />
      <span className={`font-black text-[10px] text-${color}-700`}>{label}</span>
      <span className={`text-[8px] text-${color}-500`}>{sub}</span>
    </button>
  );
}
