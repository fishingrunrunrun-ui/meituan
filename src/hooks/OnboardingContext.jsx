import { createContext, useContext, useState, useCallback } from 'react';

const OnboardingContext = createContext(null);

const initialData = {
  school: '',
  studentId: '',
  nickname: '',
  activityLevel: null,
  sportTypes: null,
  dailyTarget: '',
  targetUnit: 'km',
  frequency: null,
  gender: null,
  age: '',
  heightCm: '',
  weightKg: '',
  petSpecies: null,
  petName: '',
};

export function OnboardingProvider({ children }) {
  const [data, setData] = useState(initialData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateData = useCallback((newData) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const bmi = data.heightCm && data.weightKg
    ? (parseFloat(data.weightKg) / ((parseFloat(data.heightCm) / 100) ** 2)).toFixed(1)
    : null;

  const getBMICategory = (bmiVal) => {
    if (!bmiVal) return '';
    const v = parseFloat(bmiVal);
    if (v < 18.5) return '偏瘦';
    if (v < 24) return '正常';
    if (v < 28) return '偏胖';
    return '肥胖';
  };

  const canProceedStep1 = data.school.trim() && data.studentId.trim() && data.nickname.trim();
  const canProceedStep2 = data.activityLevel !== null;
  const canProceedStep3 = data.sportTypes && data.dailyTarget && data.frequency;
  const canProceedStep4 = data.gender && data.age && data.heightCm && data.weightKg;
  const canProceedStep5 = data.petName && data.petSpecies;

  const value = {
    data,
    updateData,
    currentStep,
    setCurrentStep,
    bmi,
    getBMICategory,
    canProceedStep1,
    canProceedStep2,
    canProceedStep3,
    canProceedStep4,
    canProceedStep5,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
