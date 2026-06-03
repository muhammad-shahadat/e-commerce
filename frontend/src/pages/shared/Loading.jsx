import React from 'react'
import { Loader2, Server } from 'lucide-react'

const Loading = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#ededed] dark:bg-[#1a1a1a] z-[9999]">
      <div className="relative flex flex-col items-center p-10 rounded-3xl bg-white/5 backdrop-blur-sm shadow-2xl border border-white/10 max-w-sm text-center">
        <div className="relative mb-6">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 text-indigo-500 blur-xl opacity-50 animate-pulse">
            <Loader2 />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
            Waking up the server
          </h2>

          <div className="flex items-start gap-2 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
            <Server className="w-10 h-10 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-xs text-left text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong>Technical Note:</strong> I&apos;m using a free hosting
              tier. It may take 30-60s to &quot;spin up&quot; for the first
              time. Thanks for your patience!
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-300 animate-pulse mt-2 italic">
            Configuring workspace environment
          </p>
        </div>

        <div className="flex gap-1.5 mt-6">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}

export default Loading
