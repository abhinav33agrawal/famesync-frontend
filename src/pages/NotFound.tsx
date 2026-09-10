import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-foreground mb-4">404</h1>
          <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button
            className="bg-primary"
            onClick={() => navigate('/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
