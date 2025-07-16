'use client';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { SidebarPlaceholder } from './sidebar-placeholder';

export function MobileSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction="left"
      modal
    >
      <DrawerContent className="p-0 w-60">
        <SidebarPlaceholder />
      </DrawerContent>
    </Drawer>
  );
}