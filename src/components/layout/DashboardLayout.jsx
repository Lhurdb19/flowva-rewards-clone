import Sidebar from "./Sidebar";
import "./layout.css";

export default function DashboardLayout({ children }) {
  return (
    <>
      <Sidebar />
      <main className="content">
        {children}
      </main>
    </>
  );
}
