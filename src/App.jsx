import { BrowserRouter, Routes, Route } from "react-router-dom";
import PanditAmanBhatore from "./PanditAmanBhatore";
import VastuVideoGuidancePage from "./VastuVideoGuidancePage";
import KundaliCheckPage from "./KundaliCheck";
import ConsultationBookingPage from "./ConsultationBooking";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                       element={<PanditAmanBhatore />} />
        <Route path="/video-guidance"         element={<VastuVideoGuidancePage />} />
        <Route path="/kundali-check"          element={<KundaliCheckPage />} />
        <Route path="/consultation-booking"   element={<ConsultationBookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
