// src/components/ProgressBar.jsx — NEW FILE

export default function ProgressBar({ pct = 0, showLabel = true, size = 'md', className = '' }) {
  const isComplete = pct >= 100

  const heights = { sm: 'h-1', md: 'h-1.5', lg: 'h-2.5' }
  const h = heights[size] || heights.md

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-dim">
            {isComplete ? '🎉 Complete!' : 'Progress'}
          </span>
          <span className={`text-xs font-mono font-medium ${isComplete ? 'text-green' : 'text-soft'}`}>
            {pct}%
          </span>
        </div>
      )}
      <div className={`w-full bg-muted rounded-full overflow-hidden ${h}`}>
        <div
          className={`${h} rounded-full transition-all duration-500 ease-out ${
            isComplete
              ? 'bg-green'
              : pct > 50
              ? 'bg-amber'
              : 'bg-teal'
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}
