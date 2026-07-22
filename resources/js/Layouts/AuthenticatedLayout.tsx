import Dropdown from '@/Components/Dropdown';
import FlashToast from '@/Components/FlashToast';
import TourOverlay from '@/Components/TourOverlay';
import { useTour } from '@/tour/useTour';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    Bell,
    CalendarDays,
    ChevronDown,
    Kanban,
    LayoutDashboard,
    ListChecks,
    Menu,
    Plus,
    Search,
    Settings,
    Users,
} from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

interface NavItem {
    label: string;
    href: string;
    icon: typeof LayoutDashboard;
    active: boolean;
    show: boolean;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, unreadNotificationCount } = usePage<PageProps>().props;
    const user = auth.user;
    const isAdmin = user.role === 'administrator';
    const canManage = isAdmin || user.role === 'project_manager';
    const tour = useTour({ isAdmin, canManage });

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navGroups: NavGroup[] = [
        {
            label: 'Workspace',
            items: [
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
                    show: true,
                },
                {
                    label: 'Calendar',
                    href: route('tasks.calendar'),
                    icon: CalendarDays,
                    active: route().current('tasks.calendar'),
                    show: true,
                },
            ],
        },
        {
            label: 'Client Work',
            items: [
                {
                    label: 'Websites',
                    href: route('websites.index'),
                    icon: Menu,
                    active: route().current('websites.*'),
                    show: true,
                },
                {
                    label: 'Activity Log',
                    href: route('activity-log.index'),
                    icon: Activity,
                    active: route().current('activity-log.index'),
                    show: true,
                },
            ],
        },
        {
            label: 'Admin',
            items: [
                {
                    label: 'Team',
                    href: route('team.index'),
                    icon: Users,
                    active: route().current('team.*'),
                    show: canManage,
                },
                {
                    label: 'Reports',
                    href: route('reports.index'),
                    icon: BarChart3,
                    active: route().current('reports.index'),
                    show: canManage,
                },
                {
                    label: 'Settings',
                    href: route('settings.index'),
                    icon: Settings,
                    active: route().current('settings.index'),
                    show: user.role === 'administrator',
                },
            ],
        },
    ];

    return (
        <>
            <FlashToast />
            <TourOverlay tour={tour} />

            <div
                className="sidebar-backdrop"
                hidden={!sidebarOpen}
                onClick={() => setSidebarOpen(false)}
            />

            <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} aria-label="Primary navigation">
                <div className="sidebar-brand">
                    <div className="brand-icon">R</div>
                    <div className="brand-name">
                        RevisionDesk
                    </div>
                </div>

                <nav className="sidebar-nav" data-tour="sidebar-nav">
                    <div className="nav-group">
                        <Link
                            href={route('tasks.create')}
                            className="btn btn-primary"
                            style={{ margin: '0 16px 14px', display: 'flex', justifyContent: 'center' }}
                            onClick={() => setSidebarOpen(false)}
                            data-tour="add-task-btn"
                        >
                            <Plus width={16} height={16} />
                            Add New Task
                        </Link>
                    </div>

                    {navGroups.map((group) => {
                        const visibleItems = group.items.filter((item) => item.show);
                        if (visibleItems.length === 0) return null;

                        return (
                            <div className="nav-group" key={group.label}>
                                <div className="nav-label">{group.label}</div>
                                {visibleItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`nav-link${item.active ? ' active' : ''}`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <item.icon className="icon" width={18} height={18} strokeWidth={1.5} />
                                        <span className="nav-text">{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="avatar">
                            {user.name.charAt(0)}
                            <span className="online" />
                        </div>
                        <div className="sidebar-user-info">
                            <div className="name">{user.name}</div>
                            <div className="role">{user.role.replace('_', ' ')}</div>
                        </div>
                    </div>
                </div>
            </aside>

            <header className="topbar">
                <div className="topbar-left">
                    <button
                        className="sidebar-toggle"
                        type="button"
                        aria-label="Open menu"
                        aria-expanded={sidebarOpen}
                        onClick={() => setSidebarOpen((v) => !v)}
                    >
                        <Menu width={20} height={20} strokeWidth={1.5} />
                    </button>
                    <nav className="breadcrumb" aria-label="Breadcrumb">
                        <span className="current" aria-current="page">
                            RevisionDesk
                        </span>
                    </nav>
                </div>

                <div className="search-box">
                    <Search className="s-icon" width={14} height={14} strokeWidth={1.5} />
                    <input type="text" placeholder="Search tasks, websites…" aria-label="Search" readOnly />
                </div>

                <div className="topbar-right">
                    <Link className="tb-btn tb-notifications" href={route('notifications.index')} title="Notifications">
                        <Bell width={18} height={18} strokeWidth={1.5} />
                        {unreadNotificationCount > 0 && <span className="dot" />}
                    </Link>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="tb-avatar" type="button" aria-label="Account menu">
                                {user.name.charAt(0)}
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

            <main id="main-content" className="main">
                <div className="page-wrapper">
                    {header && (
                        <div className="page-header">
                            <div className="page-header-row">{header}</div>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </>
    );
}

export function PageHeader({
    title,
    pretitle,
    actions,
}: {
    title: ReactNode;
    pretitle?: string;
    actions?: ReactNode;
}) {
    return (
        <div className="page-header">
            <div className="page-header-row">
                <div>
                    {pretitle && <div className="page-pretitle">{pretitle}</div>}
                    <h1 className="page-title">{title}</h1>
                </div>
                {actions && <div className="page-actions">{actions}</div>}
            </div>
        </div>
    );
}
