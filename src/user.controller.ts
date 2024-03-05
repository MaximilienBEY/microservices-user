import { UserMeUpdateType } from "@app/common/schemas/auth/types"
import { userSchema, usersSchema } from "@app/common/schemas/user/schema"
import { UserCreateType } from "@app/common/schemas/user/types"
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from "@nestjs/common"
import { EventPattern, Payload, RpcException } from "@nestjs/microservices"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { zodToOpenAPI } from "nestjs-zod"

import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { UserService } from "./user.service"

@ApiTags("Users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOkResponse({ description: "User created successfully", schema: zodToOpenAPI(userSchema) })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Get()
  @ApiOkResponse({ description: "Users found successfully", schema: zodToOpenAPI(usersSchema) })
  findAll() {
    return this.userService.findAll()
  }

  @Get(":id")
  @ApiOkResponse({ description: "User found successfully", schema: zodToOpenAPI(userSchema) })
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id)
  }

  @Patch(":id")
  @ApiOkResponse({ description: "User updated successfully", schema: zodToOpenAPI(userSchema) })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto)
  }

  @Delete(":id")
  @ApiOkResponse({ description: "User deleted successfully" })
  async remove(@Param("id") id: string) {
    await this.userService.remove(id)
    return null
  }

  // RMQ
  @EventPattern("user.find.email")
  async findUserByEmail(@Payload() data: { email: string }) {
    console.log("email", data)
    const user = await this.userService.findOneByEmail(data.email)
    if (!user) throw new RpcException(new NotFoundException("User not found"))
    return user
  }

  @EventPattern("user.find.id")
  async findUserById(@Payload() data: { id: string }) {
    const user = await this.userService.findOne(data.id).catch(() => null)
    if (!user) throw new RpcException(new NotFoundException("User not found"))
    return user
  }

  @EventPattern("user.create")
  async createUser(@Payload() data: UserCreateType) {
    const user = await this.userService.create(data).catch(() => {
      throw new RpcException(new BadRequestException("Email already used"))
    })
    return user
  }

  @EventPattern("user.update")
  async updateUser(@Payload() { id, data }: { id: string; data: UserMeUpdateType }) {
    const user = await this.userService.update(id, data)
    return user
  }
}
