import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferenceGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  async next(prefix: 'REC' | 'DEL' | 'INT'): Promise<string> {
    const year = new Date().getUTCFullYear();
    const key = `${prefix}-${year}`;

    const rows = await this.prisma.$queryRaw<{ value: number }[]>`
      INSERT INTO "DocumentCounter" ("key", "value", "updatedAt")
      VALUES (${key}, 1, CURRENT_TIMESTAMP)
      ON CONFLICT ("key")
      DO UPDATE SET "value" = "DocumentCounter"."value" + 1,
                    "updatedAt" = CURRENT_TIMESTAMP
      RETURNING "value"
    `;

    const value = Number(rows[0]?.value);
    if (!Number.isInteger(value) || value < 1) {
      throw new Error('Failed to generate operation reference number');
    }

    return `${prefix}-${year}-${String(value).padStart(4, '0')}`;
  }
}
