'use client';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import type { ReactNode } from 'react';

export function MobileSidebar({
  open,
  setOpen,
  children,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction="left"
      modal
    >
      <DrawerContent className="p-0 w-60">
        <DrawerTitle className="sr-only">Menu de navegação</DrawerTitle>
          {children}
      </DrawerContent>
    </Drawer>
  );
}