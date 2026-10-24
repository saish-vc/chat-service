import { Link } from "react-router-dom";
import Button from "../components/Button";

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)] p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4 opacity-30">404</div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Page not found
        </h1>
        <p className="text-[var(--text-secondary)] mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="inline-block">
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
