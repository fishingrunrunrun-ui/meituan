import { Outlet } from 'react-router-dom';
import TabBar from './TabBar';

export default function MainLayout() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}
