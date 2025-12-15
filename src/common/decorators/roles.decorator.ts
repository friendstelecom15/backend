import { SetMetadata } from '@nestjs/common';

export const Roles = (...role: string[]) => {
	return SetMetadata('role', role);
};
