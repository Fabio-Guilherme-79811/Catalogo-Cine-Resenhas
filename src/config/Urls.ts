export const APP_URLS = {
    LOGIN: process.env.LOGIN_URL ?? "/login",
    REGISTER: process.env.REGISTER_URL ?? "/cadastro",
} as const; 