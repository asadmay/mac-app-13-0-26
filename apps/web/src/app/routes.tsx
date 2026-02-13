import { createHashRouter } from 'react-router-dom';
import { HomeScreen } from '@/screens/HomeScreen';
import { DailyScreen } from '@/screens/DailyScreen';
import { JournalScreen } from '@/screens/JournalScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { PaywallScreen } from '@/screens/PaywallScreen';
import { ShareScreen } from '@/screens/ShareScreen';
import SpreadPage from '@/pages/SpreadPage';
import PracticesPage from '@/pages/PracticesPage';
import JournalPage from '@/pages/JournalPage';
import HistoryPage from '@/pages/HistoryPage';

export const router = createHashRouter([
  // v2 экраны
  { path: '/', element: <HomeScreen /> },
  { path: '/home', element: <HomeScreen /> },
  { path: '/daily', element: <DailyScreen /> },
  { path: '/journal-simple', element: <JournalScreen /> },
  { path: '/profile', element: <ProfileScreen /> },
  { path: '/paywall', element: <PaywallScreen /> },
  { path: '/share', element: <ShareScreen /> },
  
  // v1 страницы (МАК-практика)
  { path: '/spread', element: <SpreadPage practicePreset={null} onPresetConsumed={() => {}} /> },
  { path: '/practices', element: <PracticesPage onStart={(preset) => {
    // Можно добавить навигацию на spread с preset
    console.log('Practice started:', preset);
  }} /> },
  { path: '/journal', element: <JournalPage /> },
  { path: '/history', element: <HistoryPage /> },
  
  { path: '*', element: <HomeScreen /> },
]);