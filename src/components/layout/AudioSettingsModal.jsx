import React, { useState, useEffect } from 'react';
import { 
  getElevenLabsCredentials, 
  setElevenLabsCredentials, 
  testElevenLabsConnection, 
  speakText, 
  stopNarration 
} from '../../utils/audio';
import { Volume2, Key, Mic, CheckCircle2, AlertCircle, Sparkles, X, Play, Loader2 } from 'lucide-react';

export default function AudioSettingsModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getElevenLabsCredentials();
      setApiKey(creds.apiKey || '');
      setVoiceId(creds.voiceId || '');
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    stopNarration();

    const res = await testElevenLabsConnection(apiKey, voiceId);
    setIsTesting(false);
    setTestResult(res);

    if (res.ok && res.audioUrl) {
      const audio = new Audio(res.audioUrl);
      audio.play();
    } else {
      // Fall back audio play test
      speakText("Testing audio narration fallback system.");
    }
  };

  const handleSave = () => {
    setElevenLabsCredentials(apiKey, voiceId);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1b123d] border border-white/20 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Audio & ElevenLabs Config</h3>
            <p className="text-xs text-amber-300/80">Manage text audio narration credentials</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-5">
          
          {/* ElevenLabs API Key */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>ElevenLabs API Key</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_..."
              className="w-full bg-slate-900/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          {/* ElevenLabs Voice ID */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>Voice ID (Default: Alice - Xb7hH8MSUJpSbSDYk0k2)</span>
            </label>
            <input
              type="text"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              placeholder="Xb7hH8MSUJpSbSDYk0k2"
              className="w-full bg-slate-900/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`p-3 rounded-2xl border text-xs font-extrabold mb-4 flex items-start gap-2 ${
            testResult.ok 
              ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300' 
              : 'bg-amber-500/15 border-amber-400/40 text-amber-300'
          }`}>
            {testResult.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p>{testResult.ok ? 'ElevenLabs Connection Successful! 🎉' : 'ElevenLabs API Status Note:'}</p>
              <p className="font-normal opacity-90 text-[11px] mt-0.5">{testResult.error || 'Connected'}</p>
              {!testResult.ok && (
                <p className="text-[10px] text-amber-200 mt-1 italic">
                  ✨ Don't worry! Pre-rendered audio and enhanced WebSpeech fallback narration will automatically handle speech playback.
                </p>
              )}
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold mb-4 text-center">
            Credentials saved successfully!
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-extrabold text-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {isTesting ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
            )}
            <span>{isTesting ? 'Testing API...' : 'Test Narration'}</span>
          </button>

          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Save Credentials
          </button>

        </div>

      </div>
    </div>
  );
}
