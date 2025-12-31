import { Module } from '@nestjs/common';

import { PersistenceModule } from '@/persistence/persistence.module';

import { RoleManagementController } from './role-management.controller';
import { RoleManagementService } from './role-management.service';

@Module({
  imports: [PersistenceModule],
  controllers: [RoleManagementController],
  providers: [RoleManagementService],
  exports: [RoleManagementService],
})
export class RoleManagementModule {}
