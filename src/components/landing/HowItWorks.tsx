import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Upload your photos", desc: "Drag & drop your edited images into a new gallery." },
  { num: "02", title: "Customize & share", desc: "Add your branding, set a password, and share the link with your client." },
  { num: "03", title: "Clients interact", desc: "They favorite photos, leave comments, and download their selections." },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">How it works</h2>
          <p className="text-muted-foreground text-lg">Three simple steps to deliver like a pro.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-primary/20 mb-4">{s.num}</div>
              <h3 className="font-medium text-lg mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
