
import React, { useState, useEffect } from 'react';
import { UserInput, LifeResume, Mood, RoastLevel, Language } from './types';
import { generateLifeResume } from './geminiService';
import { ResumeCard } from './components/ResumeCard';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const MOODS: Mood[] = ['calm', 'stressed', 'confused', 'optimistic'];
const ROAST_LEVELS: RoastLevel[] = ['light', 'medium', 'brutal but kind'];
const LANGUAGES: Language[] = ['English', 'Hinglish'];

const STEPS = [
  { 
    key: 'language', 
    label: 'Choose your vibe', 
    hinglishLabel: 'Apna vibe chuno',
    type: 'language', 
    hint: 'English or Hinglish? Mix it up.',
    hinglishHint: 'English ya Hinglish? Spicy mix chahiye?' 
  },
  { 
    key: 'name', 
    label: 'What is your legal name?', 
    hinglishLabel: 'Aapka legal naam kya hai?',
    placeholder: 'e.g. Alex Henderson', 
    hint: 'Or that cool nickname.',
    hinglishHint: 'Ya wo cool nickname jo sirf 3 log jaante hain.' 
  },
  { 
    key: 'age', 
    label: 'What is your vintage year?', 
    hinglishLabel: 'Aapka vintage saal?',
    placeholder: 'e.g. 1995 / 28ish', 
    hint: 'Like a fine wine.',
    hinglishHint: 'Fine wine ya leftover pizza slice ki tarah.' 
  },
  { 
    key: 'profession', 
    label: 'What do you do for Money?', 
    hinglishLabel: 'Paise ke liye kya karte ho?',
    placeholder: 'e.g. Software Developer', 
    hint: 'Official title vs reality.',
    hinglishHint: 'Official title vs aap jo asal mein karte ho.' 
  },
  { 
    key: 'hobby', 
    label: 'An expensive distraction?', 
    hinglishLabel: 'Mehenga distraction?',
    placeholder: 'e.g. Film Cameras', 
    hint: 'Used twice, gear worth 20k.',
    hinglishHint: 'Wo cheez jiske gear pe paise uda diye par use nahi kiya.' 
  },
  { 
    key: 'lastPurchase', 
    label: 'Latest 3 AM regret?', 
    hinglishLabel: 'Raat ke 3 baje wala regret?',
    placeholder: 'e.g. Giant plushie', 
    hint: 'Amazon is a dangerous friend.',
    hinglishHint: 'Amazon "Buy Now" ek khatarnak dost hai.' 
  },
  { 
    key: 'petPeeve', 
    label: 'Your minor inconvenience hero?', 
    hinglishLabel: 'Dimaag kharab karne wali choti cheez?',
    placeholder: 'e.g. Slow internet', 
    hint: 'Things that drive you crazy.',
    hinglishHint: 'Dheere chalne wale log? Ya keyboard ki awaaz?' 
  },
  { 
    key: 'uselessSkill', 
    label: 'Most useless skill?', 
    hinglishLabel: 'Sabse bekaar skill?',
    placeholder: 'e.g. Solving Cubes', 
    hint: 'Impresses zero people.',
    hinglishHint: 'Chadar fold karna? Ya 100m se kutte ki breed pehchanna?' 
  },
  { 
    key: 'procrastinatedGoal', 
    label: 'A goal on its 3rd year of delay?', 
    hinglishLabel: 'Goal jo 3 saal se delay ho raha hai?',
    placeholder: 'e.g. Writing a book', 
    hint: 'That one puzzle you never finished.',
    hinglishHint: 'Wo adhoora project? Ya wo gym membership?' 
  },
  { 
    key: 'mood', 
    label: 'Current Vibe Check', 
    hinglishLabel: 'Current vibe check',
    type: 'mood', 
    hint: 'Be honest with yourself.',
    hinglishHint: 'Apne internal weather ke baare mein sach batao.' 
  },
  { 
    key: 'roastLevel', 
    label: 'Roast intensity?', 
    hinglishLabel: 'Roast kitna hard chahiye?',
    type: 'roast', 
    hint: 'How much truth can you take?',
    hinglishHint: 'Aaj kitna sach jhel sakte ho?' 
  },
];

