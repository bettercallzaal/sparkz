'use client'

import { useState, useCallback } from 'react'

type ProjectType = 'solo' | 'collab' | 'crowdfund'

type Collaborator = {
  id: string
  role: string
  name: string
  address: string
  percent: number
}

type SplitConfig = {
  communityPool: number
  creatorPool: number
  treasury: number
  zaoStake: number
  launchToken: boolean
}

type Step = 'type' | 'collabs' | 'split-config' | 'review'

const ROLE_PRESETS = [
  'Artist',
  'Producer',
  'Co-producer',
  'Mixer',
  'Mastering engineer',
  'Featured artist',
  'Songwriter',
  'Manager',
  'Label',
  'Other',
]

const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string; description: string }[] = [
  {
    value: 'solo',
    label: 'Solo artist',
    description: 'You made this alone or with session players you pay upfront. The split is yours.',
  },
  {
    value: 'collab',
    label: 'Collab / joint release',
    description:
      'Two or more artists who each have an ongoing stake. Producers, engineers, and features with points.',
  },
  {
    value: 'crowdfund',
    label: 'Group crowdfund',
    description:
      'A community backs a project together. Backers share the fee pool by their contribution size.',
  },
]

const DEFAULT_SPLIT_CONFIG: SplitConfig = {
  communityPool: 50,
  creatorPool: 25,
  treasury: 25,
  zaoStake: 5,
  launchToken: false,
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function totalPercent(collabs: Collaborator[]) {
  return collabs.reduce((s, c) => s + c.percent, 0)
}

function CollabRow({
  collab,
  onChange,
  onRemove,
  canRemove,
}: {
  collab: Collaborator
  onChange: (id: string, field: keyof Collaborator, value: string | number) => void
  onRemove: (id: string) => void
  canRemove: boolean
}) {
  return (
    <div className="card-dark p-4 flex flex-wrap gap-3 items-start">
      <div className="flex-1 min-w-[120px]">
        <label className="text-xs text-slate-500 mb-1 block">Role</label>
        <select
          value={collab.role}
          onChange={(e) => onChange(collab.id, 'role', e.target.value)}
          className="w-full bg-zao-dark border border-zao-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
        >
          {ROLE_PRESETS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[120px]">
        <label className="text-xs text-slate-500 mb-1 block">Name or handle</label>
        <input
          type="text"
          placeholder="@handle or name"
          value={collab.name}
          onChange={(e) => onChange(collab.id, 'name', e.target.value)}
          className="w-full bg-zao-dark border border-zao-border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50"
        />
      </div>
      <div className="flex-1 min-w-[160px]">
        <label className="text-xs text-slate-500 mb-1 block">Wallet (0x…)</label>
        <input
          type="text"
          placeholder="0x… (optional for now)"
          value={collab.address}
          onChange={(e) => onChange(collab.id, 'address', e.target.value)}
          className="w-full bg-zao-dark border border-zao-border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50 font-mono text-xs"
        />
      </div>
      <div className="w-20">
        <label className="text-xs text-slate-500 mb-1 block">Share %</label>
        <input
          type="number"
          min={1}
          max={100}
          value={collab.percent}
          onChange={(e) => onChange(collab.id, 'percent', parseInt(e.target.value) || 0)}
          className="w-full bg-zao-dark border border-zao-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50 tabular-nums"
        />
      </div>
      {canRemove && (
        <button
          onClick={() => onRemove(collab.id)}
          className="mt-6 text-slate-600 hover:text-red-400 transition-colors text-lg"
          title="Remove"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default function SplitWizard() {
  const [step, setStep] = useState<Step>('type')
  const [projectType, setProjectType] = useState<ProjectType>('collab')
  const [projectName, setProjectName] = useState('')
  const [collabs, setCollabs] = useState<Collaborator[]>([
    { id: uid(), role: 'Artist', name: '', address: '', percent: 60 },
    { id: uid(), role: 'Producer', name: '', address: '', percent: 40 },
  ])
  const [splitConfig, setSplitConfig] = useState<SplitConfig>(DEFAULT_SPLIT_CONFIG)
  const [copied, setCopied] = useState(false)

  const updateCollab = useCallback(
    (id: string, field: keyof Collaborator, value: string | number) => {
      setCollabs((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
    },
    []
  )

  const addCollab = () => {
    setCollabs((prev) => [...prev, { id: uid(), role: 'Other', name: '', address: '', percent: 0 }])
  }

  const removeCollab = (id: string) => {
    setCollabs((prev) => prev.filter((c) => c.id !== id))
  }

  const total = totalPercent(collabs)
  const totalFeeAlloc = splitConfig.communityPool + splitConfig.creatorPool + splitConfig.treasury
  const creatorCredit = 100 - splitConfig.zaoStake

  const exportPayload = {
    _comment: 'Sparkz split sheet — review before wiring to 0xSplits',
    project: projectName || 'Untitled project',
    type: projectType,
    collaborators: collabs.map((c) => ({
      role: c.role,
      name: c.name,
      address: c.address || `[WALLET_FOR_${c.name.replace(/\s+/g, '_').toUpperCase() || c.role.toUpperCase()}]`,
      shareOfCreatorPool: `${c.percent}%`,
    })),
    feeDistribution: {
      communityPool: `${splitConfig.communityPool}%`,
      creatorPool: `${splitConfig.creatorPool}%`,
      treasury: `${splitConfig.treasury}%`,
      note: 'Percentages of the 1% Clanker trading fee; ZAO stake is a token allocation, not a fee slice',
    },
    zaoStake: {
      tokenAllocation: `${splitConfig.zaoStake}% of token supply`,
      lockDuration: '12 months',
      purpose: 'Aligned ZAO backing — not a fee extraction',
    },
    tokenLaunch: splitConfig.launchToken ? 'yes — configure in deploy-config.md' : 'no — tokenless for now',
    _next: 'Run npm run snapshot to compute weights | Go to app.splits.org to create your split | Deploy on clanker.world only when ready',
  }

  const copyJSON = async () => {
    await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(projectName || 'sparkz-split').replace(/\s+/g, '-').toLowerCase()}-split.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 text-xs text-slate-500">
        {(['type', 'collabs', 'split-config', 'review'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-zao-border" />}
            <div
              className={`flex items-center gap-1.5 ${step === s ? 'text-gold-400' : s < step ? 'text-slate-400' : 'text-slate-600'}`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${
                  step === s
                    ? 'bg-gold-500 border-gold-500 text-black'
                    : 'border-zao-border text-slate-500'
                }`}
              >
                {i + 1}
              </div>
              <span className="hidden sm:inline capitalize">{s.replace('-', ' ')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Project type */}
      {step === 'type' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white mb-2">What kind of project is this?</h2>
          {PROJECT_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setProjectType(opt.value)}
              className={`w-full text-left card-dark p-4 transition-colors hover:border-gold-500/30 ${
                projectType === opt.value ? 'border-gold-500/60 bg-gold-500/5' : ''
              }`}
            >
              <div className="font-semibold text-white">{opt.label}</div>
              <div className="text-sm text-slate-400 mt-1">{opt.description}</div>
            </button>
          ))}
          <div className="mt-4">
            <label className="text-sm text-slate-400 mb-2 block">Project name (optional)</label>
            <input
              type="text"
              placeholder="e.g. ZABAL × Boostr, Album Title, Collab Name…"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-zao-card border border-zao-border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50"
            />
          </div>
          <button onClick={() => setStep('collabs')} className="btn-gold mt-2 w-full">
            Next: Add collaborators →
          </button>
        </div>
      )}

      {/* Step 2: Collaborators */}
      {step === 'collabs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white">Who gets a share?</h2>
            <span
              className={`text-sm font-bold tabular-nums ${
                total === 100 ? 'text-gold-400' : total > 100 ? 'text-red-400' : 'text-slate-400'
              }`}
            >
              {total}% / 100%
            </span>
          </div>
          <p className="text-sm text-slate-500 -mt-2">
            These shares apply within the creator pool. Wallet addresses can be added now or later
            — leave blank to use a placeholder.
          </p>

          {collabs.map((c) => (
            <CollabRow
              key={c.id}
              collab={c}
              onChange={updateCollab}
              onRemove={removeCollab}
              canRemove={collabs.length > 1}
            />
          ))}

          {total !== 100 && (
            <div
              className={`text-sm px-4 py-2 rounded-lg ${
                total > 100
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-zao-card text-slate-500 border border-zao-border'
              }`}
            >
              {total > 100
                ? `Over by ${total - 100}%. Reduce shares to reach exactly 100%.`
                : `${100 - total}% unallocated. Add collaborators or increase existing shares to reach 100%.`}
            </div>
          )}

          <button
            onClick={addCollab}
            className="w-full py-3 border border-dashed border-zao-border text-slate-500 rounded-xl hover:border-gold-500/30 hover:text-slate-300 transition-colors text-sm"
          >
            + Add collaborator
          </button>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('type')} className="btn-outline flex-1">
              ← Back
            </button>
            <button
              onClick={() => setStep('split-config')}
              disabled={total !== 100}
              className="btn-gold flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next: Fee split →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Fee split config */}
      {step === 'split-config' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">How do trading fees get split?</h2>
            <p className="text-sm text-slate-500">
              This is the fee split for the 0xSplits contract — what happens to every 1% Clanker
              trading fee. The community pool is paid out weekly by contribution score.
            </p>
          </div>

          {[
            { key: 'communityPool' as const, label: 'Community pool', description: 'Paid to contributors by points, weekly' },
            { key: 'creatorPool' as const, label: 'Creator pool', description: 'Distributed among collaborators above by their share' },
            { key: 'treasury' as const, label: 'Treasury', description: 'Community-governed, for future use (liquidity, votes, collabs)' },
          ].map(({ key, label, description }) => (
            <div key={key} className="card-dark p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-white">{label}</div>
                  <div className="text-xs text-slate-500">{description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={splitConfig[key]}
                    onChange={(e) =>
                      setSplitConfig((prev) => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))
                    }
                    className="w-16 bg-zao-dark border border-zao-border rounded-lg px-2 py-1.5 text-right text-white text-sm font-bold focus:outline-none focus:border-gold-500/50 tabular-nums"
                  />
                  <span className="text-slate-400 text-sm">%</span>
                </div>
              </div>
              <div className="h-2 bg-zao-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-500 rounded-full transition-all"
                  style={{ width: `${splitConfig[key]}%` }}
                />
              </div>
            </div>
          ))}

          {totalFeeAlloc !== 100 && (
            <div
              className={`text-sm px-4 py-2 rounded-lg ${
                totalFeeAlloc > 100
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-zao-card text-slate-400 border border-zao-border'
              }`}
            >
              {totalFeeAlloc > 100
                ? `Total is ${totalFeeAlloc}% — reduce to exactly 100%.`
                : `Total is ${totalFeeAlloc}% — must reach 100%.`}
            </div>
          )}

          {/* ZAO stake */}
          <div className="card-dark p-4 border-zao-violet/30">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold text-white">ZAO stake</div>
                <div className="text-xs text-slate-500">
                  Token supply allocation (not a fee slice). ZAO holds for 12 months — aligned, not
                  extractive.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={splitConfig.zaoStake}
                  onChange={(e) =>
                    setSplitConfig((prev) => ({ ...prev, zaoStake: parseInt(e.target.value) || 0 }))
                  }
                  className="w-16 bg-zao-dark border border-zao-border rounded-lg px-2 py-1.5 text-right text-white text-sm font-bold focus:outline-none focus:border-gold-500/50 tabular-nums"
                />
                <span className="text-slate-400 text-sm">% supply</span>
              </div>
            </div>
            <div className="text-xs text-slate-600 mt-1">
              The remaining {creatorCredit}% of token supply is yours to allocate (team, community
              airdrop, liquidity, etc.)
            </div>
          </div>

          {/* Token now or later */}
          <div className="card-dark p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Launch a token with this split?</div>
                <div className="text-xs text-slate-500">
                  You can always launch later. No token required to get started.
                </div>
              </div>
              <button
                onClick={() => setSplitConfig((prev) => ({ ...prev, launchToken: !prev.launchToken }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  splitConfig.launchToken ? 'bg-gold-500' : 'bg-zao-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    splitConfig.launchToken ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {splitConfig.launchToken && (
              <p className="text-xs text-gold-500/80 mt-2">
                You&rsquo;ll get a full deploy checklist on the review screen. The actual deploy is a
                single human click on clanker.world — no agent ever touches that.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('collabs')} className="btn-outline flex-1">
              ← Back
            </button>
            <button
              onClick={() => setStep('review')}
              disabled={totalFeeAlloc !== 100}
              className="btn-gold flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Review split →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review + export */}
      {step === 'review' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white">Review your split</h2>

          <div className="card-dark p-5 space-y-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Project</div>
              <div className="text-white font-semibold">{projectName || 'Untitled project'} · {projectType}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-2">Collaborators (creator pool)</div>
              <div className="space-y-2">
                {collabs.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{c.role}</span>
                      <span className="text-white font-medium">{c.name || '(unnamed)'}</span>
                    </div>
                    <span className="text-gold-400 font-bold tabular-nums">{c.percent}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-zao-border pt-4">
              <div className="text-xs text-slate-500 mb-2">Fee split (of 1% trading fee)</div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Community pool (weekly by points)</span>
                  <span className="text-white font-bold tabular-nums">{splitConfig.communityPool}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Creator pool (collabs above)</span>
                  <span className="text-white font-bold tabular-nums">{splitConfig.creatorPool}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Treasury (community-governed)</span>
                  <span className="text-white font-bold tabular-nums">{splitConfig.treasury}%</span>
                </div>
              </div>
            </div>

            <div className="border-t border-zao-border pt-4">
              <div className="text-xs text-slate-500 mb-1">ZAO stake</div>
              <div className="text-sm text-slate-300">
                {splitConfig.zaoStake}% of token supply · 12-month lock · not a fee slice
              </div>
            </div>

            <div className="border-t border-zao-border pt-4">
              <div className="text-xs text-slate-500 mb-1">Token launch</div>
              <div className={`text-sm font-semibold ${splitConfig.launchToken ? 'text-gold-400' : 'text-slate-400'}`}>
                {splitConfig.launchToken ? 'Yes — human click on clanker.world' : 'Not yet — tokenless for now'}
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="card-dark p-5">
            <div className="text-sm font-semibold text-white mb-3">Export your split config</div>
            <pre className="text-xs text-slate-400 bg-zao-dark rounded-lg p-4 overflow-auto max-h-48 font-mono leading-relaxed">
              {JSON.stringify(exportPayload, null, 2)}
            </pre>
            <div className="flex gap-3 mt-4">
              <button onClick={copyJSON} className="btn-outline flex-1 text-sm py-2">
                {copied ? '✓ Copied!' : 'Copy JSON'}
              </button>
              <button onClick={downloadJSON} className="btn-gold flex-1 text-sm py-2">
                Download split.json
              </button>
            </div>
          </div>

          {splitConfig.launchToken && (
            <div className="card-dark p-5 border-gold-500/20">
              <div className="text-sm font-bold text-white mb-2">Next steps to launch</div>
              <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                <li>Fill wallet addresses in your split.json</li>
                <li>Go to app.splits.org → Create a new split with your recipients</li>
                <li>Copy the 0xSplits contract address</li>
                <li>Go to clanker.world → Deploy $YOURTOKEN with the splits address as fee recipient</li>
                <li>Run <code className="text-gold-400 font-mono">SPLITS_ADDRESS=0x… npm run snapshot</code> weekly</li>
              </ol>
              <p className="text-xs text-slate-600 mt-3">
                ZOL never deploys on-chain. You (or Aziz) click deploy. The prep is done — the
                signing is yours.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep('split-config')} className="btn-outline flex-1">
              ← Edit
            </button>
            <button onClick={() => setStep('type')} className="btn-outline flex-1">
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
