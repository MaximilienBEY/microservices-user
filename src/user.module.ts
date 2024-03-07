import { CommonModule } from "@app/common"
import { RmqModule } from "@app/common/rmq/rmq.module"
import { Module } from "@nestjs/common"

import { UserController } from "./user.controller"
import { UserService } from "./user.service"

@Module({
  imports: [RmqModule, CommonModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
