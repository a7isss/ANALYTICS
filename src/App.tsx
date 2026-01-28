import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, TrendingUp, MapPin, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { insights } from './data/insights';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  const currentSlide = insights[currentIndex];

  const renderChart = () => {
    if (currentSlide.chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentSlide.data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#94a3b8" />
            <YAxis dataKey="name" type="category" stroke="#fff" width={100} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
            <Legend />
            <Bar dataKey="spend" name="متوسط الإنفاق (ريال)" fill="#10b981" radius={[0, 4, 4, 0]} />
            <Bar dataKey="visitors" name="عدد الزوار (بالآلاف)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (currentSlide.chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={currentSlide.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {currentSlide.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
          </RePieChart>
        </ResponsiveContainer>
      );
    }

    if (currentSlide.chartType === 'scatter') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" dataKey="x" name="حجم التداول" unit=" صفقة" stroke="#94a3b8" />
            <YAxis type="number" dataKey="y" name="سعر المتر" unit=" ريال" stroke="#94a3b8" />
            <ZAxis type="number" dataKey="size" range={[100, 1000]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
            <Scatter name="الأحياء" data={currentSlide.data} fill="#8884d8">
              {currentSlide.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 font-sans overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px]" />
      </div>

      <header className="absolute top-8 right-8 flex items-center gap-4 z-20">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-900 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
          <BarChart3 className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold">مرصد حائل للبيانات</h1>
          <p className="text-slate-400 text-sm">مهمة المحلل الاستراتيجي</p>
        </div>
      </header>

      <main className="w-full max-w-6xl z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            {/* Content Section */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-brand-500 text-sm">
                  {currentSlide.type === 'hero' ? <MapPin size={14} /> : <TrendingUp size={14} />}
                  <span>{currentSlide.subtitle}</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  {currentSlide.title}
                </h2>
                <p className="text-lg text-slate-300 leading-relaxed">
                  {currentSlide.description}
                </p>
              </div>

              {currentSlide.kpi && (
                <div className="grid grid-cols-2 gap-4">
                  {currentSlide.kpi.map((k, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                      <div className="text-slate-400 text-sm mb-1">{k.label}</div>
                      <div className="text-2xl font-bold text-white">{k.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {currentSlide.type === 'hero' && (
                <button onClick={nextSlide} className="px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 transition-all flex items-center gap-3">
                  ابدأ العرض <ChevronLeft />
                </button>
              )}
            </div>

            {/* Visual Section */}
            <div className="lg:col-span-7 h-[500px] bg-slate-800/30 rounded-3xl border border-slate-700/50 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden group">
              {currentSlide.type === 'hero' ? (
                <div className="w-full h-full flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-transparent" />
                  <MapPin className="w-32 h-32 text-slate-600 group-hover:text-brand-500 transition-colors duration-500" />
                  <div className="absolute bottom-10 text-center w-full">
                    <p className="text-slate-500">استخدام مفاتيح الأسهم للتنقل</p>
                  </div>
                </div>
              ) : (
                renderChart()
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="absolute bottom-8 w-full max-w-6xl flex items-center justify-between z-20 px-8 lg:px-0">
        <div className="flex gap-2">
          {insights.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-brand-500' : 'w-2 bg-slate-700'}`}
            />
          ))}
        </div>
        <div className="flex gap-4">
          <button onClick={prevSlide} className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700">
            <ChevronRight />
          </button>
          <button onClick={nextSlide} className="p-3 rounded-full bg-brand-500 hover:bg-brand-400 text-white transition-colors shadow-lg shadow-brand-500/20">
            <ChevronLeft />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
