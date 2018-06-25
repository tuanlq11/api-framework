export function sleep(milliseconds: number) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function isSandBox() {
	const { SandBox } = process.env;
	return SandBox === 'true';
}
