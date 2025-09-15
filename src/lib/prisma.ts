import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const datasourceUrl = process.env.DATABASE_URL ?? process.env.DIRECT_URL
const missingDatasourceMessage =
  'Database connection string is not configured. Please set DATABASE_URL or DIRECT_URL in your environment variables.'

const createPrismaClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    datasources: {
      db: {
        url: datasourceUrl!,
      },
    },
  })

let prismaClient: PrismaClient

if (datasourceUrl) {
  prismaClient = globalForPrisma.prisma ?? createPrismaClient()

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient
  }

  // Graceful shutdown when Prisma is actually connected
  process.on('beforeExit', async () => {
    await prismaClient.$disconnect()
  })
} else {
  if (process.env.NODE_ENV !== 'test') {
    console.error(missingDatasourceMessage)
  }

  prismaClient = new Proxy(
    {} as PrismaClient,
    {
      get(_target, prop) {
        if (prop === '$disconnect') {
          return async () => undefined
        }

        throw new Error(missingDatasourceMessage)
      },
    }
  )

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient
  }
}

export const prisma = prismaClient
export const prismaConfigurationError = datasourceUrl ? null : missingDatasourceMessage
