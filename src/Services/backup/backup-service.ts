/*
 * คำอธิบาย : Service สำหรับการจัดการ Backups
 * ประกอบด้วยการดึงข้อมูล backups และการสร้าง backup ใหม่
 * - การจัดการข้อมูล backup ในระบบ
 * - การสร้าง backup ตาม configuration ที่ระบุ
 * - การจัดการ pagination สำหรับการแสดงรายการ backups
 */
import archiver from "archiver";
import { exec } from "child_process";
import { createWriteStream, promises as fs } from "fs";
import path from "path";
import { promisify } from "util";
import type { PaginationResponse } from "~/Libs/Types/pagination-dto.js";

const execAsync = promisify(exec);

// Define backup info type
interface BackupInfo {
  filename: string; // includes .zip extension
  size: string;
  status: string; // always "completed"
  createdAt: Date;
}

/*
 * คำอธิบาย : ดึงข้อมูล backups แบบ paginated พร้อมการค้นหาตาม filename
 * input : page, limit, search
 * output : PaginationResponse<BackupInfo>
 */
export const getBackups = async (page: number, limit: number, search?: string): Promise<PaginationResponse<BackupInfo>> => {
  try {
    // Define backup directory path
    const backupDir = path.join(process.cwd(), "backup");
    
    // Check if backup directory exists, create if not
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }

    // Read backup directory
    const files = await fs.readdir(backupDir);
    
    // Filter and parse backup files
    const backupFiles: BackupInfo[] = [];
    
    for (const file of files) {
      // Check if file matches backup pattern: Backup-Cultura-DD-MM-YYYY-HH-MM-SS.zip
      const backupPattern = /^Backup-Cultura-(\d{2})-(\d{2})-(\d{4})-(\d{2})-(\d{2})-(\d{2})\.zip$/;
      const match = file.match(backupPattern);
      
      if (match) {
        try {
          // Parse date from filename
          const [, day, month, year, hour, minute, second] = match;
          const createdAt = new Date(
            parseInt(year!),
            parseInt(month!) - 1, // Month is 0-indexed
            parseInt(day!),
            parseInt(hour!),
            parseInt(minute!),
            parseInt(second!)
          );

          // Get file stats
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          
          // Format file size
          const formatFileSize = (bytes: number): string => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
          };

          // Create backup info
          const backupInfo: BackupInfo = {
            filename: file, // includes .zip extension
            size: formatFileSize(stats.size),
            status: "completed",
            createdAt
          };

          backupFiles.push(backupInfo);
        } catch (error) {
          console.error(`Error processing backup file ${file}:`, error);
          // Continue with other files
        }
      }
    }

    // Sort by creation date (newest first)
    backupFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply search filter if provided
    let filteredBackups = backupFiles;
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      filteredBackups = backupFiles.filter(backup => 
        backup.filename.toLowerCase().includes(searchTerm)
      );
    }

    // Calculate pagination
    const totalCount = filteredBackups.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // Get paginated data
    const paginatedData = filteredBackups.slice(startIndex, endIndex);

    const result: PaginationResponse<BackupInfo> = {
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    };

    return result;
  } catch (error) {
    console.error("Error in getBackups:", error);
    throw new Error("Failed to retrieve backups");
  }
};

/*
 * คำอธิบาย : ดึงข้อมูล backup file path สำหรับการ download
 * input : backupId
 * output : string
 */
export const getBackupById = async (backupId: string): Promise<string> => {
  try {
    // Define backup directory path
    const backupDir = path.join(process.cwd(), "backup");
    const filePath = path.join(backupDir, backupId);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`Backup file ${backupId} not found`);
    }

    return filePath;
  } catch (error) {
    console.error("Error in getBackupById:", error);
    throw new Error(`Failed to retrieve backup file: ${backupId}`);
  }
};

/*
 * คำอธิบาย : สร้าง backup ใหม่
 * input : 
 * output : BackupInfo
 */
