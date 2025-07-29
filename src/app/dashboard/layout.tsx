import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex overflow-hidden">
      <div className="fixed inset-y-0 left-0 z-30 w-60 bg-gray-50 border-r border-gray-200 hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 lg:ml-60 ">
        <div className="fixed top-0 left-0 right-0 z-20 lg:ml-60">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto pt-16 p-4 bg-gray-100 h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
