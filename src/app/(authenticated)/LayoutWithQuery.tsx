"use client";
import { AppSidebar } from "@/components/common/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useGetAllProductsQuery } from "@/redux/api/product";
import React, { useEffect } from "react";
import { setProducts } from "@/redux/slices/user";
import { useAppDispatch } from "@/redux/hook";

const LayoutWithQuery = ({ children }: Readonly<{
  children: React.ReactNode;
}>) => {
  const { data, isSuccess } = useGetAllProductsQuery();
  const dispatch=useAppDispatch()

  // set data once data is fetched
  useEffect(() => {
    if (data && isSuccess) {
      dispatch(setProducts(data.data));
    }
  }, [data])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <main className="p-6 w-full">{children}</main>
    </SidebarProvider>
  );
};

export default LayoutWithQuery;
