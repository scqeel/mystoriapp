import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Ama Mensah",
    role: "Wedding Photographer",
    quote: "MyStori completely changed how I deliver photos. My clients are always blown away by the gallery experience.",
  },
  {
    name: "Kwame Asante",
    role: "Portrait Photographer",
    quote: "The portfolio builder is incredible. I got 3 new bookings within a week of launching mine.",
  },
  {
    name: "Nana Adjei",
    role: "Event Photographer",
    quote: "Password-protected galleries with favorites and comments? My clients love it. So professional.",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Loved by photographers
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-background rounded-xl p-8 border border-border"
            >
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">
                "{t.quote}"
              </p>
              <div>
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
