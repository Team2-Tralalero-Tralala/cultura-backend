// src/Services/package-service.ts
import prisma from "../Services/database-service.js";

/**
 * ดึงข้อมูล Package โดย include ทุกความสัมพันธ์สำคัญ (ยกเว้น booking)
 */
export const getPackageDetailById = async (id: number) => {
  return await prisma.package.findUnique({
    //ดึงแพ็กเกจโดย id
    where: { id },
    include: {
      //ผู้สร้างแพ็กเกจ
      createPackage: {
        select: {
          id: true,
          fname: true,
          lname: true,
        },
      },
      //ผู้ดูแลแพ็กเกจ
      overseerPackage: {
        select: {
          id: true,
          fname: true,
          lname: true,
        },
      },
      //Community (เอาแค่ id)
      //community: {
      //  select: {
      //    id: true,
      //  },
      //},
      //Tag
      tagPackages: {
        include: {
          tag: {
            select: { id: true, name: true },
          },
        },
      },
      //File
      packageFile: {
        select: {
          id: true,
          filePath: true,
          type: true,
        },
      },
      //Location
      location: {
        select: {
          id: true,
          detail: true,
          houseNumber: true,
          villageNumber: true,
          alley: true,
          subDistrict: true,
          district: true,
          province: true,
          postalCode: true,
          latitude: true,
          longitude: true,
        },
      },
      //Homestay histories
      homestayHistories: {
        include: {
          homestay: {
            select: {
              id: true,
              name: true,
              roomType: true,
              capacity: true,
              detail: true,
              homestayImage: {
                select: { id: true, image: true, type: true },
              },
              location: {
                select: {
                  detail: true,
                  subDistrict: true,
                  district: true,
                  province: true,
                  latitude: true,
                  longitude: true,
                },
              },
            },
          },
        },
      },
    },
  });
};
