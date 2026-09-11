import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Rise } from "@/components/motion";
import { ArrowLeft, Home } from "lucide-react";

/* Removed: the scale-in entrance and the hand-rolled `text-9xl` numeral. */

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="container flex min-h-[70vh] items-center py-20">
      <Rise className="max-w-[46ch]">
        <div className="num text-display-1 leading-none text-primary">404</div>
        <h1 className="mt-7 font-display text-display-2">Page Not Found</h1>
        <p className="mt-5 max-w-[46ch] leading-relaxed text-muted-foreground">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Button size="lg" onClick={() => navigate("/")}>
            <Home />
            Go Home
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft />
            Go Back
          </Button>
        </div>
      </Rise>
    </div>
  );
};

export default NotFound;
