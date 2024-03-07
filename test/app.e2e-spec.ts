import { PrismaService } from "@app/common"
import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { PrismaClient, User } from "@prisma/client"
import { DeepMockProxy, mockDeep } from "jest-mock-extended"

import { UserModule } from "../src/user.module"
import { UserService } from "../src/user.service"

describe("UserController (e2e)", () => {
  let app: INestApplication
  let userService: UserService
  let prisma: DeepMockProxy<PrismaClient>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile()

    app = moduleFixture.createNestApplication()
    prisma = moduleFixture.get(PrismaService)
    userService = moduleFixture.get(UserService)
    await app.init()
  })

  // it("/ (GET)", () => {
  //   const testUsers: User[] = []
  //   prisma.user.findMany.mockResolvedValueOnce(testUsers)

  //   expect(prisma.user.findMany()).resolves.toEqual(testUsers)

  //   // prisma.user.create.mockResolvedValueOnce
  //   // expect(prisma.user.findMany()).resolves.toEqual(testUsers)
  //   // return request(app.getHttpServer()).get("/").expect(200).expect("Hello World!")
  // })
  it("/users (GET)", async () => {
    const testUsers: User[] = []
    prisma.user.findMany.mockResolvedValueOnce(testUsers)

    expect(userService.findAll()).resolves.toEqual(testUsers)
  })

  it("/users/:id (GET)", () => {
    const testUser: User = {
      uid: "1",
      email: "email@email.fr",
      name: "name",
      role: "USER",
      password: "password",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    prisma.user.findFirstOrThrow.mockImplementation(
      options =>
        new Promise((resolve, reject) => {
          if (options?.where?.uid === testUser.uid) resolve(testUser)
          else reject(new Error("User not found"))
        }) as any,
    )

    expect(userService.findOne(testUser.uid)).resolves.toEqual(testUser)
    expect(userService.findOne("2")).rejects.toThrow("User not found")
  })
})
