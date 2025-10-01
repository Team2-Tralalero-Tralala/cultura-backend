import { IsInt, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";

export class CommunityIdParamsDto {
  @IsInt() @IsPositive()
  communityId!: number;
}

export class MembersQueryDto {
  @IsOptional() @IsInt() @Min(0)
  skip?: number;

  @IsOptional() @IsInt() @Min(1) @Max(100)
  take?: number;

  @IsOptional() @IsString()
  search?: string;
}
