"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

type Props = {
  children: React.ReactNode;
};

export function MainLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="transition-[margin] duration-200 md:ml-[188px] md:peer-data-[state=collapsed]:ml-0">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <h1 className="text-sm font-medium">カード支払い分析</h1>
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
