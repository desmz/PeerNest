import { Injectable } from '@nestjs/common';
import { TApplyRoleRo } from '@peernest/contract';
import {
  ALLOWED_APPLIED_ROLES,
  AttachmentStatus,
  generateRoleApplicationId,
  generateRoleAttachmentId,
  HttpErrorCode,
  RoleApplicationStatus,
  UserRole,
} from '@peernest/core';
import { executeTx, KyselyService } from '@peernest/db';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import { AttachmentRepository } from '@/persistence/repos/attachment';
import {
  RoleApplicationRepository,
  RoleAttachmentRepository,
} from '@/persistence/repos/role-management';
import { RoleRepository } from '@/persistence/repos/user';
import { IClsStore } from '@/types/cls';

@Injectable()
export class RoleManagementService {
  constructor(
    private readonly kyselyService: KyselyService,
    private readonly clsService: ClsService<IClsStore>,

    private readonly attachmentRepository: AttachmentRepository,
    private readonly roleRepository: RoleRepository,
    private readonly roleApplicationRepository: RoleApplicationRepository,
    private readonly roleAttachmentRepository: RoleAttachmentRepository
  ) {}

  async applyRole(applyRoleRo: TApplyRoleRo): Promise<void> {
    const { attachmentId, description, roleId } = applyRoleRo;

    const userId = this.clsService.get('user.id');
    const userRole = this.clsService.get('user.role');

    const role = await this.roleRepository.findRoleById(roleId);

    if (!role) {
      throw new CustomHttpException(
        `Role ${roleId} does not exist`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }

    if (!ALLOWED_APPLIED_ROLES.includes(role.roleName as UserRole)) {
      throw new CustomHttpException(
        `Only the following roles can be applied: ${ALLOWED_APPLIED_ROLES.join(', ')}`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }

    if (role.roleName === userRole) {
      throw new CustomHttpException(
        `You are already in ${userRole} role`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }

    if (attachmentId) {
      const attachment = await this.attachmentRepository.findAttachmentById(attachmentId, {
        status: AttachmentStatus.Ready,
      });

      if (!attachment) {
        throw new CustomHttpException(
          `Attachment ${attachmentId} does not exist`,
          HttpErrorCode.VALIDATION_ERROR
        );
      }
    }

    const existingRoleApplication = await this.roleApplicationRepository.findRoleApplicationByIds(
      {
        applicantId: userId,
        appliedRoleId: roleId,
      },
      { statuses: [RoleApplicationStatus.Pending] }
    );

    if (existingRoleApplication) {
      throw new CustomHttpException(
        `You already apply for the ${role.roleName}. Please wait for the approval`,
        HttpErrorCode.CONFLICT
      );
    }

    const now = new Date();
    executeTx(this.kyselyService.db, async (tx) => {
      const roleApplicationId = generateRoleApplicationId();

      await this.roleApplicationRepository.createRoleApplication(
        {
          roleApplicationId: roleApplicationId,
          roleApplicationApplicantId: userId,
          roleApplicationAppliedRoleId: roleId,
          roleApplicationStatus: RoleApplicationStatus.Pending,
          roleApplicationDescription: description,
          roleApplicationCreatedTime: now,
        },
        tx
      );

      if (attachmentId) {
        await this.roleAttachmentRepository.createRoleAttachment(
          {
            roleAttachmentId: generateRoleAttachmentId(),
            roleAttachmentRoleApplicationId: roleApplicationId,
            roleAttachmentAttachmentId: attachmentId,
          },
          tx
        );
      }
    });
  }
}
