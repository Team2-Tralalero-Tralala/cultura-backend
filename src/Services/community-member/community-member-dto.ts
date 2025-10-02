import { IsNotEmpty, IsInt } from "class-validator";

export class CommunityMemberDto {
  @IsInt()
  @IsNotEmpty({ message: "member ห้ามว่าง" })
  memberId: number;

  @IsInt()
  @IsNotEmpty({ message: "number ห้ามว่าง" })
  roleId: number;
}
