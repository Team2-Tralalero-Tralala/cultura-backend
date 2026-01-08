import {
  IsString,
  IsNotEmpty,
  MaxLength,
} from "class-validator";

export class TagDto {
  @IsString()
  @IsNotEmpty({ message: "tag name ห้ามว่าง" })
  @MaxLength(90, { message: "tag name ยาวเกิน 90 ตัวอักษร" })
  name: string; 
}
