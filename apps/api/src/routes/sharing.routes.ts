import express from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { uploadToS3, generateSignedUrl } from "../lib/helper";

const sharingRoutes = express.Router();
const prisma = new PrismaClient();
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const addCommentSchema = z.object({
  text: z.string().min(1).max(1000),
  userName: z.string().min(1).max(100),
});

const createShareSchema = z.object({
  fileId: z.number(),
  shareType: z.string(),
  permission: z.enum(["view", "comment", "edit", "download"]),
  password: z.string().optional(),
  expiresAt: z.string().optional(),
  maxDownloads: z.number().nullable().optional(),
});

const updateShareSchema = z.object({
  isActive: z.boolean().optional(),
  expiresAt: z.string().nullable().optional(),
  maxDownloads: z.number().nullable().optional(),
});

// Get all shares for a specific file
sharingRoutes.get("/file/:fileId", async (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);

    if (isNaN(fileId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid file ID",
      });
    }

    const file = await prisma.userFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    const shares = await prisma.fileShare.findMany({
      where: { fileId },
      include: {
        owner: {
          select: {
            firstName: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
            activities: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      shares: shares.map((share) => ({
        id: share.id,
        shareToken: share.shareToken,
        shareType: share.shareType,
        permission: share.permission,
        hasPassword: !!share.password,
        expiresAt: share.expiresAt?.toISOString() || null,
        maxDownloads: share.maxDownloads,
        downloadCount: share.downloadCount,
        isActive: share.isActive,
        createdAt: share.createdAt.toISOString(),
        updatedAt: share.updatedAt.toISOString(),
        ownerName: share.owner.firstName || share.owner.email,
        commentCount: share._count.comments,
        activityCount: share._count.activities,
        url: `${frontendUrl}/shared/${share.shareToken}`,
      })),
    });
  } catch (err) {
    console.error("Error fetching shares:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch shares",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Create a new share
sharingRoutes.post("/create", async (req, res) => {
  try {
    const validated = createShareSchema.parse(req.body);

    const file = await prisma.userFile.findUnique({
      where: { id: validated.fileId },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    if (file.deletedAt) {
      return res.status(400).json({
        success: false,
        error: "Cannot share a deleted file",
      });
    }

    const shareToken = crypto.randomBytes(32).toString("hex");

    let hashedPassword: string | null = null;
    if (validated.password && validated.password.trim().length > 0) {
      hashedPassword = await bcrypt.hash(validated.password, 12);
    }

    let expiresAt: Date | null = null;
    if (validated.expiresAt) {
      expiresAt = new Date(validated.expiresAt);
      if (expiresAt <= new Date()) {
        return res.status(400).json({
          success: false,
          error: "Expiration date must be in the future",
        });
      }
    }

    const share = await prisma.fileShare.create({
      data: {
        fileId: validated.fileId,
        ownerId: file.userId,
        shareToken,
        shareType: validated.shareType,
        permission: validated.permission,
        password: hashedPassword,
        expiresAt,
        maxDownloads: validated.maxDownloads,
        isActive: true,
      },
      include: {
        owner: {
          select: {
            firstName: true,
            email: true,
          },
        },
      },
    });

    await prisma.shareActivity.create({
      data: {
        shareId: share.id,
        userId: file.userId,
        action: "created",
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        metadata: {
          permission: validated.permission,
          hasPassword: !!hashedPassword,
          expiresAt: expiresAt?.toISOString() || null,
        },
      },
    });

    res.status(201).json({
      success: true,
      share: {
        id: share.id,
        shareToken: share.shareToken,
        shareType: share.shareType,
        permission: share.permission,
        hasPassword: !!share.password,
        expiresAt: share.expiresAt?.toISOString() || null,
        maxDownloads: share.maxDownloads,
        downloadCount: share.downloadCount,
        isActive: share.isActive,
        createdAt: share.createdAt.toISOString(),
        url: `${frontendUrl}/shared/${share.shareToken}`,
      },
    });
  } catch (err) {
    console.error("Error creating share:", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: err.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to create share",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Update a share
sharingRoutes.put("/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;
    const validated = updateShareSchema.parse(req.body);

    const existingShare = await prisma.fileShare.findUnique({
      where: { id: shareId },
    });

    if (!existingShare) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    const updateData: any = {};

    if (validated.isActive !== undefined) {
      updateData.isActive = validated.isActive;
    }

    if (validated.expiresAt !== undefined) {
      if (validated.expiresAt === null) {
        updateData.expiresAt = null;
      } else {
        const newExpiresAt = new Date(validated.expiresAt);
        if (newExpiresAt <= new Date()) {
          return res.status(400).json({
            success: false,
            error: "Expiration date must be in the future",
          });
        }
        updateData.expiresAt = newExpiresAt;
      }
    }

    if (validated.maxDownloads !== undefined) {
      updateData.maxDownloads = validated.maxDownloads;
    }

    const share = await prisma.fileShare.update({
      where: { id: shareId },
      data: updateData,
    });

    await prisma.shareActivity.create({
      data: {
        shareId: share.id,
        userId: existingShare.ownerId,
        action: "updated",
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        metadata: updateData,
      },
    });

    res.json({
      success: true,
      share: {
        id: share.id,
        shareToken: share.shareToken,
        isActive: share.isActive,
        expiresAt: share.expiresAt?.toISOString() || null,
        maxDownloads: share.maxDownloads,
        updatedAt: share.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Error updating share:", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: err.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update share",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Delete a share
sharingRoutes.delete("/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;

    const existingShare = await prisma.fileShare.findUnique({
      where: { id: shareId },
    });

    if (!existingShare) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    await prisma.fileShare.delete({
      where: { id: shareId },
    });

    res.json({
      success: true,
      message: "Share deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting share:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete share",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Get public share info (no auth required)
sharingRoutes.get("/public/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const share = await prisma.fileShare.findUnique({
      where: { shareToken: token },
      include: {
        owner: {
          select: {
            firstName: true,
            email: true,
          },
        },
      },
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    if (!share.isActive) {
      return res.status(403).json({
        success: false,
        error: "This share is no longer active",
      });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      await prisma.fileShare.update({
        where: { id: share.id },
        data: { isActive: false },
      });
      return res.status(403).json({
        success: false,
        error: "This share has expired",
      });
    }

    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      await prisma.fileShare.update({
        where: { id: share.id },
        data: { isActive: false },
      });
      return res.status(403).json({
        success: false,
        error: "Maximum download limit reached",
      });
    }

    const file = await prisma.userFile.findUnique({
      where: { id: share.fileId },
    });

    if (!file || file.deletedAt) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    res.json({
      success: true,
      share: {
        id: share.id,
        fileName: file.originalName,
        fileSize: Number(file.size),
        mimeType: file.mimeType,
        permission: share.permission,
        ownerName: share.owner.firstName || share.owner.email,
        hasPassword: !!share.password,
        expiresAt: share.expiresAt?.toISOString() || null,
        maxDownloads: share.maxDownloads,
        downloadCount: share.downloadCount,
      },
    });
  } catch (err) {
    console.error("Error fetching share info:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch share info",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Access a shared file (verify password if needed)
sharingRoutes.post("/access/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const share = await prisma.fileShare.findUnique({
      where: { shareToken: token },
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    if (!share.isActive) {
      return res.status(403).json({
        success: false,
        error: "This share is no longer active",
      });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      await prisma.fileShare.update({
        where: { id: share.id },
        data: { isActive: false },
      });
      return res.status(403).json({
        success: false,
        error: "This share has expired",
      });
    }

    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      await prisma.fileShare.update({
        where: { id: share.id },
        data: { isActive: false },
      });
      return res.status(403).json({
        success: false,
        error: "Maximum download limit reached",
      });
    }

    if (share.password) {
      if (!password) {
        return res.status(401).json({
          success: false,
          error: "Password required",
        });
      }

      const isValid = await bcrypt.compare(password, share.password);
      if (!isValid) {
        await prisma.shareActivity.create({
          data: {
            shareId: share.id,
            action: "failed_password",
            ipAddress: req.ip || "unknown",
            userAgent: req.headers["user-agent"] || "unknown",
          },
        });
        return res.status(401).json({
          success: false,
          error: "Invalid password",
        });
      }
    }

    const file = await prisma.userFile.findUnique({
      where: { id: share.fileId },
    });

    if (!file || file.deletedAt) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    const signedUrl = await generateSignedUrl(file.s3Key, 3600);

    if (share.permission === "download") {
      await prisma.fileShare.update({
        where: { id: share.id },
        data: { downloadCount: share.downloadCount + 1 },
      });
    }

    await prisma.shareActivity.create({
      data: {
        shareId: share.id,
        action: "accessed",
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      },
    });

    res.json({
      success: true,
      signedUrl,
    });
  } catch (err) {
    console.error("Error accessing file:", err);
    res.status(500).json({
      success: false,
      error: "Failed to access file",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Get comments for a shared file
sharingRoutes.get("/comments/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const share = await prisma.fileShare.findUnique({
      where: { shareToken: token },
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    if (!["comment", "edit"].includes(share.permission)) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to view comments",
      });
    }

    const comments = await prisma.shareComment.findMany({
      where: { shareId: share.id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        userName: true,
        text: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      comments: comments.map((c) => ({
        id: c.id,
        userName: c.userName,
        text: c.text,
        timestamp: c.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch comments",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Add a comment to a shared file
sharingRoutes.post("/comments/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const validated = addCommentSchema.parse(req.body);

    const share = await prisma.fileShare.findUnique({
      where: { shareToken: token },
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    if (!share.isActive) {
      return res.status(403).json({
        success: false,
        error: "This share is no longer active",
      });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        error: "This share has expired",
      });
    }

    if (!["comment", "edit"].includes(share.permission)) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to comment",
      });
    }

    const comment = await prisma.shareComment.create({
      data: {
        shareId: share.id,
        userName: validated.userName,
        text: validated.text,
      },
      select: {
        id: true,
        userName: true,
        text: true,
        createdAt: true,
      },
    });

    await prisma.shareActivity.create({
      data: {
        shareId: share.id,
        action: "commented",
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        metadata: {
          commentId: comment.id,
          userName: validated.userName,
        },
      },
    });

    res.status(201).json({
      success: true,
      comment: {
        id: comment.id,
        userName: comment.userName,
        text: comment.text,
        timestamp: comment.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: err.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to add comment",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Edit shared file content (for text files with edit permission)
sharingRoutes.post("/edit/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { content } = req.body;

    if (typeof content !== "string") {
      return res.status(400).json({
        success: false,
        error: "Content must be a string",
      });
    }

    const share = await prisma.fileShare.findUnique({
      where: { shareToken: token },
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    if (share.permission !== "edit") {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to edit",
      });
    }

    if (!share.isActive) {
      return res.status(403).json({
        success: false,
        error: "This share is no longer active",
      });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        error: "This share has expired",
      });
    }

    const file = await prisma.userFile.findUnique({
      where: { id: share.fileId },
    });

    if (!file || file.deletedAt) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    const mimeType = file.mimeType.toLowerCase();
    const isTextFile =
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/xml" ||
      mimeType === "application/javascript";

    if (!isTextFile) {
      return res.status(400).json({
        success: false,
        error: "Only text files can be edited",
      });
    }

    await uploadToS3(file.s3Key, content, file.mimeType);

    const newSize = Buffer.byteLength(content, "utf-8");
    await prisma.userFile.update({
      where: { id: file.id },
      data: {
        size: BigInt(newSize),
        updatedAt: new Date(),
      },
    });

    await prisma.shareActivity.create({
      data: {
        shareId: share.id,
        action: "edited",
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        metadata: {
          previousSize: Number(file.size),
          newSize,
        },
      },
    });

    res.json({
      success: true,
      message: "File updated successfully",
      fileSize: newSize,
    });
  } catch (err) {
    console.error("Error editing file:", err);
    res.status(500).json({
      success: false,
      error: "Failed to edit file",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

export default sharingRoutes;
