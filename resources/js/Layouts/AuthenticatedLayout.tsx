import Dropdown from '@/Components/Dropdown';
import FlashToast from '@/Components/FlashToast';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    CalendarDays,
    ChevronDown,
    Kanban,
    LayoutDashboard,
    ListChecks,
    Menu,
    Plus,
    Settings,
    Users,
    X,
} from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

interface NavItem {
    label: string;
    href: string;
    icon: typeof LayoutDashboard;
    active: boolean;
    show: boolean;
}

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, unreadNotificationCount } = usePage<PageProps>().props;
    const user = auth.user;
    const isInternal = user.role !== 'client';
    const canManage = user.role === 'administrator' || user.role === 'project_manager';

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutDashboard,
            active: route().current('dashboard'),
            show: true,
        },
        {
            label: 'My Tasks',
            href: `${route('tasks.index')}?view=mine`,
            icon: ListChecks,
            active: route().current('tasks.index') && route().queryParams?.view !== 'all',
            show: true,
        },
        {
            label: 'All Tasks',
            href: `${route('tasks.index')}?view=all`,
            icon: ListChecks,
            active: route().current('tasks.index') && route().queryParams?.view === 'all',
            show: canManage,
        },
        {
            label: 'Task Board',
            href: route('tasks.board'),
            icon: Kanban,
            active: route().current('tasks.board'),
            show: isInternal,
        },
        {
            label: 'Calendar',
            href: route('tasks.calendar'),
            icon: CalendarDays,
            active: route().current('tasks.calendar'),
            show: isInternal,
        },
        {
            label: 'Websites',
            href: route('websites.index'),
            icon: Menu,
            active: route().current('websites.*'),
            show: isInternal,
        },
        {
            label: 'Activity Log',
            href: route('activity-log.index'),
            icon: Activity,
            active: route().current('activity-log.index'),
            show: isInternal,
        },
        {
            label: 'Team',
            href: '#',
            icon: Users,
            active: false,
            show: canManage,
        },
        {
            label: 'Settings',
            href: '#',
            icon: Settings,
            active: false,
            show: user.role === 'administrator',
        },
    ];

    return (
        <div className="min-h-screen bg-zinc-50">
            <FlashToast />

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-zinc-200 bg-white transition-transform lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-5">
                    <Link href={route('dashboard')} className="text-lg font-semibold text-zinc-900">
                        RevisionDesk
                    </Link>
                    <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5 text-zinc-500" />
                    </button>
                </div>

                <div className="px-4 py-4">
                    <Link
                        href={route('tasks.create')}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Task
                    </Link>
                </div>

                <nav className="space-y-1 px-3">
                    {navItems
                        .filter((item) => item.show)
                        .map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                    item.active
                                        ? 'bg-emerald-50 text-emerald-800'
                                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                                }`}
                            >
                                <item.icon className="h-4.5 w-4.5" />
                                {item.label}
                            </Link>
                        ))}
                </nav>
            </aside>

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6">
                    <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-6 w-6 text-zinc-600" />
                    </button>

                    <div className="hidden lg:block">{header}</div>

                    <div className="ml-auto flex items-center gap-4">
                        <Link
                            href={route('notifications.index')}
                            className="relative rounded-full p-2 text-zinc-500 hover:bg-zinc-100"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadNotificationCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                                    {unreadNotificationCount}
                                </span>
                            )}
                        </Link>

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
                                        {user.name.charAt(0)}
                                    </span>
                                    <span className="hidden sm:inline">{user.name}</span>
                                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {header && (
                    <div className="border-b border-zinc-200 bg-white px-4 py-4 sm:px-6 lg:hidden">{header}</div>
                )}

                <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
