import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import PhoneFrame from './components/PhoneFrame';
import OnboardingContainer from './components/onboarding/OnboardingContainer';
import Step1SchoolIdentity from './components/onboarding/Step1SchoolIdentity';
import Step2ActivityLevel from './components/onboarding/Step2ActivityLevel';
import Step3ExercisePlan from './components/onboarding/Step3ExercisePlan';
import Step4BodyData from './components/onboarding/Step4BodyData';
import Step5ReceivePet from './components/onboarding/Step5ReceivePet';
import MainLayout from './components/tabs/MainLayout';
import HomePage from './components/tabs/HomePage';
import RecordPage from './components/tabs/RecordPage';
import PetPage from './components/tabs/PetPage';
import SocialPage from './components/tabs/SocialPage';
import ProfilePage from './components/tabs/ProfilePage';
import BattlePage from './components/battle/BattlePage';
import ExplorePage from './components/explore/ExplorePage';
import ChatPage from './components/chat/ChatPage';
import CreatePostPage from './components/post/CreatePostPage';

export default function App() {
  return (
    <AppProvider>
      <PhoneFrame>
        <div className="app-container">
          <Routes>
            {/* Onboarding */}
            <Route path="/onboarding" element={<OnboardingContainer />}>
              <Route index element={<Navigate to="/onboarding/step/1" replace />} />
              <Route path="step/1" element={<Step1SchoolIdentity />} />
              <Route path="step/2" element={<Step2ActivityLevel />} />
              <Route path="step/3" element={<Step3ExercisePlan />} />
              <Route path="step/4" element={<Step4BodyData />} />
              <Route path="step/5" element={<Step5ReceivePet />} />
            </Route>

            {/* Main tabs with TabBar */}
            <Route element={<MainLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/record" element={<RecordPage />} />
              <Route path="/pet" element={<PetPage />} />
              <Route path="/social" element={<SocialPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Sub pages without TabBar */}
            <Route path="/battle/:type" element={<BattlePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/chat/:friendId" element={<ChatPage />} />
            <Route path="/create-post" element={<CreatePostPage />} />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/onboarding/step/1" replace />} />
          </Routes>
        </div>
      </PhoneFrame>
    </AppProvider>
  );
}
