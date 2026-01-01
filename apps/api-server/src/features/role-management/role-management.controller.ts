import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  applyRoleRoSchema,
  type TApproveRoleApplicationParams,
  type TApplyRoleRo,
  type TRejectRoleApplicationParams,
  changeUserRoleRoSchema,
  type TChangeUserRoleRo,
} from '@peernest/contract';

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

  @Post('applications/:roleApplicationId/approve')
  @HttpCode(HttpStatus.NO_CONTENT)
  async approveRoleApplication(
    @Param() approveRoleApplicationParams: TApproveRoleApplicationParams
  ): Promise<void> {
    await this.roleManagementService.approveRoleApplication(approveRoleApplicationParams);
  }

  @Post('applications/:roleApplicationId/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectRoleApplication(
    @Param() rejectRoleApplicationParams: TRejectRoleApplicationParams
  ): Promise<void> {
    await this.roleManagementService.rejectRoleApplication(rejectRoleApplicationParams);
  }

  @Post('change')
  @HttpCode(HttpStatus.CREATED)
  async changeUserRo(
    @Body(new ZodValidationPipe(changeUserRoleRoSchema)) changeUserRo: TChangeUserRoleRo
  ): Promise<void> {
    await this.roleManagementService.changeUserRo(changeUserRo);
  }
}
