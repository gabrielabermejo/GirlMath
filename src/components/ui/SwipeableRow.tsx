import { useRef, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

interface Props {
  children: React.ReactNode
  onEdit?: () => void
  onDelete: () => void
  editColor?: string
  deleteColor?: string
}

const ACTION_W = 120   // px revealed at full swipe
const THRESHOLD = 48   // min drag to snap open
const RESISTANCE = 0.25

export default function SwipeableRow({
  children,
  onEdit,
  onDelete,
  editColor = '#ec4899',
  deleteColor = '#a78bfa',
}: Props) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)

  const startX    = useRef(0)
  const startY    = useRef(0)
  const baseOff   = useRef(0)
  const direction = useRef<'h' | 'v' | null>(null)

  function onTouchStart(e: React.TouchEvent) {
    startX.current  = e.touches[0].clientX
    startY.current  = e.touches[0].clientY
    baseOff.current = offset
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
      next = -ACTION_W + (raw + ACTION_W) * RESISTANCE   // rubber band past open
    } else if (raw > 0) {
      next = raw * RESISTANCE                             // rubber band past closed
    } else {
      next = raw
    }
    setOffset(next)
  }

  function onTouchEnd() {
    setDragging(false)
    // Snap: if dragged past threshold from closed, open; otherwise close
    if (baseOff.current === 0 && offset < -THRESHOLD) {
      setOffset(-ACTION_W)
    } else if (baseOff.current === -ACTION_W && offset > -(ACTION_W - THRESHOLD)) {
      setOffset(0)
    } else {
      setOffset(baseOff.current)
    }
  }

  function closeRow() {
    if (offset !== 0) setOffset(0)
  }

  const isOpen = offset < -THRESHOLD / 2

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Action buttons — revealed on swipe left */}
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
        {onEdit && (
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => { onEdit(); closeRow() }}
            style={{
              flex: 1,
              background: editColor,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Pencil size={16} color="white" />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>Editar</span>
          </button>
        )}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => { onDelete(); closeRow() }}
          style={{
            flex: 1,
            background: deleteColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Trash2 size={16} color="white" />
          <span style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>Eliminar</span>
        </button>
      </div>

      {/* Slideable content */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={isOpen ? closeRow : undefined}
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
