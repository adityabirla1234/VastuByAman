import { BrowserRouter, Routes, Route } from "react-router-dom";
import PanditAmanBhatore from "./PanditAmanBhatore";
import VastuVideoGuidancePage from "./VastuVideoGuidancePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<PanditAmanBhatore />} />
        <Route path="/video-guidance" element={<VastuVideoGuidancePage />} />
      </Routes>
    </BrowserRouter>
  );
}