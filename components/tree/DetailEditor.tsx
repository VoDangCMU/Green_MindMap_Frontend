'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Save } from 'lucide-react';
import { useOceanModelStore } from '@/store/useOceanModelStore';
import { toast } from 'sonner';
import { apiPost, createModel, generateKeywords } from '@/lib/auth';

export default function DetailEditor() {
  const {
    selectedOcean,
    selectedBehavior,
    demographics,
    keywords,
    generatedKeywords,
    isGenerating,
    setDemographics,
    setKeywords,
    setGeneratedKeywords,
    setIsGenerating,
    addModel,
    reset,
  } = useOceanModelStore();

  const [selectedGeneratedKeyword, setSelectedGeneratedKeyword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isFormValid = selectedOcean && selectedBehavior && demographics.age && demographics.location && demographics.gender;

  const handleGenerateKeywords = async () => {
    if (!isFormValid) {
      toast.error('Vui lòng điền đầy đủ thông tin OCEAN, behavior và demographic');
      return;
    }

    setIsGenerating(true);
    try {
      // Sử dụng generateKeywords function với Authorization header tự động
      const data = await generateKeywords({
        ocean: selectedOcean,
        behavior: selectedBehavior,
        age: demographics.age,
        location: demographics.location,
        gender: demographics.gender,
        keywords: keywords,
      });

      setGeneratedKeywords(data.output.keywords);
      toast.success('Keywords đã được tạo thành công!');
    } catch (error) {
      console.error('Error generating keywords:', error);
      toast.error('Có lỗi xảy ra khi tạo keywords');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveModel = async () => {
    if (!isFormValid) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const finalKeywords = selectedGeneratedKeyword || keywords;
    if (!finalKeywords.trim()) {
      toast.error('Vui lòng nhập hoặc chọn keywords');
      return;
    }

    setIsSaving(true);
    try {
      // Sử dụng createModel function với Authorization header tự động
      const response = await createModel({
        ocean: selectedOcean,
        behavior: selectedBehavior,
        age: demographics.age,
        location: demographics.location,
        gender: demographics.gender,
        keywords: finalKeywords,
      });

      const savedModel = {
        id: Date.now().toString(),
        ocean: selectedOcean,
        behavior: selectedBehavior,
        age: demographics.age,
        location: demographics.location,
        gender: demographics.gender,
        keywords: finalKeywords,
      };

      addModel(savedModel);
      reset();
      setSelectedGeneratedKeyword('');

      // Thông báo thành công với thông tin chi tiết
      toast.success(
        `✅ Đã lưu thành công model!\n🔹 OCEAN: ${selectedOcean}\n🔹 Behavior: ${selectedBehavior}\n🔹 Demographics: ${demographics.age} tuổi, ${demographics.gender}, ${demographics.location}`,
        {
          duration: 5000,
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: '500'
          }
        }
      );
    } catch (error) {
      console.error('Error saving model:', error);
      toast.error('❌ Có lỗi xảy ra khi lưu model. Vui lòng thử lại!', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: 'white'
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeywordSelection = (keyword: string) => {
    setSelectedGeneratedKeyword(keyword);
    setKeywords(keyword);
  };

  return (
    <div className="w-80 space-y-4">
      {/* Demographics Form */}
      <Card>
        <CardHeader>
          <CardTitle>Demographics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="age">Tuổi</Label>
            <Input
              id="age"
              type="number"
              placeholder="Nhập tuổi"
              value={demographics.age}
              onChange={(e) => setDemographics({ age: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Địa điểm</Label>
            <Input
              id="location"
              placeholder="Nhập địa điểm"
              value={demographics.location}
              onChange={(e) => setDemographics({ location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Giới tính</Label>
            <Select
              value={demographics.gender}
              onValueChange={(value) => setDemographics({ gender: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nam">Nam</SelectItem>
                <SelectItem value="Nữ">Nữ</SelectItem>
                <SelectItem value="Khác">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Keywords Form */}
      <Card>
        <CardHeader>
          <CardTitle>Keywords</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords hiện tại</Label>
            <Textarea
              id="keywords"
              placeholder="Nhập keywords (cách nhau bằng dấu phẩy)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleGenerateKeywords}
            disabled={!isFormValid || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo keywords...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Keywords
              </>
            )}
          </Button>

          {/* Generated Keywords */}
          {generatedKeywords.length > 0 && (
            <div className="space-y-2">
              <Label>Keywords được tạo:</Label>
              <Select
                value={selectedGeneratedKeyword}
                onValueChange={handleKeywordSelection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn keyword được tạo" />
                </SelectTrigger>
                <SelectContent>
                  {generatedKeywords.map((keyword, index) => (
                    <SelectItem key={index} value={keyword}>
                      {keyword}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Save Model Button */}
          <Button
            onClick={handleSaveModel}
            disabled={!isFormValid || isSaving}
            className="w-full"
            variant="default"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu model...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu Model
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
