import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const posts = [
  {
    slug: "deliver-photos-like-a-pro",
    title: "How to Deliver Photos Like a Pro",
    excerpt: "First impressions matter. Learn how a beautiful gallery experience sets you apart from the competition.",
    date: "Apr 2, 2026",
  },
  {
    slug: "build-photography-portfolio",
    title: "Building a Portfolio That Books Clients",
    excerpt: "Your portfolio is your storefront. Here's how to make it work for you around the clock.",
    date: "Mar 28, 2026",
  },
  {
    slug: "client-communication-tips",
    title: "5 Client Communication Tips for Photographers",
    excerpt: "From initial inquiry to final delivery, communication is everything. Here's how to nail it.",
    date: "Mar 20, 2026",
  },
];

const Blog = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-semibold mb-4">Blog</h1>
          <p className="text-muted-foreground text-lg mb-12">Tips, guides, and inspiration for photographers.</p>

          <div className="space-y-10">
            {posts.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border-b border-border pb-10 last:border-0"
              >
                <p className="text-sm text-muted-foreground mb-2">{post.date}</p>
                <h2 className="text-xl font-medium mb-2 hover:text-primary transition-colors cursor-pointer">
                  {post.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{post.excerpt}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Blog;
