import { motion } from "framer-motion";

export default function AuthLayout({ title, children }) {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl"
      >
        <h2 className="mb-6 text-center text-3xl font-black">{title}</h2>
        {children}
      </motion.div>
    </main>
  );
}
