import { Module } from '@nestjs/common';

import { StorageModule } from '@/features/attachment/plugins/storage.module';
import { PersistenceModule } from '@/persistence/persistence.module';

import { RoleManagementController } from './role-management.controller';
import { RoleManagementService } from './role-management.service';

@Module({
  imports: [PersistenceModule, StorageModule],
  controllers: [RoleManagementController],
  providers: [RoleManagementService],
  exports: [RoleManagementService],
})
export class RoleManagementModule {}
