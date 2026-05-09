import { useRef, useState } from 'react'

export interface SwipeAction {
  icon: React.ReactNode
  label: string
  color: string
  onClick: () => void
}

interface Props {
  children: React.ReactNode
  actions: SwipeAction[]
}

const BTN_W     = 62    // px per action button
const RESISTANCE = 0.25

export default function SwipeableRow({ children, actions }: Props) {
  const ACTION_W  = actions.length * BTN_W
  const THRESHOLD = ACTION_W * 0.4

  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)

  const startX    = useRef(0)
  const startY    = useRef(0)
  const baseOff   = useRef(0)
  const direction = useRef<'h' | 'v' | null>(null)

  function onTouchStart(e: React.TouchEvent) {
    startX.current    = e.touches[0].clientX
    startY.current    = e.touches[0].clientY
    baseOff.current   = offset
    direction.current = null
    setDragging(true)
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current

    if (!direction.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      direction.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
    }
    if (direction.current !== 'h') return

    e.preventDefault()

    const raw = baseOff.current + dx
    let next: number
    if (raw < -ACTION_W) {
      next = -ACTION_W + (raw + ACTION_W) * RESISTANCE
    } else if (raw > 0) {
      next = raw * RESISTANCE
    } else {
      next = raw
    }
    setOffset(next)
  }

  function onTouchEnd() {
    setDragging(false)
    if (baseOff.current === 0 && offset < -THRESHOLD) {
      setOffset(-ACTION_W)
    } else if (baseOff.current === -ACTION_W && offset > -(ACTION_W - THRESHOLD)) {
      setOffset(0)
    } else {
      setOffset(baseOff.current)
    }
  }

  const isOpen = offset < -THRESHOLD / 2

  function handleActionClick(action: SwipeAction) {
    setOffset(0)
    action.onClick()
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Action buttons */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: ACTION_W,
          display: 'flex',
        }}
      >
        {actions.map((action, i) => (
          <button
            key={i}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => handleActionClick(action)}
            style={{
              flex: 1,
              background: action.color,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {action.icon}
            <span style={{ fontSize: 9, fontWeight: 700, color: 'white' }}>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Slideable content */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={isOpen ? () => setOffset(0) : undefined}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 0.32s cubic-bezier(0.25,1,0.5,1)',
          willChange: 'transform',
          background: 'white',
          position: 'relative',
          zIndex: 1,
          cursor: isOpen ? 'pointer' : 'default',
        }}
      >
        {children}
      </div>
    </div>
  )
}
