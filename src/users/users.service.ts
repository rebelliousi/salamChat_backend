import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from 'src/dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: number) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async updateAvatar(userId: number, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
  }

  async findMatches(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) return [];

    const matches = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        OR: [
          {
            nativeLanguage: user.targetLanguage,
            targetLanguage: user.nativeLanguage,
          },
          {
            targetLanguage: user.targetLanguage,
          },
        ],
      },
      select: {
        id: true,
        name: true,
        nativeLanguage: true,
        targetLanguage: true,
        level: true,
        avatarUrl: true,
        bio: true,
        age: true,
        gender: true,
      },
    });

    return matches.map((match) => ({
      ...match,
      matchType:
        match.nativeLanguage === user.targetLanguage &&
        match.targetLanguage === user.nativeLanguage
          ? 'reciprocal'
          : 'study_buddy',
    }));
  }
}
