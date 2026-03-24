import { motion } from 'framer-motion';
import type { RevenueData } from '../types';

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Revenue Overview
      </h3>
      
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((item, index) => {
          const height = (item.revenue / maxRevenue) * 100;
          return (
            <motion.div
              key={item.month}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="flex-1 flex flex-col items-center"
            >
              <div
                className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-md hover:from-primary-700 hover:to-primary-500 transition-colors cursor-pointer group relative"
                style={{ height: '100%' }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ₹{item.revenue.toLocaleString()}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="flex justify-between mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        {data.map((item) => (
          <span
            key={item.month}
            className="text-xs text-gray-500 dark:text-gray-400 flex-1 text-center"
          >
            {item.month}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
