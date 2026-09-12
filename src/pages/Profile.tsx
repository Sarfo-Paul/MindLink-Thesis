import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../redux/store";
import { useNotification } from "../components/shared/NotificationProvider";
import axios from "axios";
import { apiUrl } from "../config/api";
import { loginSuccess } from "../redux/slices/auth-slice/authSlice";

export function Profile() {
  const { user, token } = useSelector((state: RootState) => state.auth!);
  const dispatch = useDispatch();
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    preferredLanguage: user?.preferredLanguage || "en",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!token) {
      error("Update Failed", "Please sign in again.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.put(apiUrl("/api/user/profile"), {
        username: formData.username,
        phone: formData.phone,
        preferredLanguage: formData.preferredLanguage,
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      // Update local storage and redux
      dispatch(loginSuccess({ token, user: res.data.user }));
      success("Profile Updated", "Your profile details have been saved.");
    } catch {
      error("Update Failed", "Could not save your changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>
      <div className="bg-white rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-purple-200 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-semibold text-2xl">
              {user?.username?.charAt(0).toUpperCase() || "M"}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.username || "MindLink User"}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email (Cannot be changed)</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Application Language</label>
            <select 
              name="preferredLanguage" 
              value={formData.preferredLanguage} 
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
          <div className="pt-4">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

