'use client';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { SidebarPlaceholder } from './sidebar-placeholder';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export function MobileSidebar(){
    const [open, setOpen] = useState(false);

    return (
        <Drawer open={open} onOpenChange={setOpen} direction="left">
            {/* trigger fica invisível pois já temos botão no Header */}
            <DrawerTrigger asChild>
                <button className="sr-only">Open</button>
            </DrawerTrigger>

            <DrawerContent className="p-0 w-60">
                <SidebarPlaceholder />
            </DrawerContent>
        </Drawer>
    );
}