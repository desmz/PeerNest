import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TApplyRoleRo,
  TApproveRoleApplicationParams,
  TChangeUserRoleRo,
  TFindRoleApplicationsQueryParams,
  TFindRoleApplicationsVo,
  TRejectRoleApplicationParams,
  TRoleApplication,
} from '@peernest/contract';
import {
  ALLOWED_APPLIED_ROLES,
  AttachmentStatus,
  generateRoleApplicationId,
  generateRoleAttachmentId,
  generateRoleChangeActionId,
  HttpErrorCode,
  NOTIFICATION_EVENT,
  RoleApplicationStatus,
  RoleChangeActionType,
  UploadType,
  UserRole,
} from '@peernest/core';
import { executeTx, KyselyService } from '@peernest/db';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import StorageAdapter from '@/features/attachment/plugins/adapter';
import { InjectStorageAdapter } from '@/features/attachment/plugins/storage-provider';
import { getAttachmentPreviewUrl, getFullStorageUrl } from '@/features/attachment/utils';
import { TRoleApplicationRejectedEvent, TRoleChangedEvent } from '@/features/domain/events';
import { AttachmentRepository } from '@/persistence/repos/attachment';
import {
  RoleApplicationRepository,
  RoleAttachmentRepository,
  RoleChangeActionRepository,
} from '@/persistence/repos/role-management';
import { RoleRepository, UserRepository } from '@/persistence/repos/user';
import { IClsStore } from '@/types/cls';

