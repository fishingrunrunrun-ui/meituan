import { useOnboarding } from '../../hooks/OnboardingContext';

const levels = [
  {
    key: '0',
    icon: '🛋️',
    title: '几乎不活跃',
    desc: '0次/周',
    multiplier: '×1.0',
  },
  {
    key: '1-2',
    icon: '🚶',
    title: '轻度活跃',
    desc: '1-2次/周',
    multiplier: '×1.1',
  },
  {
    key: '3-4',
    icon: '🏃',
    title: '中度活跃',
    desc: '3-4次/周',
    multiplier: '×1.2',
  },
  {
    key: '5-7',
    icon: '💪',
    title: '高度活跃',
    desc: '5-7次/周',
    multiplier: '×1.4',
  },
];

export default function Step2ActivityLevel() {
  const { data, updateData } = useOnboarding();

  return (
    <div className="page-enter">
      <div className="step-section">
        <div className="step-label">你的运动活跃度是？</div>
        <div className="step-description">
          这将影响你每次打卡获得的物资加成倍率，越活跃加成越高
        </div>
      </div>

      <div className="activity-cards">
        {levels.map((level) => (
          <div
            key={level.key}
            className={`activity-card ${data.activityLevel === level.key ? 'selected' : ''}`}
            onClick={() => updateData({ activityLevel: level.key })}
          >
            <div className="activity-card-icon">{level.icon}</div>
            <div className="activity-card-info">
              <div className="activity-card-title">{level.title}</div>
              <div style={{ fontSize: 10, color: '#A09080' }}>{level.desc}</div>
            </div>
            <div className="activity-card-multiplier">
              物资 <span>{level.multiplier}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
