// src/components/UI.jsx — shared small components

export function Spinner({ size = 'md', className = '' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size]
  return (
    <div className={`${sz} ${className}`}>
      <svg className="animate-spin text-amber w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Spinner size="lg" />
    </div>
  )
}

export function Empty({ icon = '📭', title = 'Nothing here yet', sub = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="font-display text-lg text-soft">{title}</p>
      {sub && <p className="text-sm text-dim mt-1">{sub}</p>}
    </div>
  )
}

export function ErrorMsg({ message }) {
  if (!message) return null
  return (
    <div className="bg-coral/10 border border-coral/25 text-coral text-sm rounded-lg px-4 py-3">
      {message}
    </div>
  )
}

export function SuccessMsg({ message }) {
  if (!message) return null
  return (
    <div className="bg-green/10 border border-green/25 text-green text-sm rounded-lg px-4 py-3">
      {message}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3 animate-pulse">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
      <div className="flex gap-2 pt-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-lg animate-fade-up">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <h2 className="font-display text-lg font-semibold text-snow">{title}</h2>
          <button onClick={onClose} className="text-dim hover:text-light transition-colors text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
