import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  Phone,
  Mail,
  MapPin,
  School,
  BookOpen,
  Star,
  Home,
  Lock,
} from "lucide-react";
import { loginWithGoogle, registerAccount } from "../lib/auth";

// Available registration roles
const roles = [
  {
    name: "Director / Principal",
    path: "/director",
    role: "director",
    icon: Home,
    subtitle: "Bring HiPATH to my school",
  },
  {
    name: "Teacher",
    path: "/teacher",
    role: "teacher",
    icon: BookOpen,
    subtitle: "Try a free chapter",
  },
  
  {
    name: "Other",
    path: "/other",
    role: "other",
    icon: Star,
    subtitle: "Parents, partners & more",
  },
];

function FormInput({
  label,
  name,
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
  type = "text",
  required = false,
  autoComplete,
  pattern,
  maxLength,
  inputMode,
}) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <div className="input-box">
        <Icon size={20} />
        <input
          id={name}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          pattern={pattern}
          maxLength={maxLength}
          inputMode={inputMode}
        />
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

function RegistrationForm({ role = "director" }) {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(role);
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "",
    school: "",
    udise: "",
    subject: "",
    interest: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return undefined;

    let cancelled = false;
    const initializeGoogleSignIn = () => {
      if (cancelled || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setSubmitError("");
          try {
            await loginWithGoogle(credential);
            navigate("/dashboard");
          } catch (googleError) {
            setSubmitError(googleError.message);
          }
        },
      });
      const button = document.getElementById("registration-google-signin-button");
      if (button) window.google.accounts.id.renderButton(button, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 360,
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
      return () => { cancelled = true; };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    script.onerror = () => setSubmitError("Could not load Google sign-in. Check your internet connection and try again.");
    document.head.appendChild(script);
    return () => { cancelled = true; };
  }, [navigate]);

  // Update form fields
  const updateForm = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Handle role selection
  const handleRoleChange = (item) => {
    setSelectedRole(item.role);
    navigate(item.path);
  };

  // Submit registration form
  const submitForm = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Please enter your name";
    }

    if (!/^[0-9]{10}$/.test(form.mobile.trim())) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    const normalizedEmail = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@.]+$/.test(normalizedEmail)) {
      newErrors.email = "Enter a valid email address";
    }

    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!form.city.trim()) {
      newErrors.city = "Please enter your city";
    }

    if (["director", "teacher"].includes(selectedRole) && !form.school.trim()) {
      newErrors.school = "Please enter your school name";
    }

    if (selectedRole === "teacher" && !form.subject.trim()) {
      newErrors.subject = "Please enter your subject or grade";
    }

    if (
      selectedRole === "director" &&
      form.udise &&
      !/^[0-9]{11}$/.test(form.udise)
    ) {
      newErrors.udise = "UDISE code must contain 11 digits";
    }

    if (selectedRole === "other" && !form.description.trim()) {
      newErrors.description = "Please select your role";
    }

    if (!form.interest.trim()) {
      newErrors.interest = "Please select your interest";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await registerAccount({
        ...form,
        mobile: form.mobile.trim(),
        email: normalizedEmail,
        password,
        role: selectedRole,
      });
      navigate("/dashboard");
    } catch (registrationError) {
      setSubmitError(registrationError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSchoolRole = selectedRole === "director";

  return (
    <div className="registration-container">
      <div className="registration-card">

        {/* Logo */}
        <div className="logo">H</div>

        <p className="subtitle">WELCOME TO HiPATH</p>

        <h1>Let's get started</h1>

        <p className="description">
          Tell us a little about yourself so we can help you get started.
        </p>

        {/* Role Selection */}
        <div className="role-grid">
          {roles.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.name}
                onClick={() => handleRoleChange(item)}
                className={`role-card ${
                  selectedRole === item.role ? "selected" : ""
                }`}
              >
                <Icon size={24} />

                <div>
                  <strong>{item.name}</strong>
                  <small>{item.subtitle}</small>
                </div>
              </button>
            );
          })}
        </div>

        {/* Registration Form */}
        <form onSubmit={submitForm}>

          {/* Other Role Selection */}
          {selectedRole === "other" && (
            <div className="form-group">
              <label htmlFor="description">
                Which best describes you?
              </label>

              <select
                id="description"
                name="description"
                value={form.description}
                onChange={updateForm}
                required
              >
                <option value="">Choose one</option>
                <option value="Parent">Parent</option>
                <option value="Partner">Partner</option>
                <option value="Education Consultant">
                  Education Consultant
                </option>
                <option value="Other">Other</option>
              </select>

              {errors.description && (
                <p className="error">{errors.description}</p>
              )}
            </div>
          )}

          {/* Name */}
          <FormInput
            label="Your name"
            name="name"
            placeholder="Full name"
            icon={User}
            value={form.name}
            onChange={updateForm}
            error={errors.name}
            required
            autoComplete="name"
          />

          {/* Mobile */}
          <FormInput
            label="Mobile number"
            name="mobile"
            placeholder="10-digit mobile number"
            icon={Phone}
            value={form.mobile}
            onChange={updateForm}
            error={errors.mobile}
            type="tel"
            required
            pattern="[0-9]{10}"
            maxLength={10}
            inputMode="numeric"
          />

          {/* Email */}
          <FormInput
            label="Email ID"
            name="email"
            placeholder="name@example.com"
            icon={Mail}
            value={form.email}
            onChange={updateForm}
            error={errors.email}
            type="email"
            required
            autoComplete="email"
          />

          <div className="form-group">
            <label htmlFor="registration-password">Password</label>
            <div className="input-box">
              <Lock size={20} />
              <input
                id="registration-password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((previous) => ({ ...previous, password: "" }));
                }}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          {/* City */}
          <FormInput
            label="City"
            name="city"
            placeholder="Enter your city"
            icon={MapPin}
            value={form.city}
            onChange={updateForm}
            error={errors.city}
            required
          />

          {/* Director Fields */}
          {isSchoolRole && (
            <>
              {selectedRole === "director" && (
                <FormInput
                  label="School UDISE Code"
                  name="udise"
                  placeholder="11-digit UDISE code"
                  icon={School}
                  value={form.udise}
                  onChange={updateForm}
                  error={errors.udise}
                  pattern="[0-9]{11}"
                  maxLength={11}
                  inputMode="numeric"
                />
              )}

              <FormInput
                label="School name"
                name="school"
                placeholder="School name and city"
                icon={Home}
                value={form.school}
                onChange={updateForm}
                error={errors.school}
                required
              />
            </>
          )}

          {/* Teacher Fields */}
          {selectedRole === "teacher" && (
            <>
              <FormInput
                label="School name"
                name="school"
                placeholder="Enter your school name"
                icon={School}
                value={form.school}
                onChange={updateForm}
                error={errors.school}
                required
              />

              <FormInput
                label="Subject / Grade"
                name="subject"
                placeholder="Mathematics, Science, etc."
                icon={BookOpen}
                value={form.subject}
                onChange={updateForm}
                error={errors.subject}
                required
              />
            </>
          )}

          {/* Interest */}
          <div className="form-group">
            <label htmlFor="interest">
              What matters most to you? *
            </label>

            <select
              id="interest"
              name="interest"
              value={form.interest}
              onChange={updateForm}
              required
            >
              <option value="">Tap to choose</option>
              <option value="Student Learning">Student Learning</option>
              <option value="Teaching Resources">Teaching Resources</option>
              <option value="School Management">School Management</option>
              <option value="Professional Development">
                Professional Development
              </option>
            </select>

            {errors.interest && (
              <p className="error">{errors.interest}</p>
            )}
          </div>

          {/* Submit Button */}
          {submitError && <p className="error" role="alert">{submitError}</p>}

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Let's go ✦"}
          </button>
        </form>

        <div className="registration-google-section">
          <p className="registration-google-label">Already have an account? Sign in with Google</p>
          <div id="registration-google-signin-button" className="google-signin-button" />
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <p className="google-setup-note">Google sign-in is unavailable until VITE_GOOGLE_CLIENT_ID is configured.</p>
          )}
        </div>

        {/* Login Link */}
        <p className="login-text">
          Already registered?{" "}
          <span onClick={() => navigate("/login")}>
            Log in
          </span>
        </p>

        <p className="explore">
          Just looking? Explore HiPATH →
        </p>

      </div>
    </div>
  );
}

export default RegistrationForm;
