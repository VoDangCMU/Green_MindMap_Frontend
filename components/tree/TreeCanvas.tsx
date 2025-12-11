'use client';

import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { useOceanModelStore } from '@/store/useOceanModelStore';
import { OCEAN_DATA, type OceanKey } from '@/lib/ocean-data';

export default function TreeCanvas() {
  const {
    selectedOcean,
    selectedBehavior,
    setSelectedOcean,
    setSelectedBehavior,
  } = useOceanModelStore();

  const { isOver, setNodeRef } = useDroppable({
    id: 'tree-canvas',
  });

  // Lấy TẤT CẢ behaviors từ tất cả traits
  const allBehaviors = useMemo(() => {
    const behaviors: { ocean: string; behavior: string }[] = [];
    Object.entries(OCEAN_DATA).forEach(([ocean, data]) => {
      data.behaviors.forEach((behavior) => {
        behaviors.push({ ocean, behavior });
      });
    });
    return behaviors;
  }, []);

  const clearSelection = () => {
    setSelectedOcean('');
    setSelectedBehavior('');
  };

  const handleBehaviorChange = (behavior: string) => {
    setSelectedBehavior(behavior);
  };

  return (
    <Card className="flex-1 min-h-[400px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Tree Canvas
          {(selectedOcean || selectedBehavior) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className={`
            min-h-[300px] border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center
            ${isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${selectedOcean || selectedBehavior ? 'border-green-500 bg-green-50' : ''}
          `}
        >
          {!selectedOcean && !selectedBehavior ? (
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">
                Kéo thả OCEAN category hoặc behavior vào đây
              </div>
              <div className="text-sm">
                Bạn có thể kéo thả các mục từ Toolbox bên trái
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Selected Model</h3>
              </div>

              {/* OCEAN Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">OCEAN Category:</label>
                <div className="p-3 bg-blue-100 border border-blue-300 rounded-md">
                  <div className="font-medium text-blue-800">
                    {selectedOcean} - {selectedOcean && OCEAN_DATA[selectedOcean as OceanKey]?.label}
                  </div>
                </div>
              </div>

              {/* Behavior Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Behavior:</label>
                {selectedBehavior ? (
                  <div className="p-3 bg-green-100 border border-green-300 rounded-md">
                    <div className="font-medium text-green-800">{selectedBehavior}</div>
                  </div>
                ) : selectedOcean ? (
                  <Select value={selectedBehavior} onValueChange={handleBehaviorChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn behavior..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allBehaviors.map(({ behavior }, index) => (
                        <SelectItem key={`${selectedOcean}-${index}`} value={behavior}>
                          {behavior}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-500">
                    Chọn OCEAN category trước
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
