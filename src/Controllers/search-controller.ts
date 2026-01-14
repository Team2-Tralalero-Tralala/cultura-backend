/*
 * คำอธิบาย : Controller สำหรับการค้นหาแพ็กเกจและชุมชน
 * รองรับการค้นหาแพ็กเกจตาม tag (หลาย tag) และการค้นหาทั้งแพ็กเกจและชุมชนตาม keyword
 * สามารถใช้ search และ tag ร่วมกันได้
 */
import { createErrorResponse, createResponse } from "~/Libs/createResponse.js";
import {
  commonDto,
  type TypedHandlerFromDto,
} from "~/Libs/Types/TypedHandler.js";
import { SearchQueryDto } from "../Services/search/search-dto.js";
import * as SearchService from "../Services/search/search-service.js";

/*
 * คำอธิบาย : DTO สำหรับค้นหาแพ็กเกจและชุมชน
 * Input : 
 *   - query.search - คำค้นหา (optional)
 *   - query.tag - array ของ tag names (optional, สามารถระบุหลาย tag ได้)
 *   - query.tags - comma-separated tags (optional, เช่น "tag1,tag2")
 *   - query.priceMin - ราคาขั้นต่ำ (optional)
 *   - query.priceMax - ราคาสูงสุด (optional)
 *   - query.sort - การเรียงลำดับ (optional, ค่าที่อนุญาต: latest, price-low, price-high, popular)
 *   - query.page, query.limit - pagination
 * Output : ข้อมูลแพ็กเกจและชุมชนที่เกี่ยวข้อง
 */
export const searchDto = {
  query: SearchQueryDto,
} satisfies commonDto;

/*
 * ฟังก์ชัน : search
 * คำอธิบาย : Handler สำหรับค้นหาแพ็กเกจและชุมชน
 * รองรับ:
 *   - ค้นหาตาม keyword เท่านั้น: ?search=keyword
 *   - ค้นหาตาม tag(s) เท่านั้น: ?tag=tag1&tag=tag2 หรือ ?tags=tag1,tag2
 *   - ค้นหาตาม keyword และ tag(s) ร่วมกัน: ?search=keyword&tag=tag1&tag=tag2
 *   - กรองตามราคา: ?priceMin=1000&priceMax=5000
 *   - เรียงลำดับผลลัพธ์: ?sort=latest|price-low|price-high|popular
 * Input : req.query.search, req.query.tag (array), req.query.tags (comma-separated), req.query.priceMin, req.query.priceMax, req.query.sort, req.query.page, req.query.limit
 * Output :
 *   - 200 OK พร้อมข้อมูลแพ็กเกจและชุมชนที่เกี่ยวข้อง
 *   - 400 Bad Request ถ้ามี error หรือไม่ระบุ search/tag อย่างใดอย่างหนึ่ง
 */
export const search: TypedHandlerFromDto<typeof searchDto> = async (
  req,
  res
) => {
  try {
    const searchTerm = req.query.search as string | undefined;
    const tags = req.query.tag as string[] | string | undefined;
    const commaSeparatedTags = req.query.tags as string[] | string | undefined;
    const priceMin = (req.query.priceMin as number | undefined) ?? 0;
    const priceMax = req.query.priceMax as number | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const sort = (req.query.sort as "latest" | "price-low" | "price-high" | "popular" | undefined) ?? "latest";
    const page = (req.query.page as number) ?? 1;
    const limit = (req.query.limit as number) ?? 10;

    // รวม tags จากทั้ง tag และ tags parameters
    let tagArray: string[] | undefined;
    const allTags: string[] = [];

    // เพิ่ม tags จาก tag parameter (multiple tag=)
    if (tags) {
      if (Array.isArray(tags)) {
        allTags.push(...tags.filter((tag) => tag && tag.trim() !== ""));
      } else {
        allTags.push(tags.trim());
      }
    }

    // เพิ่ม tags จาก tags parameter (comma-separated)
    if (commaSeparatedTags) {
      if (Array.isArray(commaSeparatedTags)) {
        // ถ้าเป็น array ให้ join แล้ว split
        const tagsText = commaSeparatedTags.join(",");
        allTags.push(
          ...tagsText
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "")
        );
      } else {
        // ถ้าเป็น string ให้ split
        allTags.push(
          ...commaSeparatedTags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "")
        );
      }
    }

    // ลบ duplicates
    tagArray = allTags.length > 0 ? [...new Set(allTags)] : undefined;

    // ตรวจสอบว่ามี search หรือ tag อย่างน้อยหนึ่งอย่าง
    const hasSearch = searchTerm && searchTerm.trim() !== "";
    const hasTags = tagArray && tagArray.length > 0;
    if (!hasSearch && !hasTags) {
      return createErrorResponse(
        res,
        400,
        "กรุณาระบุ search หรือ tag อย่างน้อยหนึ่งอย่าง"
      );
    }

    // ตรวจสอบ priceMin และ priceMax
    if (priceMin !== undefined && priceMax !== undefined && priceMin > priceMax) {
      return createErrorResponse(
        res,
        400,
        "priceMin ต้องน้อยกว่าหรือเท่ากับ priceMax"
      );
    }

    const result = await SearchService.searchPackagesAndCommunities(
      hasSearch ? searchTerm : undefined,
      hasTags ? tagArray : undefined,
      priceMin,
      priceMax,
      startDate,
      endDate,
      page,
      limit,
      sort
    );
    return createResponse(
      res,
      200,
      "ดึงข้อมูลผลลัพธ์การค้นหาสำเร็จ",
      result
    );
  } catch (error) {
    return createErrorResponse(res, 400, (error as Error).message);
  }
};
