import {
  Controller,
  Get,
  UseGuards,
  Request,
  Patch,
  Body,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from 'src/dto/update-profile.dto';
import { MatchFilterDto } from 'src/dto/match-filter.dto';
import { ReportUserDto } from 'src/dto/report-user.dto';
import { BlockUserDto } from 'src/dto/block-user.dto';

interface AuthenticatedRequest {
  user: {
    userId: number;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Request() req: AuthenticatedRequest) {
    return this.usersService.getMe(req.user.userId);
  }

  @Patch('profile')
  updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadAvatar(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarUrl = `/uploads/${file.filename}`;
    return this.usersService.updateAvatar(req.user.userId, avatarUrl);
  }

  @Get('matches')
  getMatches(
    @Request() req: AuthenticatedRequest,
    @Query() filters: MatchFilterDto,
  ) {
    return this.usersService.findMatches(req.user.userId, filters);
  }

  @Post('block')
  blockUser(@Request() req: AuthenticatedRequest, @Body() dto: BlockUserDto) {
    return this.usersService.blockUser(req.user.userId, dto.blockedId);
  }

  @Post('unblock')
  unblockUser(@Request() req: AuthenticatedRequest, @Body() dto: BlockUserDto) {
    return this.usersService.unblockUser(req.user.userId, dto.blockedId);
  }

  @Post('report')
  reportUser(@Request() req: AuthenticatedRequest, @Body() dto: ReportUserDto) {
    return this.usersService.reportUser(
      req.user.userId,
      dto.reportedId,
      dto.reason,
    );
  }
}
