import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsServices from './components/TermsServices';
import DataDeletion from './components/DataDeletion';
import Support from './components/Support';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/terms-of-service" element={<TermsServices />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/data-deletion" element={<DataDeletion />} />
        <Route path="/support" element={<Support />} />
      </Routes>
    </BrowserRouter>
  );
}
