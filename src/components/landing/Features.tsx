import { motion } from "framer-motion";
import { Image, Palette, CalendarCheck, Heart, MessageSquare, Shield } from "lucide-react";

const features = [
  {
    icon: Image,
    title: "Beautiful Client Galleries",
    description: "Deliver edited photos via stunning, password-protected mini-websites your clients will love.",
  },
  {
    icon: Palette,
    title: "Branded Portfolio",
    description: "Build your own portfolio website with your colors, logo, and a built-in booking form.",
  },
  {
    icon: CalendarCheck,
    title: "Seamless Bookings",
    description: "Receive booking requests directly through your portfolio with instant notifications.",
  },
  {
    icon: Heart,
    title: "Client Favorites",
    description: "Clients can favorite images, leave comments, and interact with their gallery in real time.",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Comments",
    description: "Threaded conversations on each photo. Stay connected with your clients effortlessly.",
  },
  {
    icon: Shield,
    title: "Password Protection",
    description: "Keep galleries private with password gates and optional expiry dates.",
  },
];

export function Features() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Everything you need
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            One platform to deliver, showcase, and book — designed exclusively for photographers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-background rounded-xl p-8 border border-border hover:shadow-lg hover:shadow-primary/5 transition-shadow"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
