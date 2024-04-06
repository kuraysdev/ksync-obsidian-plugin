export class LocaleManager {
    public locales = new Map<string, Locale>;
    public lang = window.localStorage.getItem('language');

    constructor() {
        
    }

    async registerLocales() {
        
    }

    getLocale() {}
}



export class Locale {
    private entries: Map<string, string>;

    constructor(json: any) {
        let locale = JSON.parse(json);
        this.entries = new Map(Object.entries(locale));
    };

    get(str: string, ...values: any[]) {
        return this.interpolateString(str, ...values) || `\{${str}\}`
    };

    interpolateString(str: string, ...values: any[]): string | undefined {
        let template = this.entries.get(str);
        if (!template) return;
        return template.replace(/{([A-Za-z\d!_-]+)(?::([A-Za-z\d!_-]+))?}/g,
            (match, name: string, format: string) => {
                //TODO(kuraysdev): Possibly to make it to follow template names in inserting values
                return String(values.shift());
            }
        );
    };
}
