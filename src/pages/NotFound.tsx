import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center px-6 bg-background">
    <div className="text-center">
      <Camera className="h-16 w-16 text-primary/30 mx-auto mb-6" />
      <h1 className="text-6xl font-bold text-primary/20 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
      <p className="text-muted-foreground mb-8">
        This shot didn't develop. Let's get you back on track.
      </p>
      <Button asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  </div>
);

export default NotFound;
