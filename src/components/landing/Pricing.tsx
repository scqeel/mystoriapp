import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    price: "Free",
    desc: "Perfect to try things out",
    features: ["3 galleries", "1 portfolio", "Basic analytics", "Watermarked downloads"],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Pro",
    price: "$19/mo",
    desc: "For working photographers",
    features: ["Unlimited galleries", "Custom branding", "Password protection", "HD downloads", "Priority support"],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Studio",
    price: "$49/mo",
    desc: "For studios & teams",
    features: ["Everything in Pro", "Team access", "Custom domain", "Advanced analytics", "API access"],
    cta: "Contact Us",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Simple pricing</h2>
          <p className="text-muted-foreground text-lg">No hidden fees. Cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-xl p-8 border ${
                p.featured
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-background"
              }`}
            >
              <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{p.desc}</p>
              <div className="text-3xl font-semibold mb-6">{p.price}</div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={p.featured ? "default" : "outline"}
                asChild
              >
                <Link to="/signup">{p.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
