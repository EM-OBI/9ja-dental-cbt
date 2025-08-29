import Sidebar from "@/app/dashboard/components/Sidebar";
import BottomNav from "./components/bottom-nav";
import DesktopHeader from "./components/header/DesktopHeader";
import MobileHeader from "./components/header/MobileHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col lg:flex-row bg-gray-950">
      {/* Sidebar - Hidden on mobile and tablet, visible on large screens and up */}
      <div className="w-full flex-none md:w-64">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          {/* For Desktop Screen Only */}
          <div className="hidden lg:block">
            <DesktopHeader />
          </div>
          {/* For Mobile Screen Only */}
          <div className="block lg:hidden">
            <MobileHeader />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0">
        <BottomNav />
      </div>
    </div>
  );
}
