import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Camera className="h-4 w-4" />
              Built for photographers
            </div>

            <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight mb-6">
              Deliver photos.
              <br />
              <span className="text-primary">Tell stories.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Beautiful client galleries, branded portfolio websites, and seamless
              booking — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-8 h-12" asChild>
                <Link to="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 h-12" asChild>
                <Link to="/features">See How It Works</Link>
              </Button>
            </div>
          </motion.div>

          {/* Hero image mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 md:mt-20"
          >
            <div className="relative rounded-2xl border border-border bg-muted/30 shadow-2xl shadow-primary/5 overflow-hidden aspect-video">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-border"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Live gallery preview
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