@Injectable()
export class RoleManagementService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectStorageAdapter() private readonly storageAdapter: StorageAdapter,
    private readonly kyselyService: KyselyService,
    private readonly clsService: ClsService<IClsStore>,

    private readonly attachmentRepository: AttachmentRepository,
    private readonly roleRepository: RoleRepository,
    private readonly roleApplicationRepository: RoleApplicationRepository,
    private readonly roleAttachmentRepository: RoleAttachmentRepository,
    private readonly roleChangeActionRepository: RoleChangeActionRepository,
    private readonly userRepository: UserRepository
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

  async approveRoleApplication(
    approveRoleApplicationParams: TApproveRoleApplicationParams
  ): Promise<void> {
    const { roleApplicationId } = approveRoleApplicationParams;

    const userId = this.clsService.get('user.id');
    const userRoleRank = this.clsService.get('user.roleRank');

    const roleApplication =
      await this.roleApplicationRepository.findRoleApplicationById(roleApplicationId);

    if (!roleApplication) {
      throw new CustomHttpException(
        `Role application ${roleApplicationId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    if (roleApplication.roleApplicationStatus !== RoleApplicationStatus.Pending) {
      throw new CustomHttpException(
        `Role application is not in ${RoleApplicationStatus.Pending} status`,
        HttpErrorCode.CONFLICT
      );
    }

    if (roleApplication.roleApplicationApplicantId === userId) {
      throw new CustomHttpException(
        'You cannot approve your own role application',
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const appliedRole = await this.roleRepository.findRoleById(
      roleApplication.roleApplicationAppliedRoleId
    );

    if (!appliedRole) {
      throw new CustomHttpException(
        `Role ${roleApplication.roleApplicationAppliedRoleId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const appliedRoleRank = parseInt(appliedRole.roleRank);
    if (appliedRoleRank > userRoleRank) {
      throw new CustomHttpException(
        `You does not have permission to perform this operation`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const applicant = await this.userRepository.findUserById(
      roleApplication.roleApplicationApplicantId
    );

    if (!applicant) {
      throw new CustomHttpException(
        `Applicant ${roleApplication.roleApplicationApplicantId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const now = new Date();
    const roleChangeAction = await executeTx(this.kyselyService.db, async (tx) => {
      await this.roleApplicationRepository.updateRoleApplicationById(
        {
          roleApplicationStatus: RoleApplicationStatus.Approved,
          roleApplicationProcessedTime: now,
          roleApplicationProcessedBy: userId,
          roleApplicationUpdatedTime: now,
        },
        roleApplicationId,
        tx
      );

      const roleChangeActionType =
        appliedRoleRank > parseInt(applicant.roleRank)
          ? RoleChangeActionType.Promotion
          : RoleChangeActionType.Demotion;

      const roleChangeAction = await this.roleChangeActionRepository.createRoleChangeAction(
        {
          roleChangeActionId: generateRoleChangeActionId(),
          roleChangeActionTargetUserId: applicant.userId,
          roleChangeActionOldRoleId: applicant.roleId,
          roleChangeActionNewRoleId: appliedRole.roleId,
          roleChangeActionType: roleChangeActionType,
          roleChangeActionProcessedBy: userId,
          roleChangeActionRoleApplicationId: roleApplicationId,
          roleChangeActionCreatedTime: now,
        },
        tx
      );

      await this.userRepository.updateUserById(
        { userRoleId: appliedRole.roleId, userUpdatedTime: now },
        applicant.userId,
        tx
      );

      return roleChangeAction;
    });

    const roleChangedEvent: TRoleChangedEvent = {
      userId: applicant.userId,
      roleChangeActionId: roleChangeAction.roleChangeActionId,
      oldRoleId: roleChangeAction.roleChangeActionOldRoleId,
      newRoleId: roleChangeAction.roleChangeActionNewRoleId,
    };

    this.eventEmitter.emit(NOTIFICATION_EVENT.ROLE_CHANGED, roleChangedEvent);
  }

  async rejectRoleApplication(
    rejectRoleApplicationParams: TRejectRoleApplicationParams
  ): Promise<void> {
    const { roleApplicationId } = rejectRoleApplicationParams;

    const userId = this.clsService.get('user.id');
    const userRoleRank = this.clsService.get('user.roleRank');

    const roleApplication =
      await this.roleApplicationRepository.findRoleApplicationById(roleApplicationId);

    if (!roleApplication) {
      throw new CustomHttpException(
        `Role application ${roleApplicationId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    if (roleApplication.roleApplicationStatus !== RoleApplicationStatus.Pending) {
      throw new CustomHttpException(
        `Role application is not in ${RoleApplicationStatus.Pending} status`,
        HttpErrorCode.CONFLICT
      );
    }

    if (roleApplication.roleApplicationApplicantId === userId) {
      throw new CustomHttpException(
        'You cannot reject your own role application',
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const appliedRole = await this.roleRepository.findRoleById(
      roleApplication.roleApplicationAppliedRoleId
    );

    if (!appliedRole) {
      throw new CustomHttpException(
        `Role ${roleApplication.roleApplicationAppliedRoleId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const appliedRoleRank = parseInt(appliedRole.roleRank);
    if (appliedRoleRank > userRoleRank) {
      throw new CustomHttpException(
        `You does not have permission to perform this operation`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const now = new Date();
    await this.roleApplicationRepository.updateRoleApplicationById(
      {
        roleApplicationStatus: RoleApplicationStatus.Rejected,
        roleApplicationProcessedTime: now,
        roleApplicationProcessedBy: userId,
        roleApplicationUpdatedTime: now,
      },
      roleApplicationId
    );

    const roleApplicationRejectedEvent: TRoleApplicationRejectedEvent = {
      userId: roleApplication.roleApplicationApplicantId,
      roleApplicationId: roleApplication.roleApplicationId,
      appliedRoleId: roleApplication.roleApplicationAppliedRoleId,
    };

    this.eventEmitter.emit(
      NOTIFICATION_EVENT.ROLE_APPLICATION_REJECTED,
      roleApplicationRejectedEvent
    );
  }

  async changeUserRole(changeUserRo: TChangeUserRoleRo): Promise<void> {
    const { newRoleId, roleApplicationId, targetUserId } = changeUserRo;

    const userId = this.clsService.get('user.id');
    const userRoleRank = this.clsService.get('user.roleRank');

    const appliedRole = await this.roleRepository.findRoleById(newRoleId);

    if (!appliedRole) {
      throw new CustomHttpException(`Role ${newRoleId} does not exist`, HttpErrorCode.NOT_FOUND);
    }

    const appliedRoleRank = parseInt(appliedRole.roleRank);
    if (appliedRoleRank > userRoleRank) {
      throw new CustomHttpException(
        `You does not have permission to perform this operation`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const applicant = await this.userRepository.findUserById(targetUserId);

    if (!applicant) {
      throw new CustomHttpException(
        `Applicant ${targetUserId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    if (roleApplicationId) {
      const roleApplication =
        await this.roleApplicationRepository.findRoleApplicationById(roleApplicationId);

      if (!roleApplication) {
        throw new CustomHttpException(
          `Role application ${roleApplicationId} does not exist`,
          HttpErrorCode.NOT_FOUND
        );
      }

      if (roleApplication.roleApplicationStatus !== RoleApplicationStatus.Pending) {
        throw new CustomHttpException(
          `Role application is not in ${RoleApplicationStatus.Pending} status`,
          HttpErrorCode.CONFLICT
        );
      }
    }

    const now = new Date();
    const roleChangeAction = await executeTx(this.kyselyService.db, async (tx) => {
      if (roleApplicationId) {
        await this.roleApplicationRepository.updateRoleApplicationById(
          {
            roleApplicationStatus: RoleApplicationStatus.Approved,
            roleApplicationProcessedTime: now,
            roleApplicationProcessedBy: userId,
            roleApplicationUpdatedTime: now,
          },
          roleApplicationId,
          tx
        );
      }

      await this.roleApplicationRepository.updateRoleApplicationByIds(
        {
          roleApplicationStatus: RoleApplicationStatus.Approved,
          roleApplicationProcessedTime: now,
          roleApplicationProcessedBy: userId,
          roleApplicationUpdatedTime: now,
        },
        {
          applicantId: targetUserId,
          appliedRoleId: newRoleId,
        },
        { statuses: [RoleApplicationStatus.Pending] },
        tx
      );

      const roleChangeActionType =
        appliedRoleRank > parseInt(applicant.roleRank)
          ? RoleChangeActionType.Promotion
          : RoleChangeActionType.Demotion;

      const roleChangeAction = await this.roleChangeActionRepository.createRoleChangeAction(
        {
          roleChangeActionId: generateRoleChangeActionId(),
          roleChangeActionTargetUserId: targetUserId,
          roleChangeActionOldRoleId: applicant.roleId,
          roleChangeActionNewRoleId: newRoleId,
          roleChangeActionType: roleChangeActionType,
          roleChangeActionProcessedBy: userId,
          roleChangeActionRoleApplicationId: roleApplicationId,
          roleChangeActionCreatedTime: now,
        },
        tx
      );

      await this.userRepository.updateUserById(
        { userRoleId: appliedRole.roleId, userUpdatedTime: now },
        applicant.userId,
        tx
      );

      return roleChangeAction;
    });

    const roleChangedEvent: TRoleChangedEvent = {
      userId: applicant.userId,
      roleChangeActionId: roleChangeAction.roleChangeActionId,
      oldRoleId: roleChangeAction.roleChangeActionOldRoleId,
      newRoleId: roleChangeAction.roleChangeActionNewRoleId,
    };

    this.eventEmitter.emit(NOTIFICATION_EVENT.ROLE_CHANGED, roleChangedEvent);
  }

  async findRoleApplications(
    findRoleApplicationsQueryParams: TFindRoleApplicationsQueryParams
  ): Promise<TFindRoleApplicationsVo> {
    const roleApplicationObjs = await this.roleApplicationRepository.findRoleApplications(
      findRoleApplicationsQueryParams
    );

    const formattedRoleApplicationObjs = await Promise.all(
      roleApplicationObjs.map(async (roleApplicationObj): Promise<TRoleApplication> => {
        return {
          roleApplicationId: roleApplicationObj.roleApplicationId,
          roleApplicationStatus: roleApplicationObj.roleApplicationStatus,
          roleApplicationDescription: roleApplicationObj.roleApplicationDescription,
          roleApplicationCreatedTime: roleApplicationObj.roleApplicationCreatedTime,
          roleApplicationAppliedRole: {
            roleId: roleApplicationObj.roleId,
            roleName: roleApplicationObj.roleName,
            roleRank: roleApplicationObj.roleRank,
          },
          roleApplicant: {
            userId: roleApplicationObj.applicantUserId,
            userDisplayName: roleApplicationObj.applicantUserDisplayname,
            userAvatarUrl: getFullStorageUrl(roleApplicationObj.applicantUserAvatarUrl),
            roleName: roleApplicationObj.applicantUserRoleName,
            pronoun: roleApplicationObj.applicantPronoun,
            university: roleApplicationObj.applicantUniversity,
            domain: roleApplicationObj.applicantDomain,
            userInfoLookingFor: roleApplicationObj.applicantUserLookingFor,
            interests: roleApplicationObj.applicantInterest,
            personalGoals: roleApplicationObj.applicantPersonalGoal,
          },
          attachments: await Promise.all(
            roleApplicationObj.attachments.map(
              (attachment) =>
                getAttachmentPreviewUrl(
                  this.storageAdapter,
                  UploadType.RoleApplication,
                  attachment.attachmentPath,
                  attachment.attachmentMimetype
                ) as Promise<string>
            )
          ),
        };
      })
    );

    return {
      count: formattedRoleApplicationObjs.length,
      roleApplications: formattedRoleApplicationObjs,
    };
  }
}
