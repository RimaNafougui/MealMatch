import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CookieBanner } from "@/components/cookies/CookieBanner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Header />
      <main className="flex-grow w-full">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
