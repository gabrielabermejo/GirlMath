const widths = ['72%', '58%', '80%', '64%', '75%']
const subwidths = ['45%', '38%', '52%', '42%', '48%']

export default function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-pink-50">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 px-4 py-3.5 animate-pulse">
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-3.5 rounded-full bg-pink-100" style={{ width: widths[i % 5] }} />
            <div className="h-2.5 rounded-full bg-pink-50"  style={{ width: subwidths[i % 5] }} />
          </div>
          <div className="h-4 w-16 shrink-0 rounded-full bg-pink-100" />
        </div>
      ))}
    </div>
  )
}
