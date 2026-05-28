'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}

const stats: Stat[] = [
  { value: 10000, suffix: '+', label: 'Total Pesanan', icon: '📦' },
  { value: 5000, suffix: '+', label: 'Pelanggan Puas', icon: '😊' },
  { value: 50, suffix: '+', label: 'Produk Digital', icon: '🛍️' },
  { value: 99, suffix: '%', label: 'Kepuasan Pelanggan', icon: '⭐' },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="font-display font-bold text-3xl md:text-4xl gradient-text">
      {count.toLocaleString('id-ID')}{suffix}
    </span>
  );
}

export function StatsCounter() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="glass rounded-2xl p-6 text-center border border-white/5 hover:border-electric-600/20 transition-all group"
        >
          <div className="text-3xl mb-3">{stat.icon}</div>
          <CountUp target={stat.value} suffix={stat.suffix} />
          <p className="text-white/50 text-sm mt-2">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
