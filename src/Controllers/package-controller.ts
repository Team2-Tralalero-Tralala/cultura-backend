import type { Request, Response } from "express";
import * as PackageService from "../Services/package-service.js";
import { createResponse, createErrorResponse } from "../Libs/createResponse.js";

/**
 * ดึงข้อมูล Package พร้อมความสัมพันธ์หลัก (ไม่รวม booking)
 */

function splitDateTime(dateObj: Date | string) {
  if (!dateObj) return { date: null, time: null };

  const d = new Date(dateObj);
  const date = d.toISOString().split("T")[0]; // yyyy-mm-dd
  const time = d.toTimeString().split(" ")[0]!.slice(0, 5); // HH:mm
  return { date, time };
}


export const getPackageById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return createErrorResponse(res, 400, "Invalid package id");

    const pkg = await PackageService.getPackageDetailById(id);
    if (!pkg) return createErrorResponse(res, 404, "Package not found");

    
    const result = {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      capacity: pkg.capacity,
      price: pkg.price,
      facility: pkg.facility,
      warning: pkg.warning,
      statusPackage: pkg.statusPackage,
      statusApprove: pkg.statusApprove,

      startDate: splitDateTime(pkg.startDate),
      dueDate: splitDateTime(pkg.dueDate),
      openBookingAt: splitDateTime(pkg.openBookingAt),
      closeBookingAt: splitDateTime(pkg.closeBookingAt),

      rejectReason: pkg.rejectReason,
      isDeleted: pkg.isDeleted,
      deleteAt: pkg.deleteAt,

      //ผู้สร้างแพ็กเกจ
      createdBy: pkg.createPackage
        ? {
            id: pkg.createPackage.id,
            name: `${pkg.createPackage.fname} ${pkg.createPackage.lname}`,
          }
        : null,

      //ผู้ดูแล
      overseer: pkg.overseerPackage
        ? {
            id: pkg.overseerPackage.id,
            name: `${pkg.overseerPackage.fname} ${pkg.overseerPackage.lname}`,
          }
        : null,

      //ชุมชน
      //community: pkg.community ? { id: pkg.community.id } : null,

      //แท็ก
      tags: pkg.tagPackages?.map((tp) => tp.tag.name) || [],

      //Location (address คือรวมที่อยู่เป็นประโยคเดียว)
      location: pkg.location
        ? {
            id: pkg.location.id,
            address: `${pkg.location.houseNumber || ""}
              ${pkg.location.villageNumber || ""} ${
              pkg.location.subDistrict || ""
            } ${pkg.location.district || ""} ${pkg.location.province || ""} ${
              pkg.location.postalCode || ""
            }`.trim(),
            detail: pkg.location.detail,
            houseNumber: pkg.location.houseNumber,
            villageNumber: pkg.location.villageNumber,
            alley: pkg.location.alley,
            subDistrict: pkg.location.subDistrict,
            district: pkg.location.district,
            province: pkg.location.province,
            postalCode: pkg.location.postalCode,
            latitude: pkg.location.latitude,
            longitude: pkg.location.longitude,
          }
        : null,

      //ไฟล์รูปภาพ
      files:
        pkg.packageFile?.map((f) => ({
          id: f.id,
          path: f.filePath,
          type: f.type,
        })) || [],

      //Homestay
      homestayHistories:
        pkg.homestayHistories?.map((h) => ({
          id: h.id,
          guestAmount: h.guestAmount,
          checkInTime: h.checkInTime,
          checkOutTime: h.checkOutTime,
          homestay: h.homestay
            ? {
                id: h.homestay.id,
                name: h.homestay.name,
                roomType: h.homestay.roomType,
                capacity: h.homestay.capacity,
                detail: h.homestay.detail,
                images:
                  h.homestay.homestayImage?.map((img) => ({
                    id: img.id,
                    path: img.image,
                    type: img.type,
                  })) || [],
                location: h.homestay.location
                  ? {
                      detail: h.homestay.location.detail,
                      subDistrict: h.homestay.location.subDistrict,
                      district: h.homestay.location.district,
                      province: h.homestay.location.province,
                      latitude: h.homestay.location.latitude,
                      longitude: h.homestay.location.longitude,
                    }
                  : null,
              }
            : null,
        })) || [],
    };

    return createResponse(res, 200, "Package fetched successfully", result);
  } catch (err) {
    console.error("getPackageById error:", err);
    return createErrorResponse(res, 500, "Internal server error");
  }
};