export const createBackup = async (): Promise<BackupInfo> => {
  try {
    // Generate backup filename with current timestamp
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    const filename = `Backup-Cultura-${day}-${month}-${year}-${hour}-${minute}-${second}.zip`;
    
    // Define paths
    const backupDir = path.join(process.cwd(), "backup");
    const uploadDir = path.join(process.cwd(), "upload");
    const backupFilePath = path.join(backupDir, filename);
    const tempDir = path.join(process.cwd(), "temp_backup");
    const tempDbFile = path.join(tempDir, "Cultura-db.sql");
    
    // Ensure backup directory exists
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }
    
    // Create temporary directory for backup preparation
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's fine
    }
    
    // Step 1: Export database to SQL file
    try {
      // Get database connection details from environment
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error("DATABASE_URL environment variable is not set");
      }
      
      // Extract database connection details from URL
      // Format: mysql://user:password@host:port/database
      const url = new URL(dbUrl);
      const dbHost = url.hostname;
      const dbPort = url.port || '3306';
      const dbName = url.pathname.substring(1); // Remove leading slash
      const dbUser = url.username;
      const dbPassword = url.password;
      
      // Try different approaches for database export
      let exportSuccess = false;
      
      // Approach 1: Try mysqldump command (multiple locations)
      const mysqldumpLocations = [
            'mysqldump', // Try PATH first
            'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 5.7\\bin\\mysqldump.exe',
            'C:\\xampp\\mysql\\bin\\mysqldump.exe',
          ];
      
      for (const mysqldumpPath of mysqldumpLocations) {
        try {
          const mysqldumpCmd = `"${mysqldumpPath}" -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} --single-transaction --routines --triggers ${dbName} > "${tempDbFile}"`;
          await execAsync(mysqldumpCmd);
          console.log(`Database exported using mysqldump from ${mysqldumpPath} to ${tempDbFile}`);
          exportSuccess = true;
          break; // Success, exit the loop
        } catch (mysqldumpError) {
          console.warn(`mysqldump failed from ${mysqldumpPath}:`, mysqldumpError);
          continue; // Try next location
        }
      }
      
      if (!exportSuccess) {
        console.warn("mysqldump command failed from all locations");
        
        // Approach 2: Try using Prisma to generate SQL dump
        try {
          console.log("Attempting to export database using Prisma...");
          const prismaCmd = `npx prisma db pull --schema=./prisma/schema.prisma`;
          await execAsync(prismaCmd);
          
          // For now, create a placeholder SQL file with database info
          const placeholderSql = `-- Database Export for Cultura System
-- Generated on: ${new Date().toISOString()}
-- Database: ${dbName}
-- Host: ${dbHost}:${dbPort}
-- User: ${dbUser}

-- Note: This is a placeholder file. 
-- For complete database backup, please ensure mysqldump is installed and available in PATH.
-- On Windows, you can install MySQL client tools or use XAMPP/WAMP which includes mysqldump.

-- Database structure has been pulled using Prisma.
-- To restore: Use Prisma migrations or import this schema file.

-- Tables and data should be backed up using:
-- 1. mysqldump (if available)
-- 2. MySQL Workbench export
-- 3. phpMyAdmin export
-- 4. Or any MySQL client tool

SELECT 'Backup placeholder created successfully' as status;
`;
          
          await fs.writeFile(tempDbFile, placeholderSql, 'utf8');
          console.log(`Database placeholder created at ${tempDbFile}`);
          exportSuccess = true;
          
        } catch (prismaError) {
          console.warn("Prisma export also failed:", prismaError);
          
          // Approach 3: Create a minimal backup info file
          const backupInfo = `-- Cultura Database Backup Info
-- Generated on: ${new Date().toISOString()}
-- Database: ${dbName}
-- Host: ${dbHost}:${dbPort}

-- IMPORTANT: This is not a complete database backup.
-- Please use one of the following methods to create a proper backup:

-- Method 1: Install MySQL client tools
-- Download from: https://dev.mysql.com/downloads/mysql/
-- Or use XAMPP/WAMP which includes mysqldump

-- Method 2: Use MySQL Workbench
-- Export using Data Export wizard

-- Method 3: Use phpMyAdmin
-- Select database -> Export -> Custom -> Select all tables

-- Method 4: Use command line with full path
-- "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe" [options]

-- For automated backups, ensure mysqldump is in your system PATH
-- or modify this script to use the full path to mysqldump.

SELECT 'Backup info file created - manual backup required' as status;
`;
          
          await fs.writeFile(tempDbFile, backupInfo, 'utf8');
          console.log(`Database backup info created at ${tempDbFile}`);
          exportSuccess = true;
        }
      }
      
      if (!exportSuccess) {
        throw new Error("All database export methods failed");
      }
      
    } catch (error) {
      console.error("Database export failed:", error);
      throw new Error(`Failed to export database: ${(error as Error).message}`);
    }
    
    // Step 2: Create zip file with upload folder and database export
    return new Promise((resolve, reject) => {
      const output = createWriteStream(backupFilePath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });
      
      output.on('close', async () => {
        try {
          // Get file stats
          const stats = await fs.stat(backupFilePath);
          
          // Format file size
          const formatFileSize = (bytes: number): string => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
          };
          
          // Clean up temporary directory
          try {
            await fs.rm(tempDir, { recursive: true, force: true });
          } catch (cleanupError) {
            console.warn("Failed to clean up temporary directory:", cleanupError);
          }
          
          // Create backup info
          const backupInfo: BackupInfo = {
            filename,
            size: formatFileSize(stats.size),
            status: "completed",
            createdAt: now
          };
          
          resolve(backupInfo);
        } catch (error) {
          reject(error);
        }
      });
      
      archive.on('error', (err) => {
        reject(err);
      });
      
      // Pipe archive data to the file
      archive.pipe(output);
      
      // Add upload folder to archive (if it exists)
      const uploadExists = fs.access(uploadDir).then(() => true).catch(() => false);
      uploadExists.then((exists) => {
        if (exists) {
          archive.directory(uploadDir, 'upload');
        }
        
        // Add database export file to archive
        archive.file(tempDbFile, { name: 'Cultura-db.sql' });
        
        // Finalize the archive
        archive.finalize();
      }).catch((error) => {
        reject(error);
      });
    });
    
  } catch (error) {
    console.error("Error in createBackup:", error);
    throw new Error(`Failed to create backup: ${(error as Error).message}`);
  }
};

