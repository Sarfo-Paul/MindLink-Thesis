import { useNotification } from "../shared/NotificationProvider";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import axios from "axios";
import { apiUrl } from "../../config/api";
import { useState } from "react";

export function SupportRequest() {
  const { info, error } = useNotification();
  const { user, token } = useSelector((state: RootState) => state.auth!);
  const [loading, setLoading] = useState(false);

  const handleSupport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (user?.userId) {
        await axios.post(apiUrl("/api/support"), {
          requestType: "Priority Support"
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      info(
        "Support Request Sent",
        "Your account has been flagged for priority support. A counsellor will reach out shortly."
      );
    } catch {
      error("Request Failed", "Could not send support request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-purple-600 rounded-xl p-5 shadow-sm cursor-pointer hover:bg-purple-700 transition-colors"
      onClick={handleSupport}
    >
      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </div>
      <h3 className="font-semibold text-white mb-1">Talk to Someone</h3>
      <p className="text-purple-100 text-sm">Our volunteers and counselors are here for you, anytime.</p>
    </div>
  );
}