const LOADING_MESSAGES = [
  "Rethinking your life choices...",
  "Consulting the council of overthinkers...",
  "Polishing your minor failures...",
  "Generating your legacy...",
  "Wait for Reality Check..."
];

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState<UserInput>({
    name: '',
    language: 'English',
    age: '',
    profession: '',
    mood: 'calm',
    roastLevel: 'medium',
    hobby: '',
    lastPurchase: '',
    petPeeve: '',
    uselessSkill: '',
    procrastinatedGoal: '',
  });
  
  const [resume, setResume] = useState<LifeResume | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateLifeResume(input);
      setResume(result);
    } catch (err) {
      setError('The AI is having an existential crisis. Try once more?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResume(null);
    setCurrentStep(0);
    setInput({
      name: '',
      language: 'English',
      age: '',
      profession: '',
      mood: 'calm',
      roastLevel: 'medium',
      hobby: '',
      lastPurchase: '',
      petPeeve: '',
      uselessSkill: '',
      procrastinatedGoal: '',
    });
    setError(null);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('capture-area');
    if (!element) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        borderRadius: 64,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`LifeResume_${input.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const element = document.getElementById('capture-area');
    if (!element) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `LifeResume_${input.name}.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Life Resume: ${input.name}`,
              text: `My AI Life Resume just called me out. check yours!`,
            });
          } catch (err) {
            console.error('Sharing failed', err);
          }
        } else if (navigator.share) {
          // Fallback to text sharing
          try {
            await navigator.share({
              title: `Life Resume: ${input.name}`,
              text: `My AI Life Resume just called me out. Check yours at ${window.location.href}`,
            });
          } catch (err) { console.error('Text share failed', err); }
        } else {
          alert("Screenshot and post! Tag the vibe. 📸");
        }
      }, 'image/png');
    } catch (err) {
      console.error('Capture for share failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const renderStep = () => {
    const step = STEPS[currentStep];
    const label = input.language === 'Hinglish' && step.hinglishLabel ? step.hinglishLabel : step.label;
    const hint = input.language === 'Hinglish' && step.hinglishHint ? step.hinglishHint : step.hint;
    
    if (step.type === 'language') {
      return (
        <div className="space-y-8 animate-in slide-in-from-bottom-12 fade-in duration-700">
          <div className="text-center">
            <h2 className="text-5xl font-extrabold tracking-tighter mb-3 purple-gradient-text">{step.label}</h2>
            <p className="text-zinc-400 text-sm font-medium uppercase tracking-[0.2em]">{step.hint}</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => { setInput({ ...input, language: l }); nextStep(); }}
                className={`group relative p-10 rounded-[40px] transition-all active:scale-95 ${
                  input.language === l ? 'bg-violet-600 text-white shadow-[0_0_40px_rgba(139,92,246,0.5)]' : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                }`}
              >
                <span className="text-xl font-black uppercase tracking-widest">{l}</span>
                <div className={`absolute inset-0 rounded-[40px] border-2 transition-all ${input.language === l ? 'border-violet-300/50 scale-105' : 'border-transparent'}`}></div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step.type === 'mood') {
      return (
        <div className="space-y-8 animate-in slide-in-from-bottom-12 fade-in duration-700">
          <div className="text-center">
            <h2 className="text-5xl font-extrabold tracking-tighter mb-3">{label}</h2>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-[0.2em]">{hint}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => { setInput({ ...input, mood: m }); nextStep(); }}
                className={`p-6 rounded-[32px] text-xs font-black uppercase tracking-widest transition-all active:scale-95 border-2 ${
                  input.mood === m ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.3)]' : 'bg-white/5 text-zinc-500 border-transparent hover:border-zinc-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step.type === 'roast') {
      return (
        <div className="space-y-8 animate-in slide-in-from-bottom-12 fade-in duration-700">
          <div className="text-center">
            <h2 className="text-5xl font-extrabold tracking-tighter mb-3">{label}</h2>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-[0.2em]">{hint}</p>
          </div>
          <div className="space-y-3">
            {ROAST_LEVELS.map((r) => (
              <button
                key={r}
                onClick={() => setInput({ ...input, roastLevel: r })}
                className={`w-full p-6 rounded-[32px] text-xs font-black uppercase tracking-widest transition-all active:scale-95 border-2 ${
                  input.roastLevel === r ? 'bg-violet-600 text-white border-violet-400 shadow-[0_0_30px_rgba(139,92,246,0.3)]' : 'bg-white/5 text-zinc-500 border-transparent hover:border-zinc-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-8 py-8 bg-white text-black rounded-[40px] font-black text-xl uppercase tracking-[0.2em] hover:bg-violet-100 transition-all shadow-[0_20px_60px_-15px_rgba(255,255,255,0.2)] flex items-center justify-center space-x-4 active:scale-95"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-black/20 border-t-black" />
                <span className="animate-pulse">{LOADING_MESSAGES[loadingMsgIdx]}</span>
              </>
            ) : (
              <span>Seal My Fate</span>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-12 animate-in slide-in-from-bottom-12 fade-in duration-700">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold tracking-tighter mb-4 leading-[1.1]">{label}</h2>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.3em]">{hint}</p>
        </div>
        <div className="relative group">
          <input
            autoFocus
            type="text"
            placeholder={step.placeholder}
            className="w-full text-4xl font-black px-0 py-10 border-b-8 border-white/10 focus:border-violet-500 outline-none transition-all text-center placeholder:text-zinc-800 bg-transparent tracking-tighter"
            value={(input as any)[step.key]}
            onChange={(e) => setInput({ ...input, [step.key]: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && (input as any)[step.key].trim() && nextStep()}
          />
          <div className="absolute bottom-0 left-0 h-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all duration-700" style={{ width: (input as any)[step.key] ? '100%' : '0%' }}></div>
        </div>
        <div className="flex justify-center">
          <button
            disabled={!(input as any)[step.key].trim()}
            onClick={nextStep}
            className="w-28 h-28 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all disabled:opacity-5 disabled:grayscale shadow-[0_15px_40px_rgba(255,255,255,0.15)] group"
          >
            <svg className="w-12 h-12 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 md:px-8">
      {!resume ? (
        <div className="w-full max-w-2xl space-y-10">
          {/* Header area with progress and back button */}
          <div className="px-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {currentStep > 0 && !loading && (
                  <button 
                    onClick={prevStep} 
                    className="p-3 text-zinc-500 hover:text-white transition-all rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <span className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-600">Pipeline</span>
              </div>
              <span className="text-2xl font-black text-white">{currentStep + 1} <span className="text-zinc-800">/ {STEPS.length}</span></span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 transition-all duration-1000 ease-out" 
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="purple-glass rounded-[64px] p-16 min-h-[550px] flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] group-hover:bg-violet-600/20 transition-all duration-1000"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[100px] group-hover:bg-fuchsia-600/20 transition-all duration-1000"></div>
            {renderStep()}
          </div>
          
          {error && (
            <div className="p-8 bg-red-500/10 text-red-400 rounded-[32px] text-center text-[12px] font-black uppercase tracking-[0.3em] border border-red-500/20 animate-pulse">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-6xl py-12 space-y-12 animate-in zoom-in-95 fade-in duration-1000">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 no-print max-w-[800px] mx-auto w-full px-6">
            <button
              onClick={handleReset}
              className="flex items-center space-x-4 text-zinc-500 hover:text-white transition-all group"
            >
              <div className="p-4 bg-white/5 rounded-full border border-white/10 shadow-2xl group-hover:rotate-180 transition-transform duration-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="font-black text-[12px] uppercase tracking-[0.4em]">Erase Memory</span>
            </button>
            
            <div className="flex space-x-4">
              <button 
                onClick={handleExportPDF} 
                disabled={isExporting}
                className="px-8 py-5 bg-white/5 border border-white/10 text-white rounded-full font-black text-[12px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center space-x-3 disabled:opacity-50"
              >
                {isExporting ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                <span>{isExporting ? 'Processing...' : 'Export PDF'}</span>
              </button>
              <button 
                onClick={handleShare}
                disabled={isExporting}
                className="px-8 py-5 bg-violet-600 text-white rounded-full font-black text-[12px] uppercase tracking-widest hover:bg-violet-500 transition-all shadow-[0_20px_40px_rgba(139,92,246,0.3)] flex items-center space-x-3 disabled:opacity-50"
              >
                {isExporting ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>}
                <span>{isExporting ? 'Capturing...' : 'Share Post'}</span>
              </button>
            </div>
          </div>

          <div className="relative group flex justify-center">
             <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-[72px] blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
             <ResumeCard data={resume} userInput={input} />
          </div>
          
          <div className="text-center no-print pb-24">
            <p className="text-zinc-600 text-[11px] font-black uppercase tracking-[0.5em] mb-6">Reality feeling too intense?</p>
            <button onClick={handleGenerate} className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white text-black hover:text-black text-[11px] font-black uppercase tracking-widest rounded-full transition-all group">
              <span className="text-white group-hover:text-black">Spin the Palette</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
