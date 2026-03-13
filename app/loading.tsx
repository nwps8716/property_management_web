// src/app/loading.tsx - 全域載入頁面
export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* 雙層旋轉動畫 */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin" style={{ animationDelay: '0.15s' }}></div>
        </div>
        
        {/* 載入文字 */}
        <div className="text-center">
          <div className="text-lg font-medium text-slate-700 animate-pulse">
            載入中...
          </div>
          <div className="text-sm text-slate-500 mt-1">
            請稍候
          </div>
        </div>
      </div>
    </div>
  )
}
