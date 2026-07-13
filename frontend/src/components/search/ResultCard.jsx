import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"

export function ResultCard({ title, snippet, confidence }) {
  return (
    <Card className="bg-white/5 border-white/10 p-4 hover:bg-white/[0.07] transition-colors cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <FileText className="text-purple-400 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-white">{title}</h3>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{snippet}</p>
          </div>
        </div>
        <span className="text-sm text-purple-400 font-medium whitespace-nowrap">
          {confidence}%
        </span>
      </div>
    </Card>
  )
}