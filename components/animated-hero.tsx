"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AnimatedHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section className="relative w-full h-[60vh] flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.2, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          backgroundImage: `url("/placeholder.svg?height=800&width=1200")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-black opacity-50 z-10" />

      <motion.div
        className="relative z-20 text-center px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg"
          variants={itemVariants}
        >
          Find Your Dream Home in Kenya
        </motion.h1>
        <motion.p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md" variants={itemVariants}>
          Connecting you with the best rental properties and real estate opportunities across Kenya.
        </motion.p>
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={itemVariants}>
          <Link href="/listings">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 shadow-lg">
              Browse Properties
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-700 shadow-lg bg-transparent"
            >
              List Your Property
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
