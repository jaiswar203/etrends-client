import type { Metadata } from "next";
import "../globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/Sidebar";

export const metadata: Metadata = {
    title: "AMC Dashboard",
    description: "Etrends AMC Dashboad Internal Tool",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <AppSidebar />
                <SidebarTrigger  />
            <main className="p-6 w-full">
                {children}
            </main>
        </SidebarProvider>
    );
}
