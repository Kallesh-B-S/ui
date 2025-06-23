export interface User {
    roles?: string[] | null;
    menus?: string[] | null;
    menuDetails?: Menu[] | null;
    userDetails?: UserDetail | null;
}

export interface Menu {
    name: string;
    pageName: string
}

export interface UserDetail {
    spid: number;
    urlKey: string;
    logoName: string;
    themeName: string;
}