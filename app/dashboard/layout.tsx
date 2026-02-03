import Navbar from "./components/NavBar";
import Sidebar from "./components/SideBar";
import Footer from "./components/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <main className="flex-1 p-4">{children}</main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
