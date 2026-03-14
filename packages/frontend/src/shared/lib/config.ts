interface AppConfig {
    wsUrl: string;
}

let cachedConfig: AppConfig | null = null;

export async function getConfig(): Promise<AppConfig> {
    if (cachedConfig) {
        return cachedConfig;
    }

    // ローカル開発時は環境変数を優先
    const envWsUrl = import.meta.env.VITE_WS_URL as string | undefined;
    if (envWsUrl) {
        cachedConfig = { wsUrl: envWsUrl };
        return cachedConfig;
    }

    const response = await fetch('/config.json');
    if (!response.ok) {
        throw new Error('Failed to load config.json');
    }
    cachedConfig = (await response.json()) as AppConfig;
    return cachedConfig;
}
