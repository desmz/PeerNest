import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { applyRoleRoSchema, type TApplyRoleRo } from '@peernest/contract';

import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { RoleManagementService } from './role-management.service';

@Controller('/api/roles')
export class RoleManagementController {
  constructor(private readonly roleManagementService: RoleManagementService) {}

  @Post('applications')
  @HttpCode(HttpStatus.CREATED)
  async applyRole(
    @Body(new ZodValidationPipe(applyRoleRoSchema)) applyRoleRo: TApplyRoleRo
  ): Promise<void> {
    await this.roleManagementService.applyRole(applyRoleRo);
  }
}
