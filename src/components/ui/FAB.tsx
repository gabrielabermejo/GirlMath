import { useState } from 'react'
import { Plus } from 'lucide-react'

interface Props {
  onClick: () => void
  color1: string
  color2: string
  glow: string
}

export default function FAB({ onClick, color1, color2, glow }: Props) {
  const [pressed, setPressed] = useState(false)

  return (
    <button
      className="md:hidden fixed z-30 right-5 flex items-center justify-center rounded-full"
      style={{
        bottom: 'calc(76px + max(env(safe-area-inset-bottom, 0px), 16px) + 16px)',
        width: 56,
        height: 56,
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
        boxShadow: pressed
          ? `0 4px 12px ${glow}`
          : `0 8px 28px ${glow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
        transform: pressed ? 'scale(0.88)' : 'scale(1)',
        transition: pressed
          ? 'transform 0.1s ease, box-shadow 0.1s ease'
          : 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease',
        border: '1.5px solid rgba(255,255,255,0.25)',
        outline: 'none',
        cursor: 'pointer',
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onClick() }}
      onPointerLeave={() => setPressed(false)}
    >
      <Plus size={24} color="white" strokeWidth={2.5} />
    </button>
  )
}
