import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../config/api";
import { loginSuccess } from "../redux/slices/auth-slice/authSlice";
import { useAppDispatch } from "../redux/store";

export function Signup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", confirmPassword: "",
    emergencyName: "", emergencyPhone: "", inviteCode: ""
  });
  const [formErrors, setFormErrors] = useState<{ confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setFormErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(apiUrl("/api/auth/register"), {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        emergencyContactNumber: formData.emergencyPhone || undefined,
        emergencyContactEnabled: !!formData.emergencyPhone,
        inviteCode: formData.inviteCode || undefined,
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      dispatch(loginSuccess({ token, user }));
      // Role-based redirect after signup
      if (user.role === "PRACTITIONER") navigate("/practitioner");
      else if (user.role === "VOLUNTEER") navigate("/volunteer");
      else navigate("/home");
    } catch (err: any) {
      const msg = err.response?.data?.error || "Registration failed. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-purple-600 mb-2">MindLink</h1>
          <p className="text-gray-600">Create your account to get started.</p>
        </div>

        <div className="bg-white rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                id="username" name="username" type="text"
                value={formData.username} onChange={handleInputChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                id="email" name="email" type="email"
                value={formData.email} onChange={handleInputChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                id="password" name="password" type="password"
                value={formData.password} onChange={handleInputChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Create a password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                id="confirmPassword" name="confirmPassword" type="password"
                value={formData.confirmPassword} onChange={handleInputChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirm your password"
              />
            </div>

            {/* Emergency Contact — optional */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Emergency Contact <span className="text-gray-400 font-normal">(Optional)</span></p>
              <p className="text-xs text-gray-400 mb-3">If your wellbeing signals deteriorate significantly, MindLink can notify a trusted contact. You stay in full control.</p>
              <div className="space-y-3">
                <input
                  id="emergencyName" name="emergencyName" type="text"
                  value={formData.emergencyName} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  placeholder="Contact name (e.g. Mum, John)"
                />
                <input
                  id="emergencyPhone" name="emergencyPhone" type="tel"
                  value={formData.emergencyPhone} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  placeholder="Phone number"
                />
              </div>
            </div>

            {/* Staff invite code — only needed for practitioners/volunteers */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Staff Invite Code <span className="text-gray-400 font-normal">(Optional)</span></p>
              <p className="text-xs text-gray-400 mb-3">Practitioners and volunteers enter their provided invite code here to activate the correct access level.</p>
              <input
                id="inviteCode" name="inviteCode" type="text"
                value={formData.inviteCode} onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono uppercase tracking-wider"
                placeholder="MINDLINK-XXXX-2024"
              />
            </div>

            <label className="flex items-start">
              <input type="checkbox" className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" required />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <Link to="/terms" className="text-purple-600 hover:text-purple-700">Terms of Service</Link>{" "}and{" "}
                <Link to="/privacy" className="text-purple-600 hover:text-purple-700">Privacy Policy</Link>
              </span>
            </label>

            {formErrors.confirmPassword && <p className="text-red-500 text-sm">{formErrors.confirmPassword}</p>}
            {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

            <button
              type="submit" disabled={loading}
              className={`w-full py-2 rounded-lg ${loading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-500"} text-white transition-all duration-200`}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-600 font-medium hover:text-purple-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
