'use client';

import Sidebar from "@/components/Sidebar";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-4 sm:p-6">{children}</div>
    </>
  );
}
