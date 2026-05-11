import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { OnboardingProvider, useOnboarding } from '../../hooks/OnboardingContext';
import '../../styles/onboarding.css';

const stepTitles = {
  1: '学校与身份绑定',
  2: '运动活跃度选择',
  3: '打卡计划设定',
  4: '身体数据录入',
  5: '领取第一只宠物',
};

const stepIcons = { 1: '📝', 2: '🏃', 3: '📋', 4: '📊', 5: '🥚' };

const stepRoutes = {
  1: '/onboarding/step/1',
  2: '/onboarding/step/2',
  3: '/onboarding/step/3',
  4: '/onboarding/step/4',
  5: '/onboarding/step/5',
};

function ProgressBar({ step }) {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar-track">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`progress-segment ${s < step ? 'filled' : ''} ${s === step ? 'current' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

function OnboardingInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentStep, setCurrentStep } = useOnboarding();

  const stepFromRoute = parseInt(location.pathname.split('/').pop());
  const step = stepFromRoute || currentStep;

  const goTo = (s) => {
    setCurrentStep(s);
    navigate(stepRoutes[s]);
  };

  const handlePrev = () => {
    if (step > 1) goTo(step - 1);
  };

  const handleNext = () => {
    if (step < 5) goTo(step + 1);
  };

  return (
    <div className="onboarding">
      {/* Header with logo */}
      <div className="onboarding-header">
        <div className="onboarding-logo">
          <span className="onboarding-logo-icon">🐾</span>
          FitBuddy
        </div>
        <span className="onboarding-step-indicator">{step}/5</span>
      </div>

      {/* Step title */}
      <div style={{
        padding: '0 20px 2px',
        fontFamily: 'var(--font-pixel)',
        fontSize: 15,
        color: 'var(--dark-brown)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        letterSpacing: 1,
      }}>
        <span>{stepIcons[step]}</span>
        <span>{stepTitles[step]}</span>
      </div>

      <ProgressBar step={step} />

      <div className="onboarding-content">
        <Outlet context={{ step, goTo }} />
      </div>

      <div className="onboarding-footer">
        {step > 1 && (
          <button className="pixel-btn secondary" onClick={handlePrev}>
            ← 上一步
          </button>
        )}
        {step < 5 && (
          <StepNavButton step={step} onNext={handleNext} />
        )}
      </div>
    </div>
  );
}

function StepNavButton({ step, onNext }) {
  const { canProceedStep1, canProceedStep2, canProceedStep3, canProceedStep4 } = useOnboarding();

  const canProceed = {
    1: canProceedStep1,
    2: canProceedStep2,
    3: canProceedStep3,
    4: canProceedStep4,
  };

  return (
    <button
      className="pixel-btn primary"
      disabled={!canProceed[step]}
      onClick={onNext}
    >
      下一步 →
    </button>
  );
}

export default function OnboardingContainer() {
  return (
    <OnboardingProvider>
      <OnboardingInner />
    </OnboardingProvider>
  );
}
