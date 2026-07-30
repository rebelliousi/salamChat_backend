import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async blockUser(blockerId: number, blockedId: number) {
    if (blockerId === blockedId) {
      throw new BadRequestException('You cannot block yourself');
    }

    try {
      return await this.prisma.block.create({
        data: { blockerId, blockedId },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('You have already blocked this user');
      }
      throw err;
    }
  }

  async unblockUser(blockerId: number, blockedId: number) {
    try {
      return await this.prisma.block.delete({
        where: {
          blockerId_blockedId: { blockerId, blockedId },
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException('You have not blocked this user');
      }
      throw err;
    }
  }
  async reportUser(reporterId: number, reportedId: number, reason: string) {
    if (reporterId === reportedId) {
      throw new BadRequestException('You cannot report yourself');
    }

    return this.prisma.report.create({
      data: { reporterId, reportedId, reason },
    });
  }

  async findMatches(userId: number, filters: MatchFilterDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) return [];

    const blockedUsers = await this.prisma.block.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    });
    const blockedIds = blockedUsers.map((b) => b.blockedId);

    const whereClause: Prisma.UserWhereInput = {
      id: {
        not: userId,
        notIn: blockedIds,
      },
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
