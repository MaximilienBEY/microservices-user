import { CommonModule } from "@app/common"
import { RmqModule } from "@app/common/rmq/rmq.module"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import * as joi from "joi"

import { UserController } from "./user.controller"
import { UserService } from "./user.service"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        DATABASE_URL: joi.string().required(),
        RABBIT_MQ_URL: joi.string().required(),
      }),
      envFilePath: "./apps/user/.env",
    }),
    RmqModule,
    CommonModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
