export function sleep(milliseconds: number) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function sandBox(){
	return 'SAND_BOX' in process.env && process.env['SAND_BOX'] === 'true';
}
