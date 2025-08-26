import Sidebar from "@/app/dashboard/components/Sidebar";
import BottomNav from "./components/bottom-nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <Sidebar />
      </div>
      <div className="flex-grow md:overflow-y-auto">{children}</div>
      <BottomNav />
    </div>
  );
}
