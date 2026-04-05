import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CTA } from "@/components/landing/CTA";
import { motion } from "framer-motion";
import { Camera, Heart, Zap } from "lucide-react";

const ForPhotographers = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-semibold mb-6">
            Made for <span className="text-primary">your</span> craft
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Whether you shoot weddings, portraits, or events — MyStori gives you a professional delivery and booking experience that matches your talent.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: Camera, title: "Wedding Photographers", desc: "Deliver hundreds of photos beautifully. Clients pick favorites, leave notes, download in full resolution." },
            { icon: Heart, title: "Portrait Photographers", desc: "Showcase your best work on a branded portfolio and accept bookings directly." },
            { icon: Zap, title: "Event Photographers", desc: "Fast turnaround, bulk upload, instant sharing. Impress corporate clients." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-muted/30 rounded-xl p-8 border border-border"
            >
              <item.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-medium text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    <CTA />
    <Footer />
  </div>
);

export default ForPhotographers;
