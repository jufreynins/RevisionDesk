export interface TourStep {
    /** Matches a data-tour="..." attribute on the page. Omit for a centered, unanchored step. */
    target?: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface TourSegment {
    /** Ziggy route name the user must be on for this segment's steps to render. */
    routeName: string;
    /** Query string appended when navigating to this segment (e.g. view=all). */
    query?: string;
    /** Only include this segment if the current user passes this check. */
    visible?: (ctx: { isAdmin: boolean; canManage: boolean }) => boolean;
    steps: TourStep[];
}

export const TOUR_SEGMENTS: TourSegment[] = [
    {
        routeName: 'dashboard',
        steps: [
            {
                target: 'sidebar-nav',
                title: 'Sidebar Navigation',
                content: 'Dito mo makikita lahat ng modules ng RevisionDesk — Tasks, Websites, Team, Reports, at Settings. Depende sa role mo, iba-iba ang makikita mong menu.',
                placement: 'right',
            },
            {
                target: 'add-task-btn',
                title: 'Add New Task',
                content: 'Gamitin ang buttong ito para gumawa ng bagong task o revision ticket kahit saan ka sa app.',
                placement: 'right',
            },
            {
                target: 'dashboard-stats',
                title: 'Quick Overview',
                content: 'Makikita dito ang mabilisang buod ng iyong mga tasks — open, urgent, overdue, at kung ano ang natapos ngayong linggo.',
                placement: 'bottom',
            },
            {
                target: 'dashboard-due',
                title: 'Upcoming Due Dates',
                content: 'Dito nakalista ang mga tasks na malapit nang ma-due sa susunod na 7 araw, para hindi ka mahuli.',
                placement: 'top',
            },
        ],
    },
    {
        routeName: 'tasks.index',
        query: 'view=all',
        visible: ({ canManage }) => canManage,
        steps: [
            {
                target: 'task-filters',
                title: 'Search at Filters',
                content: 'Gamitin ang mga filter na ito para hanapin ang specific na task base sa website, assigned na tao, priority, o status.',
                placement: 'bottom',
            },
            {
                target: 'task-table',
                title: 'Listahan ng Tasks',
                content: 'Ito ang lahat ng tasks sa system. I-click ang kahit anong row para makita ang buong detalye nito.',
                placement: 'top',
            },
        ],
    },
    {
        routeName: 'tasks.index',
        query: 'view=mine',
        visible: ({ canManage }) => !canManage,
        steps: [
            {
                target: 'task-filters',
                title: 'Search at Filters',
                content: 'Gamitin ang mga filter na ito para hanapin ang specific na task base sa website, priority, o status.',
                placement: 'bottom',
            },
            {
                target: 'task-table',
                title: 'Listahan ng Tasks',
                content: 'Ito ang mga tasks na naka-assign sa iyo. I-click ang kahit anong row para makita ang buong detalye nito.',
                placement: 'top',
            },
        ],
    },
    {
        routeName: 'tasks.board',
        steps: [
            {
                target: 'kanban-board',
                title: 'Task Board',
                content: 'Drag-and-drop na view ito ng mga tasks, nakagrupo base sa kanilang kasalukuyang status.',
                placement: 'bottom',
            },
        ],
    },
    {
        routeName: 'tasks.calendar',
        steps: [
            {
                target: 'calendar-view',
                title: 'Calendar',
                content: 'Makikita dito ang mga tasks ayon sa due date nila, kaya madaling maplano ang linggo.',
                placement: 'bottom',
            },
        ],
    },
    {
        routeName: 'websites.index',
        steps: [
            {
                target: 'website-add-btn',
                title: 'Magdagdag ng Website',
                content: 'Dito mo maidadagdag ang bagong website na kailangang i-manage ng team.',
                placement: 'left',
            },
            {
                target: 'website-list',
                title: 'Mga Website',
                content: 'Listahan ito ng lahat ng websites na kasalukuyang hinahandle, kasama ang open at completed task counts.',
                placement: 'top',
            },
        ],
    },
    {
        routeName: 'team.index',
        visible: ({ canManage }) => canManage,
        steps: [
            {
                target: 'team-table',
                title: 'Team',
                content: 'Dito mo makikita at mama-manage ang mga miyembro ng team, kasama ang kanilang role at active tasks.',
                placement: 'top',
            },
        ],
    },
    {
        routeName: 'reports.index',
        visible: ({ canManage }) => canManage,
        steps: [
            {
                target: 'reports-charts',
                title: 'Reports',
                content: 'Dito makikita ang mga chart at analytics tungkol sa performance ng team at progress ng mga task.',
                placement: 'bottom',
            },
        ],
    },
    {
        routeName: 'settings.index',
        visible: ({ isAdmin }) => isAdmin,
        steps: [
            {
                target: 'settings-form',
                title: 'Settings',
                content: 'Dito mo maisasaayos ang mga default settings ng system, gaya ng ticket prefix at notifications.',
                placement: 'top',
            },
        ],
    },
    {
        routeName: 'dashboard',
        steps: [
            {
                title: 'Tapos na ang Tour!',
                content: 'Handa ka nang gamitin ang RevisionDesk. Kung gusto mong balikan ang tour na ito, i-click lang ang "Take a Tour" button dito sa Dashboard.',
            },
        ],
    },
];
