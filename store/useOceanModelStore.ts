import { create } from 'zustand';

export interface OceanModel {
  id: string;
  ocean: string;
  behavior: string;
  age: string;
  location: string;
  gender: string;
  keywords: string;
}

interface OceanModelState {
  selectedOcean: string;
  selectedBehavior: string;
  demographics: {
    age: string;
    location: string;
    gender: string;
  };
  keywords: string;
  generatedKeywords: string[];
  isGenerating: boolean;
  models: OceanModel[];
  setSelectedOcean: (ocean: string) => void;
  setSelectedBehavior: (behavior: string) => void;
  setDemographics: (demographics: Partial<{ age: string; location: string; gender: string }>) => void;
  setKeywords: (keywords: string) => void;
  setGeneratedKeywords: (keywords: string[]) => void;
  setIsGenerating: (loading: boolean) => void;
  addModel: (model: OceanModel) => void;
  reset: () => void;
}

export const useOceanModelStore = create<OceanModelState>((set) => ({
  selectedOcean: '',
  selectedBehavior: '',
  demographics: {
    age: '',
    location: '',
    gender: '',
  },
  keywords: '',
  generatedKeywords: [],
  isGenerating: false,
  models: [],
  setSelectedOcean: (ocean) => set({ selectedOcean: ocean }),
  setSelectedBehavior: (behavior) => set({ selectedBehavior: behavior }),
  setDemographics: (demographics) =>
    set((state) => ({
      demographics: { ...state.demographics, ...demographics },
    })),
  setKeywords: (keywords) => set({ keywords }),
  setGeneratedKeywords: (keywords) => set({ generatedKeywords: keywords }),
  setIsGenerating: (loading) => set({ isGenerating: loading }),
  addModel: (model) => set((state) => ({ models: [...state.models, model] })),
  reset: () =>
    set({
      selectedOcean: '',
      selectedBehavior: '',
      demographics: { age: '', location: '', gender: '' },
      keywords: '',
      generatedKeywords: [],
      isGenerating: false,
    }),
}));
