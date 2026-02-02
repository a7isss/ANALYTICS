import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ChartContainerProps {
    title: string;
    children: ReactNode;
}

export const ChartContainer = ({ title, children }: ChartContainerProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="h-[500px] bg-slate-800/30 rounded-3xl border border-slate-700/50 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden flex flex-col"
        >
            <h3 className="text-lg font-bold text-slate-300 mb-4 px-2 border-r-4 border-brand-500 mr-2">
                {title}
            </h3>
            <div className="flex-1 w-full relative z-10">
                {children}
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
    );
};
