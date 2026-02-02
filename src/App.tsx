import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, TrendingUp, MapPin, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { MetricCard } from './components/MetricCard';
import { ChartContainer } from './components/ChartContainer';
import rawData from './data/generated_insights.json';
import type { GeneratedInsights } from './types';

const data = rawData as GeneratedInsights;

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- SLIDE DEFINITIONS ---
  const slides = [
    {
      id: "intro",
      type: "hero",
      title: "نقلة البيانات الاستراتيجية",
      subtitle: "تقرير تدقيق الواقع: حائل 2025",
      description: `تحليل قائم على الأدلة المباشرة من ${data.realEstate.length} حي و ${data.infrastructure.reduce((acc, curr) => acc + curr.value, 0)} مخطط سكني.`,
      icon: <BarChart3 className="w-12 h-12 text-brand-500" />
    },
    {
      id: "infra",
      type: "chart",
      title: "صدمة البنية التحتية",
      subtitle: "تدقيق الخدمات للمخططات السكنية (2024)",
      description: "تحليل حالة الخدمات لـ 147 مخطط. الأغلبية العظمى (أكثر من 80%) تفتقر للخدمات الأساسية (الماء والكهرباء معاً)، مما يشكل خطراً على التنمية العمرانية المستدامة.",
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.infrastructure}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              paddingAngle={5}
              dataKey="value"
            >
              {data.infrastructure.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0)" />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      ),
      metrics: [
        { label: "مكتمل الخدمات", value: `${data.infrastructure.find(x => x.name === 'Fully Serviced')?.value || 0}`, subValue: "جاهز للسكن", trend: "neutral" },
        { label: "غير مخدوم", value: `${data.infrastructure.find(x => x.name === 'Unserviced')?.value || 0}`, subValue: "يحتاج تدخل عاجل", trend: "down" },
        { label: "نسبة العجز", value: `${Math.round((data.infrastructure.find(x => x.name === 'Unserviced')?.value || 0) / (data.infrastructure.reduce((a, b) => a + b.value, 0)) * 100)}%`, subValue: "مخططات بلا خدمات", trend: "down" }
      ]
    },
    {
      id: "gap_analysis",
      type: "chart",
      title: "فجوة الخدمات التاريخية",
      subtitle: "تحليل الانحدار (2017 - 2024)",
      description: `مقارنة مباشرة بين نتائج تعداد 2017 (${data.legacyAnalysis.villageStats.totalVillages} قرية) وواقع 2024. النتائج صادمة: نسبة العجز في خدمات المياه ارتفعت من ${data.legacyAnalysis.trend.legacy2017.waterDeficit}% إلى ${data.legacyAnalysis.trend.current2024.generalDeficit}% في المخططات الجديدة.`,
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[
              { name: '2017 (قرى)', deficit: data.legacyAnalysis.trend.legacy2017.waterDeficit, fill: '#3b82f6' },
              { name: '2024 (مخططات)', deficit: data.legacyAnalysis.trend.current2024.generalDeficit, fill: '#ef4444' }
            ]}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" tickFormatter={(val) => `${val}%`} />
            <Tooltip
              cursor={{ fill: '#334155', opacity: 0.2 }}
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              formatter={(val: any) => [`${val}%`, "نسبة العجز (بلا مياه)"]}
            />
            <Bar dataKey="deficit" radius={[8, 8, 0, 0]} barSize={60}>
              {
                [
                  { name: '2017 (قرى)', deficit: data.legacyAnalysis.trend.legacy2017.waterDeficit, fill: '#3b82f6' },
                  { name: '2024 (مخططات)', deficit: data.legacyAnalysis.trend.current2024.generalDeficit, fill: '#ef4444' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
      metrics: [
        { label: "عجز 2017", value: `${data.legacyAnalysis.trend.legacy2017.waterDeficit}%`, subValue: "قرى بلا شبكة مياه", trend: "neutral" },
        { label: "عجز 2024", value: `${data.legacyAnalysis.trend.current2024.generalDeficit}%`, subValue: "مخططات غير مخدومة", trend: "down" },
        { label: "الفجوة", value: `+${data.legacyAnalysis.trend.current2024.generalDeficit - data.legacyAnalysis.trend.legacy2017.waterDeficit}%`, subValue: "اتساع نطاق الحرمان", trend: "down" }
      ]
    },
    {
      id: "real_estate",
      type: "chart",
      title: "مصفوفة الاستثمار العقاري",
      subtitle: "تحليل الأسعار مقابل الحجم (الربع الثالث 2025)",
      description: "تحديد مناطق الفرص الحقيقية. الفقاعات الأكبر تمثل حجم تداول أعلى. نلاحظ تركز السيولة في أحياء النخبة (العليا) بينما أحياء النمو (أركان) تشهد نشاطاً عالياً بأسعار منخفضة.",
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" dataKey="transactionCount" name="عدد الصفقات" stroke="#94a3b8" />
            <YAxis type="number" dataKey="avgPriceM2" name="السعر (ريال/م)" stroke="#94a3b8" />
            <ZAxis type="number" dataKey="totalVolume" range={[50, 500]} name="حجم التداول" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              formatter={(value: any, name: any) => {
                if (name === "حجم التداول") return [(value / 1000000).toFixed(1) + ' مليون', name];
                return [value, name];
              }}
            />
            <Legend />
            <Scatter name="الأحياء" data={data.realEstate.slice(0, 50)} fill="#8884d8">
              {data.realEstate.slice(0, 50).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.tier === 'Elite' ? '#ef4444' : entry.tier === 'High' ? '#f59e0b' : '#3b82f6'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      ),
      metrics: [
        { label: "الأعلى سعراً (العليا)", value: `${data.realEstate.find(x => x.name.includes('العليا'))?.avgPriceM2 || 0} ريال`, subValue: "حي النخبة", trend: "up" },
        { label: "الأكثر نشاطاً (أجا)", value: `${data.realEstate.find(x => x.name.includes('أجا'))?.transactionCount || 0} صفقة`, subValue: "منطقة طلب عالي", trend: "up" },
        { label: "فرصة نمو (أركان)", value: `${data.realEstate.find(x => x.name.includes('أركان'))?.avgPriceM2 || 0} ريال`, subValue: "سعر منخفض / حجم عالي", trend: "neutral" }
      ]
    },
    {
      id: "real_estate_growth",
      type: "chart",
      title: "الذكاء الاستثماري",
      subtitle: "مؤشرات النمو والعائد (Q2 vs Q3)",
      description: `رصد السيولة الذكية: ${data.financials?.realEstateGrowth?.[0]?.name || 'حي'} يقود النمو بارتفاع ${data.financials?.realEstateGrowth?.[0]?.growth || 0}% في سعر المتر. في المقابل، نلحظ تراجع "عائد السائح" مما يستدعي إعادة النظر في جودة الإنفاق السياحي.`,
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.financials?.realEstateGrowth?.slice(0, 5) || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" tickFormatter={(val) => `${val}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              cursor={{ fill: '#334155', opacity: 0.2 }}
              formatter={(val: any) => [`${val}%`, "نمو السعر"]}
            />
            <Legend />
            <Bar dataKey="growth" name="النمو الربعي" radius={[4, 4, 0, 0]} barSize={50}>
              {data.financials?.realEstateGrowth?.slice(0, 5).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.growth > 10 ? '#10b981' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
      metrics: [
        { label: "الأعلى نمواً", value: `${data.financials?.realEstateGrowth?.[0]?.name || '-'}`, subValue: `+${data.financials?.realEstateGrowth?.[0]?.growth || 0}% (QoQ)`, trend: "up" },
        { label: "أعلى تداول (Q3)", value: `${(data.financials?.realEstateGrowth?.sort((a, b) => b.volume - a.volume)[0]?.volume / 1000000).toFixed(1)}M`, subValue: "سيولة مليونية", trend: "up" },
        { label: "عائد السائح", value: `${data.financials?.tourismYield?.[data.financials.tourismYield.length - 1]?.value || 0} ريال`, subValue: "انخفاض -30% عن القمة", trend: "down" }
      ]
    },
    {
      id: "gems",
      type: "chart",
      title: "الفرص الخفية",
      subtitle: "جواهر حائل (Hidden Gems)",
      description: `بعيداً عن الأضواء، ${data.gems?.districts?.[0]?.name || 'هناك حي'} يحقق معادلة القيمة الصعبة (سعر منخفض + نمو عالي). والمفاجأة الأكبر: السياحة الريفية (${data.gems?.tourismOps?.rural?.name || 'Rural'}) تحقق عائداً للرحلة أعلى من سياحة المدينة بـ ${(data.gems?.tourismOps?.rural?.spend / data.gems?.tourismOps?.city?.spend * 100 - 100).toFixed(0)}%.`,
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[
              { name: 'المدينة (City)', spend: data.gems?.tourismOps?.city?.spend, fill: '#3b82f6' },
              { name: 'الريف (Rural)', spend: data.gems?.tourismOps?.rural?.spend, fill: '#EC4899' } // Pink for Gems
            ]}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" tickFormatter={(val) => `${val}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              cursor={{ fill: '#334155', opacity: 0.2 }}
              formatter={(val: any) => [`${val} ريال`, "متوسط إنفاق الرحلة"]}
            />
            <Legend />
            <Bar dataKey="spend" name="متوسط إنفاق الرحلة" radius={[8, 8, 0, 0]} barSize={60}>
              <Cell fill="#3b82f6" />
              <Cell fill="#EC4899" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
      metrics: [
        { label: "الجوهرة العقارية", value: `${data.gems?.districts?.[0]?.name || '-'}`, subValue: "أفضل قيمة مقابل سعر", trend: "up" },
        { label: "سعر المتر", value: `${data.gems?.districts?.[0]?.priceQ3 || 0} ريال`, subValue: "سعر دخول مميز", trend: "neutral" },
        { label: "الريف > المدينة", value: `${data.gems?.tourismOps?.rural?.spend || 0} ريال`, subValue: "إنفاق أعلى للرحلة", trend: "up" }
      ]
    },
    {
      id: "tourism",
      type: "chart",
      title: "اقتصاديات الزوار",
      subtitle: "القيمة المضافة للسائح الدولي (H1 2025)",
      description: "رغم أن السياحة المحلية تشكل 90% من العدد، إلا أن السائح الدولي ينفق ضعف السائح المحلي تقريباً. الاستراتيجية يجب أن تركز على 'الكيف' لا 'الكم'.",
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.tourism} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
            <XAxis type="number" stroke="#94a3b8" />
            <YAxis dataKey="name" type="category" stroke="#fff" width={120} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              formatter={(val: any) => [`${val} ريال`, "متوسط الإنفاق"]}
            />
            <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
              {data.tourism.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
      metrics: [
        { label: "إنفاق الدولي", value: "2,008 ريال", subValue: "للزائر الواحد", trend: "up" },
        { label: "إنفاق المحلي", value: "1,213 ريال", subValue: "للزائر الواحد", trend: "neutral" },
        { label: "الفارق", value: "+65%", subValue: "قيمة مضافة", trend: "up" }
      ]
    }
  ];

  const currentSlide = slides[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 lg:p-8 font-sans overflow-hidden relative">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      <header className="absolute top-8 right-8 flex items-center gap-4 z-20">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-900 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 ring-1 ring-white/10">
          <BarChart3 className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">مرصد حائل للبيانات</h1>
          <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Strategic Data Audit</p>
        </div>
      </header>

      <main className="w-full max-w-7xl z-10 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          >
            {/* Content Section */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700/50 text-brand-400 text-xs font-semibold uppercase tracking-wider">
                  {currentSlide.type === 'hero' ? <MapPin size={12} /> : <TrendingUp size={12} />}
                  <span>{currentSlide.subtitle}</span>
                </div>
                <h2 className="text-4xl lg:text-6xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
                  {currentSlide.title}
                </h2>
                <p className="text-lg text-slate-300 leading-relaxed font-light">
                  {currentSlide.description}
                </p>
              </div>

              {/* Metrics Grid */}
              {currentSlide.metrics && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentSlide.metrics.map((m: any, i: number) => (
                    <MetricCard key={i} {...m} delay={i * 0.1} />
                  ))}
                </div>
              )}

              {currentSlide.type === 'hero' && (
                <button onClick={nextSlide} className="group px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-xl shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                  استعراض التحليل <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            {/* Visual Section */}
            <div className="lg:col-span-7">
              {currentSlide.type === 'hero' ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="h-[500px] flex items-center justify-center relative bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                  <div className="relative text-center space-y-6">
                    <div className="w-32 h-32 mx-auto bg-brand-500/10 rounded-full flex items-center justify-center animate-pulse">
                      <BarChart3 className="w-16 h-16 text-brand-500" />
                    </div>
                    <p className="text-slate-500 font-mono text-sm">INITIALIZING DATA STREAMS...</p>
                  </div>
                </motion.div>
              ) : (
                <ChartContainer title={currentSlide.subtitle}>
                  {currentSlide.chart}
                </ChartContainer>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="w-full max-w-7xl flex items-center justify-between z-20 py-8 px-4 border-t border-slate-800/50 mt-8">
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-12 bg-brand-500' : 'w-2 bg-slate-800 hover:bg-slate-700 cursor-pointer'}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
        <div className="flex gap-4">
          <button onClick={prevSlide} className="p-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white transition-colors border border-slate-800 hover:border-slate-700">
            <ChevronRight size={20} />
          </button>
          <button onClick={nextSlide} className="p-4 rounded-full bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow-lg shadow-brand-500/20 ring-1 ring-white/10">
            <ChevronLeft size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
