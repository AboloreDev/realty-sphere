import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import animationData from "../../../public/loader1.json";

const Loader = () => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-blue-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Lottie
          animationData={animationData}
          loop={true}
          className="w-24 h-24 mb-4"
        />

        {/* Branded Text */}
        <motion.h1
          className="text-2xl font-bold tracking-wide uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Nes<span className="font-extrabold text-black">tora</span>
        </motion.h1>
      </motion.div>
    </AnimatePresence>
  );
};

export default Loader;
