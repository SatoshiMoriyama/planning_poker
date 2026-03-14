import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeRoute from './routes/home';
import RoomRoute from './routes/room';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/room/:roomId" element={<RoomRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
