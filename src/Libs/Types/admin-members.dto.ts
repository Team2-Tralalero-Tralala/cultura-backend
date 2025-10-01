// DTOs สำหรับ /api/admin/communities/:communityId/members

import { IsInt, IsNumberString, IsOptional, IsString, Max, Min } from "class-validator";

/** :params */
export class CommunityIdParamsDto {
  @IsNumberString()
  communityId!: number; // แปลงเป็น number ใน controller/service
}

/** :query */
export class MembersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;
}