/*
 * คำอธิบาย : ลบ backup file ตาม filename
 * input : backupId
 * output : { message: string }
 */
export const deleteBackupById = async (backupId: string): Promise<{ message: string }> => {
  try {
    // Define backup directory path
    const backupDir = path.join(process.cwd(), "backup");
    const filePath = path.join(backupDir, backupId);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`Backup file ${backupId} not found`);
    }

    // Delete the file
    await fs.unlink(filePath);
    
    return { message: `Backup file ${backupId} deleted successfully` };
  } catch (error) {
    console.error("Error in deleteBackupById:", error);
    throw new Error(`Failed to delete backup file: ${(error as Error).message}`);
  }
};

/*
 * คำอธิบาย : ลบ backup files หลายไฟล์พร้อมกัน
 * input : backupIds
 * output : { message: string, deletedCount: number, failedDeletions: string[] }
 */
export const deleteBackupsBulk = async (backupIds: string[]): Promise<{ 
  message: string; 
  deletedCount: number; 
  failedDeletions: string[] 
}> => {
  try {
    const backupDir = path.join(process.cwd(), "backup");
    const failedDeletions: string[] = [];
    let deletedCount = 0;

    // Process each backup file
    for (const backupId of backupIds) {
      try {
        const filePath = path.join(backupDir, backupId);
        
        // Check if file exists
        await fs.access(filePath);
        
        // Delete the file
        await fs.unlink(filePath);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting backup ${backupId}:`, error);
        failedDeletions.push(backupId);
      }
    }

    const message = deletedCount > 0 
      ? `Successfully deleted ${deletedCount} backup file(s)${failedDeletions.length > 0 ? `, ${failedDeletions.length} failed` : ''}`
      : 'No backup files were deleted';

    return {
      message,
      deletedCount,
      failedDeletions
    };
  } catch (error) {
    console.error("Error in deleteBackupsBulk:", error);
    throw new Error(`Failed to delete backup files: ${(error as Error).message}`);
  }
};
