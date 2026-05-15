import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { PaletteProvider } from './context/PaletteContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './layout/Layout';
import Login from './pages/Login';
import PaletteSetup from './pages/PaletteSetup';
import Dashboard from './pages/Dashboard';
import ModelSetup from './pages/ModelSetup';
import Requests from './pages/Requests';
import Agreements from './pages/Agreements';
import Reviews from './pages/Reviews';
import Notifications from './pages/Notifications';

const App = () => (
  <HashRouter>
    <LanguageProvider>
      <PaletteProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/setup/palette" element={<PaletteSetup />} />

              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/model-setup" element={<ModelSetup />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/agreements" element={<Agreements />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </PaletteProvider>
    </LanguageProvider>
  </HashRouter>
);

export default App;
