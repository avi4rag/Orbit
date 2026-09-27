import React from 'react';
import { Sparkles, ArrowRight, Compass, Zap, Waves } from 'lucide-react';

export interface ConceptItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  targetOutcome: string;
  category: string;
  suggestedDuration: number;
  suggestedAmbience: string;
  suggestedFrequencyHz?: number;
}

export interface IntentionAnalysisData {
  coreShift: string;
  keyThemes: string[];
  recommendedFocus: string;
  concepts: ConceptItem[];
}

interface IntentionBreakdownProps {
  analysis: IntentionAnalysisData;
  onSelectConcept: (concept: ConceptItem) => void;
  onBack: () => void;
}

export const IntentionBreakdown: React.FC<IntentionBreakdownProps> = ({
  analysis,
  onSelectConcept,
  onBack
}) => {
  return (
    <div className="orbit-breakdown-container animate-fade-in">
      {/* Header */}
      <div className="orbit-breakdown-header text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles size={14} /> Subconscious Architecture
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Your Intention Blueprint
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto mt-2 text-sm">
          ORBIT has synthesized your inputs into a foundational neural realignment pathway.
        </p>
      </div>

      {/* Core Shift Hero Card */}
      <div className="orbit-core-shift-card p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-blue-900/30 border border-indigo-500/30 backdrop-blur-md mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
            <Zap size={24} />
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">Core Neural Shift</span>
            <p className="text-lg text-white font-medium mt-1 leading-relaxed">
              "{analysis.coreShift}"
            </p>
          </div>
        </div>

        {/* Thematic Pillars */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 mr-2">Pillars:</span>
          {analysis.keyThemes?.map((theme, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-cyan-300"
            >
              {theme}
            </span>
          ))}
        </div>

        {/* Daily Focus Anchor */}
        {analysis.recommendedFocus && (
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-300">
            <Compass size={14} className="text-indigo-400 shrink-0" />
            <span><strong className="text-white">Daily Anchor:</strong> {analysis.recommendedFocus}</span>
          </div>
        )}
      </div>

      {/* Concept Selector Grid */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Recommended Session Concepts</h3>
          <p className="text-xs text-gray-400">Select a concept to customize and generate your audio</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-medium">
          {analysis.concepts?.length || 0} Personalized Concepts
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {analysis.concepts?.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelectConcept(c)}
            className="group p-5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-lg hover:shadow-cyan-500/10 relative"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {c.category}
                </span>
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Waves size={12} className="text-cyan-400" />
                  {c.suggestedFrequencyHz ? `${c.suggestedFrequencyHz} Hz` : 'Natural Rain'}
                </span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                {c.title}
              </h4>
              <p className="text-xs text-gray-300 font-medium mt-1">
                {c.tagline}
              </p>
              <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                {c.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                Suggested: <strong className="text-gray-200">{c.suggestedDuration}m</strong>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                Make It Yours <ArrowRight size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          ← Adjust Intention Answers
        </button>
      </div>
    </div>
  );
};
