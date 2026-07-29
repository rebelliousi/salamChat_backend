import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from 'src/dto/update-profile.dto';
import { MatchFilterDto } from 'src/dto/match-filter.dto';
import { Prisma } from 'src/generated/prisma/client';

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

  async findMatches(userId: number, filters: MatchFilterDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) return [];

    const whereClause: Prisma.UserWhereInput = {
      id: { not: userId },
      isVerified: true,
    };

    if (filters.minAge || filters.maxAge) {
      whereClause.age = {
        gte: filters.minAge || 18,
        lte: filters.maxAge || 100,
      };
    }

    if (filters.level) {
      whereClause.level = filters.level;
    }

    if (filters.targetLanguage) {
      if (filters.languageFilterType === 'learning') {
        whereClause.targetLanguage = filters.targetLanguage;
      } else {
        whereClause.nativeLanguage = filters.targetLanguage;
      }
    } else {
      whereClause.OR = [
        {
          nativeLanguage: user.targetLanguage,
          targetLanguage: user.nativeLanguage,
        },
        {
          targetLanguage: user.targetLanguage,
        },
      ];
    }

    const matches = await this.prisma.user.findMany({
      where: whereClause,
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
        isOnline: true,
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
