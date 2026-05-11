import { useOnboarding } from '../../hooks/OnboardingContext';

export default function Step4BodyData() {
  const { data, updateData, bmi, getBMICategory } = useOnboarding();

  return (
    <div className="page-enter">
      <div className="step-section">
        <div className="step-label">性别</div>
        <div className="gender-toggle">
          <button
            className={`gender-btn ${data.gender === 'male' ? 'selected' : ''}`}
            onClick={() => updateData({ gender: 'male' })}
          >
            ♂ 男
          </button>
          <button
            className={`gender-btn ${data.gender === 'female' ? 'selected' : ''}`}
            onClick={() => updateData({ gender: 'female' })}
          >
            ♀ 女
          </button>
        </div>
      </div>

      <div className="step-section">
        <div className="step-label">年龄</div>
        <div className="input-with-unit">
          <input
            className="pixel-input"
            type="number"
            placeholder="请输入年龄"
            value={data.age}
            onChange={(e) => updateData({ age: e.target.value })}
            min={10}
            max={100}
          />
          <span className="target-unit">岁</span>
        </div>
      </div>

      <div className="step-section">
        <div className="step-label">身高</div>
        <div className="input-with-unit">
          <input
            className="pixel-input"
            type="number"
            placeholder="请输入身高"
            value={data.heightCm}
            onChange={(e) => updateData({ heightCm: e.target.value })}
            min={100}
            max={250}
          />
          <span className="target-unit">cm</span>
        </div>
      </div>

      <div className="step-section">
        <div className="step-label">体重</div>
        <div className="input-with-unit">
          <input
            className="pixel-input"
            type="number"
            placeholder="请输入体重"
            value={data.weightKg}
            onChange={(e) => updateData({ weightKg: e.target.value })}
            min={30}
            max={200}
          />
          <span className="target-unit">kg</span>
        </div>
      </div>

      {bmi && (
        <div className="bmi-display">
          <div className="bmi-value">{bmi}</div>
          <div className="bmi-label">BMI 指数</div>
          <div className="bmi-category">{getBMICategory(bmi)}</div>
        </div>
      )}
    </div>
  );
}
