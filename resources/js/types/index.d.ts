import { User } from './models';

export type { User };

export type PageProps<T = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash: {
        success?: string | null;
        error?: string | null;
    };
    unreadNotificationCount: number;
};
