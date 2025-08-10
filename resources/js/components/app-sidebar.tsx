import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type UserRole } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Clock, Stethoscope, Users, ClipboardList, Settings } from 'lucide-react';
import AppLogo from './app-logo';

const getNavItems = (userRoles: UserRole[] = [], permissions: string[] = []): NavItem[] => {
    const allNavItems: NavItem[] = [
        {
            title: 'Queue',
            href: '/queue',
            icon: Clock,
            permission: 'view queue',
            roles: ['clinic assistant', 'doctor']
        },
        {
            title: 'Consultations',
            href: '/consultations',
            icon: Stethoscope,
            permission: 'view consultation',
            roles: ['doctor']
        },
    ];

    return allNavItems.filter(item => {
        // If item requires a specific permission, check it
        if (item.permission && !permissions.includes(item.permission)) {
            return false;
        }
        
        // If item is restricted to specific roles, check them
        if (item.roles && item.roles.length > 0) {
            return item.roles.some(role => userRoles.includes(role));
        }
        
        return true;
    });
};

export function AppSidebar() {
    const { auth } = usePage<{ auth: { roles: UserRole[], permissions: string[] } }>().props;
    const { roles = [], permissions = [] } = auth;
    const navItems = getNavItems(roles, permissions);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <div className="mt-auto">
                    <NavUser />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
