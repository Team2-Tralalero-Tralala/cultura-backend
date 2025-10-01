import type { Request , Response  } from 'express';
//import type { Response } from 'express';
import * as PackageService from '../Services/package-service.js'
import { createResponse, createErrorResponse } from '../Libs/createResponse.js';

export const getPackageById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return createErrorResponse(res, 400, 'Invalid package id');
    }

    const pkg = await PackageService.getPackageById(id);

    if (!pkg) {
      return createErrorResponse(res, 404, 'Package not found');
    }

    return createResponse(res, 200, 'Package fetched successfully', pkg);
  } catch (err: any) {
    console.error(err);
    return createErrorResponse(res, 500, 'Internal server error');
  }
};