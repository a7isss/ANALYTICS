import { motion } from 'framer-motion';

interface MetricCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    trend?: 'up' | 'down' | 'neutral';
    delay?: number;
}

export const MetricCard = ({ label, value, subValue, trend, delay = 0 }: MetricCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/80 transition-all group"
        >
            <div className="text-slate-400 text-sm mb-2 font-medium">{label}</div>
            <div className="text-3xl font-bold text-white mb-1 group-hover:text-brand-400 transition-colors">
                {value}
            </div>
            {subValue && (
                <div className={`text-xs ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-500'}`}>
                    {subValue}
                </div>
            )}
        </motion.div>
    );
};
