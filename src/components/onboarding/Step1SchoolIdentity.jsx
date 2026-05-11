import { useOnboarding } from '../../hooks/OnboardingContext';

export default function Step1SchoolIdentity() {
  const { data, updateData } = useOnboarding();

  return (
    <div className="page-enter">
      <div className="step-section">
        <div className="step-label">学校</div>
        <div className="step-description">输入学校名称，支持模糊匹配</div>
        <input
          className="pixel-input"
          type="text"
          placeholder="请输入学校名称"
          value={data.school}
          onChange={(e) => updateData({ school: e.target.value })}
          maxLength={30}
        />
      </div>

      <div className="step-section">
        <div className="step-label">学号</div>
        <div className="step-description">用于唯一身份校验</div>
        <input
          className="pixel-input"
          type="text"
          inputMode="numeric"
          placeholder="请输入学号"
          value={data.studentId}
          onChange={(e) => updateData({ studentId: e.target.value })}
          maxLength={20}
        />
      </div>

      <div className="step-section">
        <div className="step-label">昵称</div>
        <div className="step-description">取一个酷炫的名字吧（限12个字符）</div>
        <input
          className="pixel-input"
          type="text"
          placeholder="请输入昵称"
          value={data.nickname}
          onChange={(e) => updateData({ nickname: e.target.value })}
          maxLength={12}
        />
        <div style={{ textAlign: 'right', fontSize: '10px', color: '#A09080', marginTop: 4 }}>
          {data.nickname.length}/12
        </div>
      </div>
    </div>
  );
}
