import { Router } from "express";
import { MeetingController } from "../controllers";
import { AuthMiddleware } from "../middleware";

const router = Router();

/**
 * @swagger
 * /api/meetings/request:
 *   post:
 *     summary: Create a new meeting request
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - authorId
 *               - postId
 *               - postTitle
 *               - message
 *               - requesterName
 *             properties:
 *               authorId:
 *                 type: integer
 *                 description: ID of the post author
 *               postId:
 *                 type: integer
 *                 description: ID of the post
 *               postTitle:
 *                 type: string
 *                 description: Title of the post
 *               message:
 *                 type: string
 *                 description: Meeting request message
 *               requesterName:
 *                 type: string
 *                 description: Name of the person requesting the meeting
 *     responses:
 *       200:
 *         description: Meeting request created successfully
 *       400:
 *         description: Invalid input or validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/request",
  AuthMiddleware.verifyToken,
  MeetingController.createMeetingRequest
);

/**
 * @swagger
 * /api/meetings/received:
 *   get:
 *     summary: Get meeting requests received by the authenticated user (as author)
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of received meeting requests
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/received",
  AuthMiddleware.verifyToken,
  MeetingController.getMeetingRequestsForAuthor
);

/**
 * @swagger
 * /api/meetings/sent:
 *   get:
 *     summary: Get meeting requests sent by the authenticated user (as requester)
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sent meeting requests
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/sent",
  AuthMiddleware.verifyToken,
  MeetingController.getMeetingRequestsByRequester
);

/**
 * @swagger
 * /api/meetings/{requestId}:
 *   get:
 *     summary: Get meeting request by ID
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meeting request ID
 *     responses:
 *       200:
 *         description: Meeting request details
 *       404:
 *         description: Meeting request not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:requestId",
  AuthMiddleware.verifyToken,
  MeetingController.getMeetingRequestById
);

/**
 * @swagger
 * /api/meetings/{requestId}/respond:
 *   put:
 *     summary: Respond to a meeting request (approve/decline)
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meeting request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, decline]
 *                 description: Response action
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *                 description: Optional scheduled time for the meeting
 *     responses:
 *       200:
 *         description: Meeting request response sent successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Meeting request not found
 */
router.put(
  "/:requestId/respond",
  AuthMiddleware.verifyToken,
  MeetingController.respondToMeetingRequest
);

/**
 * @swagger
 * /api/meetings/{requestId}/complete:
 *   put:
 *     summary: Mark meeting as completed
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meeting request ID
 *     responses:
 *       200:
 *         description: Meeting marked as completed
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Meeting request not found
 */
router.put(
  "/:requestId/complete",
  AuthMiddleware.verifyToken,
  MeetingController.completeMeeting
);

export default router;
