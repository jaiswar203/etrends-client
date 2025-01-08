import type { Metadata } from "next";
import "../globals.css";
import LayoutWithQuery from "./LayoutWithQuery";

export const metadata: Metadata = {
    title: "AMC Dashboard",
    description: "Etrends AMC Dashboad Internal Tool",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <LayoutWithQuery>{children}</LayoutWithQuery>;
}
