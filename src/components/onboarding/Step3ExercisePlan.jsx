import { useOnboarding } from '../../hooks/OnboardingContext';

const sportTypes = [
  { key: '步行', icon: '🚶', label: '户外步行', unit: 'km' },
  { key: '跑步', icon: '🏃', label: '户外跑步', unit: 'km' },
  { key: '骑行', icon: '🚴', label: '户外骑行', unit: 'km' },
  { key: '球类', icon: '⚽', label: '球类运动', unit: '分钟' },
  { key: '健身', icon: '🏋️', label: '健身训练', unit: '分钟' },
  { key: '游泳', icon: '🏊', label: '游泳', unit: 'km' },
  { key: '格斗', icon: '🥊', label: '格斗训练', unit: '分钟' },
  { key: '舞蹈', icon: '💃', label: '舞蹈', unit: '分钟' },
];

const frequencies = [
  { key: '每天', label: '每天' },
  { key: '每周1次', label: '每周1次' },
  { key: '每周3次', label: '每周3次' },
  { key: '每周5次', label: '每周5次' },
];

export default function Step3ExercisePlan() {
  const { data, updateData } = useOnboarding();

  const selectedSport = sportTypes.find((s) => s.key === data.sportTypes);
  const currentUnit = selectedSport ? selectedSport.unit : 'km';

  const selectSport = (key) => {
    const sport = sportTypes.find((s) => s.key === key);
    updateData({
      sportTypes: key,
      targetUnit: sport.unit,
    });
  };

  return (
    <div className="page-enter">
      <div className="step-section">
        <div className="step-label">选择运动类型</div>
        <div className="step-description">选择你感兴趣的运动，后续打卡将匹配该类别</div>
        <div className="sport-type-grid">
          {sportTypes.map((sport) => (
            <div
              key={sport.key}
              className={`sport-card ${data.sportTypes === sport.key ? 'selected' : ''}`}
              onClick={() => selectSport(sport.key)}
            >
              <span className="sport-card-icon">{sport.icon}</span>
              {sport.label}
            </div>
          ))}
        </div>
      </div>

      <div className="step-section">
        <div className="step-label">每次目标</div>
        <div className="target-row">
          <div className="target-input-wrap">
            <input
              className="pixel-input"
              type="number"
              placeholder="输入目标数值"
              value={data.dailyTarget}
              onChange={(e) => updateData({ dailyTarget: e.target.value })}
              min={0}
            />
          </div>
          <span className="target-unit">{currentUnit}</span>
        </div>
      </div>

      <div className="step-section">
        <div className="step-label">打卡周期</div>
        <div className="frequency-selector">
          {frequencies.map((freq) => (
            <button
              key={freq.key}
              className={`freq-btn ${data.frequency === freq.key ? 'selected' : ''}`}
              onClick={() => updateData({ frequency: freq.key })}
            >
              {freq.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
