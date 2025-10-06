import React from "react";
import {
  ClipboardDocumentListIcon,
  DocumentMagnifyingGlassIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";   

export default function Sidebar({ activeSection, setActiveSection }) {
  const menuItems = [
    { id: "noteForm", label: "Note Form", icon: ClipboardDocumentListIcon },
    { id: "notes", label: "Clinical Notes", icon: Square3Stack3DIcon },
    { id: "entities", label: "Extracted Entities", icon: DocumentMagnifyingGlassIcon },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Entity Extractor</h2>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-16">   
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center w-full px-4 py-2 text-left rounded-lg transition-colors
                ${isActive ? "bg-gray-100 text-gray-900 font-semibold" : "text-gray-700 hover:text-gray-900"}
              `}
            >
              <Icon className="w-5 h-5 mr-3 text-gray-500" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );  
}
