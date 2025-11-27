import { SetMetadata } from '@nestjs/common';

export const Roles = (...role: string[]) => {
	console.log('Roles decorator called with:', role);
	return SetMetadata('role', role);
};
