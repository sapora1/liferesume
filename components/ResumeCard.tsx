
import React from 'react';
import { LifeResume, UserInput } from '../types';

interface ResumeCardProps {
  data: LifeResume;
  userInput: UserInput;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ data, userInput }) => {
  const accentColor = data.accentColor || '#8b5cf6';

  return (
    <div id="capture-area" className="w-full max-w-[850px] mx-auto bg-[#ffffff] rounded-[64px] overflow-hidden flex flex-col relative shadow-[0_60px_150px_rgba(0,0,0,0.6)] border border-white/5 group animate-in zoom-in-95 duration-1000">
      
      {/* 1. Executive Header (Colored Backdrop) */}
      <div className="h-[300px] w-full relative overflow-hidden transition-all duration-1000 flex items-end px-12 md:px-20 pb-10" style={{ backgroundColor: accentColor }}>
        {/* Artistic Light Play */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/30"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Header Content: Aligning name to the right of where the image will be */}
        <div className="relative z-40 w-full flex flex-col md:flex-row items-end gap-10 md:gap-16">
          {/* Invisible Spacer matching the image width (w-80) to push name to the right */}
          <div className="hidden md:block flex-shrink-0 w-80"></div>
          
          <div className="flex-1 text-center md:text-left">
            {/* Name: Smaller font size as requested */}
            <h2 className="text-5xl md:text-[64px] font-black tracking-tighter text-white mb-[-8px] leading-none italic drop-shadow-2xl">
              {data.name}
            </h2>
          </div>
        </div>

        {/* Classified Legacy Badge - Top Right */}
        <div className="absolute top-8 right-10 z-50 inline-flex items-center space-x-2 bg-black/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse"></div>
          <span className="text-white/80 text-[9px] font-black uppercase tracking-[0.4em]">Classified Legacy</span>
          <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.1em] border-l border-white/10 pl-2">{new Date().getFullYear()}</span>
        </div>
      </div>

      {/* 2. Main Body (White Section) */}
      <div className="px-12 md:px-20 pb-28 bg-white relative z-20">
        
        {/* 3. Identity Section: Profession and Vibe Pills */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16 relative z-30">
          
          {/* Portrait: Overlapping the color transition boundary */}
          <div className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80 rounded-[64px] border-[18px] border-white bg-zinc-50 shadow-[0_45px_110px_rgba(0,0,0,0.15)] overflow-hidden flex items-center justify-center relative -mt-32 md:mt-[-160px] group-hover:scale-[1.02] transition-transform duration-700">
            {data.caricatureUrl ? (
              <img src={data.caricatureUrl} alt="Existential Spirit Animal" className="w-full h-full object-cover" />
            ) : (
              <div className="text-9xl grayscale opacity-30 select-none">🐾</div>
            )}
          </div>
          
          {/* Profession and Vibe Block */}
          <div className="flex-1 text-center md:text-left pt-6">
            {/* Profession: Clean, spaced out, directly under the name (vertically) */}
            <p className="text-zinc-400 font-bold text-lg md:text-2xl uppercase tracking-[0.6em] mb-10 leading-none">
              {userInput.profession || 'Universal Entity'}
            </p>
            
            {/* Vibe Pills */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {[`${userInput.age} VINTAGE`, userInput.mood, userInput.language, userInput.roastLevel].map((tag, idx) => (
                <span key={idx} className="px-5 py-2.5 bg-zinc-50 border border-zinc-100/80 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Depth Content */}
        <div className="mt-24 space-y-28">
          {/* Existential Briefing */}
          <section className="relative px-8">
            <div className="absolute -left-10 top-0 h-full w-2 rounded-full" style={{ backgroundColor: accentColor }}></div>
            <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-200 mb-8 ml-6">Existential Briefing</h3>
            <div className="space-y-8 ml-6">
              {data.summary.map((line, i) => (
                <p key={i} className="text-black font-extrabold text-2xl md:text-[32px] leading-[1.2] tracking-tighter max-w-4xl">{line}</p>
              ))}
            </div>
          </section>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
            <section>
              <div className="flex items-center gap-6 mb-12">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-200">The Triumphs</h3>
                <div className="flex-1 h-[1px] bg-zinc-50"></div>
              </div>
              <ul className="space-y-10">
                {data.achievements.map((item, i) => (
                  <li key={i} className="flex gap-8 group/item">
                    <span className="flex-shrink-0 w-12 h-12 rounded-[20px] flex items-center justify-center text-[16px] font-black transition-all" style={{ backgroundColor: `${accentColor}10`, color: accentColor }}>0{i+1}</span>
                    <span className="text-[19px] font-bold text-zinc-800 leading-snug pt-2.5">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-6 mb-12">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-200">Vibe Metrics</h3>
                <div className="flex-1 h-[1px] bg-zinc-50"></div>
              </div>
              <div className="space-y-12">
                {data.skills.map((skill, i) => (
                  <div key={i} className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-black uppercase tracking-[0.3em] text-zinc-600">{skill.name}</span>
                      <span className="text-[13px] font-black text-zinc-300">{skill.percentage}%</span>
                    </div>
                    <div className="h-5 w-full bg-zinc-50 rounded-full overflow-hidden p-1.5 border border-zinc-100">
                      <div 
                        className="h-full rounded-full transition-all duration-[2s] delay-300 ease-out" 
                        style={{ width: `${skill.percentage}%`, backgroundColor: accentColor }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Analysis Section (Dark) */}
          <section className="bg-zinc-950 rounded-[70px] p-16 md:p-20 text-white shadow-4xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -mr-48 -mt-48 blur-[120px]"></div>
            
            <h3 className="text-[12px] font-black uppercase tracking-[0.6em] text-zinc-700 mb-16">Post-Incident Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
              {data.failuresAndLessons.map((item, i) => (
                <div key={i} className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.4)]"></div>
                    <p className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">Case Log 0{i+1}</p>
                  </div>
                  <p className="text-[14px] font-bold text-zinc-500 italic line-through opacity-60">"{item.failure}"</p>
                  <p className="text-[21px] font-bold leading-[1.3] text-zinc-100 border-l-2 pl-8 py-2" style={{ borderColor: accentColor }}>
                    {item.lesson}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Brand Footer */}
        <div className="mt-20 pt-10 border-t border-zinc-50 flex flex-col items-center">
          <div className="flex gap-6 mb-8">
             {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full bg-zinc-50"></div>)}
          </div>
          
          <div className="text-center space-y-1 opacity-20 hover:opacity-100 transition-opacity duration-700">
            <div className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-10">
              <span className="text-[9px] font-black tracking-[0.4em] uppercase text-zinc-400">Existential Life Documentation Engine</span>
              <div className="hidden md:block w-1 h-1 rounded-full bg-zinc-200"></div>
              <span className="text-[9px] font-black tracking-[0.4em] uppercase text-zinc-400">LIFERESUME</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
