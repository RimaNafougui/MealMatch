import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="relative flex flex-col h-screen">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
