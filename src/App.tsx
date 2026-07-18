import { Routes, Route } from 'react-router-dom';
import Menu from './pages/Menu';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Menu />} />
    </Routes>
  );
}