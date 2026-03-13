import React, { useState } from 'react';
import { LayoutDashboard, Plus, Trash2, Cpu, Briefcase, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

const App = () => {
  // 动态状态：管理你的任务清单
  const [tasks, setTasks] = useState([
    { id: 1, text: 'PID Controller Report', category: 'Academic' },
    { id: 2, text: 'Update Internship Resume', category: 'Career' }
  ]);
  const [inputValue, setInputValue] = useState('');

  // 添加任务的逻辑
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: inputValue, category: 'Personal' }]);
    setInputValue('');
  };

  // 删除任务的逻辑
  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Console</h1>
            <p className="text-slate-500 font-medium">Mechatronics Engineering @ USM</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="px-4 py-2 bg-indigo-50 rounded-xl">
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Target CGPA</p>
              <p className="text-lg font-black text-indigo-600">3.71</p>
            </div>
            <div className="px-4 py-2 bg-emerald-50 rounded-xl text-right">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">System Status</p>
              <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 justify-end">● Online</p>
            </div>
          </div>
        </header>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* 1. 动态任务添加 (占 5 列) */}
          <div className="md:col-span-5 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 className="text-indigo-500" /> Action Items</h2>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{tasks.length} Total</span>
            </div>
            
            <form onSubmit={addTask} className="relative mb-6">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button type="submit" className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                <Plus size={20} />
              </button>
            </form>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {tasks.map(task => (
                <div key={task.id} className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all">
                  <span className="text-sm font-medium text-slate-700">{task.text}</span>
                  <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 2. 项目监控 (占 7 列) */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* 项目卡片 */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Cpu size={80} />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Active Project</p>
                <h3 className="text-xl font-bold leading-tight mb-4">Solar Panel Fault Detection</h3>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md">ResNet-50</span>
                  <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md">Computer Vision</span>
                </div>
              </div>
              <button className="mt-8 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all">
                Open Project <Plus size={16} />
              </button>
            </div>

            {/* 实习倒计时 */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/20 rounded-2xl"><Briefcase size={24} /></div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-indigo-200 uppercase">Start Date</p>
                  <p className="text-xs font-bold">20 July 2026</p>
                </div>
              </div>
              <div>
                <p className="text-4xl font-black mb-1">128</p>
                <p className="text-xs text-indigo-100 uppercase tracking-widest font-bold">Days to Intern</p>
              </div>
            </div>

            {/* 投资卡片 */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp /></div>
                  <div>
                    <h3 className="font-bold">Portfolio Strategy</h3>
                    <p className="text-xs text-slate-400">Fixed Deposit & REITs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">+4.2%</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">Growth</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;