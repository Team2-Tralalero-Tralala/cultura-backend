export default {
    // For swagger-jsdoc v6+ use "definition"
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Cultura API",
            version: "1.0.0",
            description: "API documentation",
        },
        servers: [{ url: "http://localhost:3000" }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                LocationDto: {
                    type: "object",
                    properties: {
                        lat: { type: "number", example: 13.7563 },
                        lng: { type: "number", example: 100.5018 },
                        address: { type: "string", example: "Bangkok" },
                    },
                },
                PackageFileDto: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        type: { type: "string", example: "IMAGE" },
                        url: {
                            type: "string",
                            format: "uri",
                            example: "https://example.com/img1.jpg",
                        },
                    },
                },
                PackagePublishStatus: {
                    type: "string",
                    enum: ["PUBLISH", "UNPUBLISH", "DRAFT"],
                },
                PackageApproveStatus: {
                    type: "string",
                    enum: ["WAIT", "APPROVE"],
                },

                updatePackageDto: {
                    type: "object",
                    required: [
                        "overseerMemberId",
                        "name",
                        "description",
                        "capacity",
                        "price",
                        "warning",
                        "startDate",
                        "dueDate",
                        "bookingOpenDate",
                        "bookingCloseDate",
                        "facility",
                    ],
                    properties: {
                        communityId: { type: "integer", nullable: true },
                        location: { $ref: "#/components/schemas/LocationDto" },
                        overseerMemberId: { type: "integer", minimum: 1 },
                        name: { type: "string", maxLength: 100 },
                        description: { type: "string", maxLength: 500 },
                        capacity: { type: "integer", minimum: 1 },
                        price: { type: "number", minimum: 0 },
                        warning: { type: "string", maxLength: 200 },
                        statusPackage: {
                            $ref: "#/components/schemas/PackagePublishStatus",
                        },
                        statusApprove: {
                            $ref: "#/components/schemas/PackageApproveStatus",
                        },
                        startDate: {
                            type: "string",
                            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                            example: "2025-11-20",
                        },
                        dueDate: {
                            type: "string",
                            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                            example: "2025-11-30",
                        },
                        startTime: {
                            type: "string",
                            nullable: true,
                            pattern: "^\\d{2}:\\d{2}$",
                            example: "08:00",
                        },
                        endTime: {
                            type: "string",
                            nullable: true,
                            pattern: "^\\d{2}:\\d{2}$",
                            example: "12:00",
                        },
                        bookingOpenDate: {
                            type: "string",
                            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                        },
                        bookingCloseDate: {
                            type: "string",
                            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                        },
                        openTime: {
                            type: "string",
                            nullable: true,
                            pattern: "^\\d{2}:\\d{2}$",
                        },
                        closeTime: {
                            type: "string",
                            nullable: true,
                            pattern: "^\\d{2}:\\d{2}$",
                        },
                        facility: { type: "string", maxLength: 200 },
                        packageFile: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/PackageFileDto",
                            },
                        },
                        tagIds: {
                            type: "array",
                            items: { type: "integer" },
                            description: "ArrayUnique",
                        },
                        homestayId: { type: "integer", nullable: true },
                        homestayCheckInDate: {
                            type: "string",
                            nullable: true,
                            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                        },
                        homestayCheckInTime: {
                            type: "string",
                            nullable: true,
                            pattern: "^\\d{2}:\\d{2}$",
                        },
                        homestayCheckOutDate: {
                            type: "string",
                            nullable: true,
                            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                        },
                        homestayCheckOutTime: {
                            type: "string",
                            nullable: true,
                            pattern: "^\\d{2}:\\d{2}$",
                        },
                        bookedRoom: {
                            type: "integer",
                            nullable: true,
                            minimum: 1,
                        },
                    },
                },

                UpdatePackageSuccess: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Package Updated" },
                        packageId: { type: "integer", example: 123 },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Error message" },
                    },
                },
            },
        },
    },
    // Point to files that contain your @swagger JSDoc blocks
    apis: ["./src/Routes/*.ts"],
    docExpansion: "full",
};