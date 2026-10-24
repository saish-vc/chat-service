import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Input from "./Input";
import Button from "./Button";
import AvatarPicker from "./AvatarPicker";
import { z } from "zod";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatarColor: z.string(),
});

export default function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarColor, setAvatarColor] = useState("#6366f1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = signupSchema.safeParse({ username, email, password, avatarColor });
    if (!result.success) {
      const errs = {};
      result.error.errors.forEach((e) => {
        errs[e.path[0]] = e.message;
      });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await signup({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        avatarColor,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Username"
        placeholder="Choose a username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          setFieldErrors((p) => ({ ...p, username: "" }));
        }}
        error={fieldErrors.username}
        autoComplete="username"
        autoFocus
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setFieldErrors((p) => ({ ...p, email: "" }));
        }}
        error={fieldErrors.email}
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        placeholder="At least 6 characters"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setFieldErrors((p) => ({ ...p, password: "" }));
        }}
        error={fieldErrors.password}
        autoComplete="new-password"
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-secondary)]">Avatar color</label>
        <AvatarPicker value={avatarColor} onChange={setAvatarColor} />
      </div>
      {error && (
        <div className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <Button type="submit" loading={loading} className="w-full">
        Create account
      </Button>
    </form>
  );
}
