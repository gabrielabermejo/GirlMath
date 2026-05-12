import { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: Props) {
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handler)
    }
  }, [isOpen, onClose])

  // Swipe-to-dismiss state
  const startY      = useRef(0)
  const [drag, setDrag]   = useState(0)
  const [pulling, setPulling] = useState(false)

  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY
    setPulling(true)
  }
  function onTouchMove(e: React.TouchEvent) {
    const dy = e.touches[0].clientY - startY.current
    if (dy > 0) setDrag(dy)
  }
  function onTouchEnd() {
    setPulling(false)
    if (drag > 90) { onClose(); setDrag(0) }
    else setDrag(0)
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fade-in absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ── Mobile: bottom sheet ── */}
      <div
        className="sheet-enter md:hidden absolute bottom-0 inset-x-0 flex flex-col rounded-t-[28px] bg-white shadow-2xl"
        style={{
          maxHeight: 'calc(92dvh - env(safe-area-inset-top, 0px))',
          transform: `translateY(${drag}px)`,
          transition: pulling ? 'none' : 'transform 0.42s cubic-bezier(0.34,1.2,0.64,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div
          className="flex-shrink-0 flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="w-10 h-1 rounded-full transition-colors"
            style={{ background: drag > 30 ? '#f9a8d4' : '#e5e7eb' }}
          />
        </div>

        {/* Title bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 pb-4 border-b border-pink-50">
          <h2 className="text-[17px] font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-gray-400 hover:bg-pink-50 hover:text-pink-400 active:scale-90 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
        >
          {children}
        </div>
      </div>

      {/* ── Desktop: centered modal ── */}
      <div className="hidden md:flex items-center justify-center p-4 h-full">
        <div
          className={`modal-enter card relative w-full ${sizes[size]} p-6 shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-gray-400 transition hover:bg-pink-50 hover:text-pink-400 active:scale-90"
            >
              <X size={18} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
