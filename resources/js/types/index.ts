export type * from './auth';
export type * from './navigation';
export type * from './roles';
export type * from './ui';

import type { Auth } from './auth';

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: Auth;
    [key: string]: unknown;
};
