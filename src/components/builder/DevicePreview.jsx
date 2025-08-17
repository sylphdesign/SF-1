import React from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Smartphone } from "lucide-react";

export default function DevicePreview({ deviceMode, onDeviceModeChange }) {
  const devices = [
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'tablet', icon: Tablet, label: 'Tablet' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' }
  ];

  return (
    <div className="flex items-center justify-center p-3 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border">
        {devices.map(device => (
          <Button
            key={device.id}
            variant={deviceMode === device.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onDeviceModeChange(device.id)}
            className={`px-3 py-2 h-8 ${
              deviceMode === device.id 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <device.icon className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline text-xs">{device.label}</span>
          </Button>
        ))}
      </div>
      
      <div className="ml-4 text-sm text-gray-500">
        Preview: {devices.find(d => d.id === deviceMode)?.label}
      </div>
    </div>
  );
}