/// <reference path="../typings/reflect-metadata.d.ts" />

import * as lodash from 'lodash';

import { ReflectiveInjector } from '@angular/core/src/di';


export { autoInject, component, bootstrap };


function autoInject(target) {
}


interface Type<T> extends Function {
	new(...args): T;
}


interface ComponentMetadata {
	implClasses: Type<any>[];
}


const COMPONENT = Symbol('component');


function component(metadata: ComponentMetadata) {
	return function(target) {
		Reflect.defineMetadata(COMPONENT, metadata, target);
	};
}


function bootstrap<T>(target: Type<T>, providers: any[]): T {

	const foundTypes = findParamTypes(target);
	const paramTypes = lodash.uniq(foundTypes);
	const knownTypes = paramTypes.concat(target);

	const implClasses = lodash.flatMap(knownTypes, getImplClasses);
	const classProviders = implClasses.map(createProvider);

	const abstractTypes = classProviders.map(item => item.provide);
	const concreteTypes = lodash.difference(knownTypes, abstractTypes);

	const injector = ReflectiveInjector.resolveAndCreate([
		implClasses, classProviders, concreteTypes, providers,
	]);

	return injector.get(target);

}


function findParamTypes(target): any[] {

	const value = Reflect.getMetadata('design:paramtypes', target);
	if (!value) return [];

	const ownTypes = value as any[];
	const subTypes = lodash.flatMap(ownTypes, findParamTypes);

	return ownTypes.concat(subTypes);

}


function getImplClasses<T>(target: Type<T>) {

	const value = Reflect.getMetadata(COMPONENT, target);
	if (!value) return [];

	const metadata = value as ComponentMetadata;
	return metadata.implClasses;

}


function createProvider<T>(child: Type<T>) {
	const parent = Object.getPrototypeOf(child);
	return { provide: parent, useExisting: child };
}
