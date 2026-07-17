'use client'

import { useState, useEffect } from 'react'

const BYOK_KEY = 'sparkz_anthropic_key'

export function useBYOK(): { key: string | null; isActive: boolean } {
  const [key, setKey] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(BYOK_KEY)
    setKey(stored)
  }, [])

  return { key, isActive: !!key && key.startsWith('sk-ant-') }
}

export default function BYOKSettings() {
  const [input, setInput] = useState('')
  const [saved, setSaved] = useState(false)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(BYOK_KEY)
    setActiveKey(stored)
    if (stored) setInput(stored)
  }, [])

  const save = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    localStorage.setItem(BYOK_KEY, trimmed)
    setActiveKey(trimmed)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const clear = () => {
    localStorage.removeItem(BYOK_KEY)
    setActiveKey(null)
    setInput('')
  }

  const isValid = input.trim().startsWith('sk-ant-')

  return (
    <div className="space-y-8">
      {/* BYOK card */}
      <div className="card-dark p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-black text-white text-lg mb-1">Anthropic API key (BYOK)</h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              When you provide your own key, ZOL routes all advisor compute through your Anthropic
              account — zero cost to the Sparkz treasury. The 1% compute floor in your split config
              folds back into community governance instead of platform upkeep.
            </p>
          </div>
          {mounted && activeKey && (
            <span className="text-xs px-2.5 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 font-semibold flex-shrink-0">
              BYOK active
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Anthropic API key</label>
            <input
              type="password"
              placeholder="sk-ant-…"
              value={input}
              onChange={(e) => { setInput(e.target.value); setSaved(false) }}
              className="w-full bg-zao-dark border border-zao-border rounded-lg px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-gold-500/50 font-mono text-sm"
            />
          </div>

          {input && !isValid && (
            <p className="text-xs text-red-400">Key must start with sk-ant-</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={!isValid}
              className="btn-gold text-sm py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saved ? 'Saved ✓' : 'Save key'}
            </button>
            {mounted && activeKey && (
              <button
                onClick={clear}
                className="text-sm py-2 px-4 rounded-lg border border-zao-border text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
              >
                Remove key
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-zao-border space-y-2 text-xs text-slate-600">
          <div className="flex gap-2">
            <span className="text-gold-500">✓</span>
            <span>Stored only in your browser localStorage — never transmitted to Sparkz servers</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gold-500">✓</span>
            <span>Used only for ZOL advisor calls made from this browser session</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gold-500">✓</span>
            <span>No key? The advisor still works — compute draws from the Sparkz treasury pool (the 1% upkeep floor in your split)</span>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-700">→</span>
            <a
              href="https://console.anthropic.com/account/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-400 transition-colors"
            >
              Get an Anthropic API key ↗
            </a>
          </div>
        </div>
      </div>

      {/* What BYOK unlocks */}
      <div className="card-dark p-6">
        <h3 className="font-bold text-white mb-4">What BYOK changes</h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-zao-dark border border-zao-border">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Without BYOK</div>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex gap-2"><span className="text-slate-600">–</span> Advisor compute from Sparkz treasury</li>
                <li className="flex gap-2"><span className="text-slate-600">–</span> 1% of your fee split goes to treasury upkeep</li>
                <li className="flex gap-2"><span className="text-slate-600">–</span> Treasury funds compute for all non-technical creators</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">With BYOK</div>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex gap-2"><span className="text-green-500">✓</span> Compute on your Anthropic account</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> That 1% folds back into community treasury</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> No platform cost — pay only for what you use</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The non-technical creator model (no key) is intentional — treasury funds their compute
            as an onboarding subsidy. The treasury stays solvent as long as fee inflow exceeds
            compute outflow. Power users subsidize that pool by not drawing from it.
          </p>
        </div>
      </div>
    </div>
  )
}
