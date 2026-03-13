import { useState } from 'react'
import { LayoutDashboard, CalendarDays, ClipboardList, BookOpen, LogOut, Search, Bell } from 'lucide-react'

// 定义页面类型
type Page = 'Overview' | 'Timetable' | 'Assignments' | 'Resources';

function App() {
  const [activePage, setActivePage] = useState<Page>('Overview');

  // --- 模拟数据 (你可以在这里修改你的实际信息) ---
  const studentInfo = {
    name: "Ahhong0710",
    major: "Mechatronics Engineering",
    university: "USM",
    cgpa: "3.71"
  };

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Timetable', icon: CalendarDays },
    { name: 'Assignments', icon: ClipboardList },
    { name: 'Resources', icon: BookOpen },
  ];

  // --- 子页面组件 (你可以把它们拆分到独立文件中) ---

  const OverviewPage = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Welcome back, {studentInfo.name}!</h2>
        <p className="text-gray-600">Here's a quick look at your academic status.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><LayoutDashboard size={24} /></div>
          <div><p className="text-sm text-gray-500">Current CGPA</p><p className="text-2xl font-bold text-edu-primary">{studentInfo.cgpa}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full"><ClipboardList size={24} /></div>
          <div><p className="text-sm text-gray-500">Upcoming Assignments</p><p className="text-2xl font-bold text-edu-secondary">3</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full"><CalendarDays size={24} /></div>
          <div><p className="text-sm text-gray-500">Next Class</p><p className="text-2xl font-bold text-yellow-600">Robotics @ 10AM</p></div>
        </div>
      </div>
    </div>
  );

  const TimetablePage = () => <div className="bg-white p-8 rounded-2xl shadow-sm">Timetable content here... (Week View)</div>;
  const AssignmentsPage = () => <div className="bg-white p-8 rounded-2xl shadow-sm">Assignments content here... (Task List)</div>;
  const ResourcesPage = () => <div className="bg-white p-8 rounded-2xl shadow-sm">Resources content here... (Course Materials)</div>;

  // 根据当前页面状态渲染内容
  const renderContent = () => {
    switch (activePage) {
      case 'Overview': return <OverviewPage />;
      case 'Timetable': return <TimetablePage />;
      case 'Assignments': return <AssignmentsPage />;
      case 'Resources': return <ResourcesPage />;
      default: return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen flex text-edu-text">
      {/* --- Sidebar (左侧边栏) --- */}
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-100 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-edu-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">A</div>
          <h1 className="text-xl font-bold">EduDash</h1>
        </div>

        <nav className="flex-grow space-y-3">
          {navItems.map(item => (
            <button
              key={item.name}
              onClick={() => setActivePage(item.name as Page)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-colors duration-200 
                ${activePage === item.name 
                  ? 'bg-blue-50 text-edu-primary font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-edu-text'
                }`}
            >
              <item.icon size={20} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-gray-100 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${studentInfo.name}`} alt="avatar" className="w-12 h-12 rounded-full border-2 border-gray-100" />
            <div>
              <p className="font-semibold text-sm">{studentInfo.name}</p>
              <p className="text-xs text-gray-500">{studentInfo.major}</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-red-500 rounded-lg text-sm transition-colors">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* --- Main Content Area (右侧主内容区) --- */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-sm p-6 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="search" placeholder="Search courses, assignments..." className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-200 outline-none transition" />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-10 w-px bg-gray-100"></div>
            <p className="font-medium text-sm text-edu-primary">{studentInfo.university}</p>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 md:p-10 space-y-8">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Academic Dashboard</p>
              <h1 className="text-3xl font-extrabold tracking-tight">{activePage}</h1>
            </div>
            {activePage === 'Assignments' && (
              <button className="px-5 py-3 bg-edu-secondary text-white rounded-xl font-medium text-sm hover:bg-emerald-600 transition shadow-sm">+ Add Assignment</button>
            )}
          </header>

          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default App