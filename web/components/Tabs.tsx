'use client'

interface TabProps {
  tabs: string[]
  activeTab: string
  onChange: (tab: string) => void
}

export default function Tabs({ tabs, activeTab, onChange }: TabProps) {
  return (
    <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-6 py-3 text-sm font-bold transition-colors whitespace-nowrap ${
            activeTab === tab
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}