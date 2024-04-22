import { motion } from 'framer-motion';
import React from 'react'

const AnimateSvg = () => {
  return (
    <div className="w-full flex items-center justify-around gap-4">
      {" "}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="100"
        height="100"
        viewBox="0 0 100 100"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="#4ade80"
          animate={{
            scale: [1, 1.2, 1] ,
            fill: ["#4ade80", "#ef4444"],
            transition: { duration: 2, repeat: Infinity },
          }} // Animate from green to red
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.svg>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="100"
        height="100"
        viewBox="0 0 100 100"
      >
        {/* Chat bubble path */}
        <motion.path
          d="M70,20a10,10 0 0,1 10,10v20a10,10 0 0,1 -10,10h-45l-15,15v-15h-15a10,10 0 0,1 -10,-10v-20a10,10 0 0,1 10,-10h55z"
          fill="transparent"
          stroke="blue" // Initial color
          strokeWidth="3"
          animate={{
            stroke: ["blue", "green", "red", "blue"],
            transition: { duration: 3, repeat: Infinity },
          }}
        />
      </motion.svg>
    </div>
  );
}

export default AnimateSvg