import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeRoute from './routes/home';
import RoomRoute from './routes/room';
import JoinRoute from './routes/join';
import TermsRoute from './routes/terms';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/room/:roomId" element={<RoomRoute />} />
        <Route path="/join/:roomId" element={<JoinRoute />} />
        <Route path="/terms" element={<TermsRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
