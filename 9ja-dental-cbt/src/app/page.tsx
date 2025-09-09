"use client";
import { motion } from "framer-motion";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import PricingPlans from "./components/PricingPlans";
import Footer from "@/app/components/Footer";
import AnimatedBackground from "./components/AnimatedBackground";

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function Page() {
  return (
    <motion.div
      className="relative min-h-screen overflow-hidden"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <AnimatedBackground />
      <Header />
      <motion.div variants={sectionVariants}>
        <Hero />
      </motion.div>
      <motion.div variants={sectionVariants}>
        <Features />
      </motion.div>
      <motion.div variants={sectionVariants}>
        <PricingPlans />
      </motion.div>
      <motion.div variants={sectionVariants}>
        <Footer />
      </motion.div>
    </motion.div>
  );
}
