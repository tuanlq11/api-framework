declare module 'cookies' {

	interface OptionDict {
		domain?: string;
		maxAge?: number;
	}

	class Cookies {
		get(name: string): string | void;
		set(name: string, value: string, options?: OptionDict): this;
	}

	namespace Cookies {}

	export = Cookies;

}
