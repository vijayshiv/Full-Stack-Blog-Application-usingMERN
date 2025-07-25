import { Request, Response } from "express";
import { MeetingService, NotificationService } from "../services";
import { successMessage, errorMessage } from "../utils";
import { MeetingRequestInput, MeetingResponse, JWTPayload } from "../types";
import { socketService } from "../services/socketService";

export class MeetingController {
  /**
   * Create a new meeting request
   */
  static async createMeetingRequest(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const user = req.user as JWTPayload;
      const data = req.body as MeetingRequestInput;

      // Validate required fields
      if (!data.authorId || !data.postId || !data.postTitle || !data.message) {
        res.json(errorMessage("All fields are required"));
        return;
      }

      if (!data.message.trim() || data.message.trim().length < 10) {
        res.json(errorMessage("Message must be at least 10 characters long"));
        return;
      }

      const result = await MeetingService.createMeetingRequest(user.id, data);

      // Create notification for the author
      try {
        const notification =
          await NotificationService.createMeetingRequestNotification(
            data.authorId,
            user.fullname || "Someone",
            data.postTitle,
            data.message,
            result.requestId,
            user.id
          );

        if (notification) {
          socketService.sendNotificationToUser(
            notification.user_id,
            notification
          );
        }
      } catch (notifError) {
        console.error(
          "Error sending meeting request notification:",
          notifError
        );
        // Don't fail the request if notification fails
      }

      res.json(successMessage(result));
    } catch (error) {
      console.error("Error creating meeting request:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error creating meeting request";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get meeting requests for the authenticated user (as author)
   */
  static async getMeetingRequestsForAuthor(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const user = req.user as JWTPayload;
      const requests = await MeetingService.getMeetingRequestsForAuthor(
        user.id
      );
      res.json(successMessage(requests));
    } catch (error) {
      console.error("Error getting meeting requests:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error retrieving meeting requests";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get meeting requests sent by the authenticated user (as requester)
   */
  static async getMeetingRequestsByRequester(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const user = req.user as JWTPayload;
      const requests = await MeetingService.getMeetingRequestsByRequester(
        user.id
      );
      res.json(successMessage(requests));
    } catch (error) {
      console.error("Error getting sent meeting requests:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error retrieving sent meeting requests";
      res.json(errorMessage(message));
    }
  }

  /**
   * Respond to a meeting request (approve/decline)
   */
  static async respondToMeetingRequest(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const user = req.user as JWTPayload;
      const requestId = parseInt(req.params.requestId);
      const { action, scheduledTime } = req.body as MeetingResponse;

      if (isNaN(requestId) || requestId <= 0) {
        res.json(errorMessage("Valid request ID is required"));
        return;
      }

      if (!action || !["approve", "decline"].includes(action)) {
        res.json(errorMessage("Action must be either 'approve' or 'decline'"));
        return;
      }

      let parsedScheduledTime: Date | undefined;
      if (scheduledTime && action === "approve") {
        parsedScheduledTime = new Date(scheduledTime);
        if (isNaN(parsedScheduledTime.getTime())) {
          res.json(errorMessage("Invalid scheduled time format"));
          return;
        }
      }

      const result = await MeetingService.respondToMeetingRequest(
        requestId,
        user.id,
        action,
        parsedScheduledTime
      );

      // Send notification to the requester
      try {
        const meetingRequest = await MeetingService.getMeetingRequestById(
          requestId
        );
        if (meetingRequest) {
          const notification =
            await NotificationService.createMeetingResponseNotification(
              meetingRequest.requester_id,
              user.fullname || "Author",
              meetingRequest.post_title,
              action,
              requestId,
              user.id,
              result.meetingUrl
            );

          if (notification) {
            socketService.sendNotificationToUser(
              notification.user_id,
              notification
            );
          }
        }
      } catch (notifError) {
        console.error(
          "Error sending meeting response notification:",
          notifError
        );
      }

      res.json(successMessage(result));
    } catch (error) {
      console.error("Error responding to meeting request:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error responding to meeting request";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get meeting request by ID
   */
  static async getMeetingRequestById(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requestId = parseInt(req.params.requestId);
      const user = req.user as JWTPayload;

      if (isNaN(requestId) || requestId <= 0) {
        res.json(errorMessage("Valid request ID is required"));
        return;
      }

      const meetingRequest = await MeetingService.getMeetingRequestById(
        requestId
      );

      if (!meetingRequest) {
        res.json(errorMessage("Meeting request not found"));
        return;
      }

      // Check if user has permission to view this request
      if (
        meetingRequest.author_id !== user.id &&
        meetingRequest.requester_id !== user.id
      ) {
        res.json(
          errorMessage("You don't have permission to view this meeting request")
        );
        return;
      }

      res.json(successMessage(meetingRequest));
    } catch (error) {
      console.error("Error getting meeting request:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error retrieving meeting request";
      res.json(errorMessage(message));
    }
  }

  /**
   * Mark meeting as completed
   */
  static async completeMeeting(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as JWTPayload;
      const requestId = parseInt(req.params.requestId);

      if (isNaN(requestId) || requestId <= 0) {
        res.json(errorMessage("Valid request ID is required"));
        return;
      }

      const result = await MeetingService.completeMeeting(requestId, user.id);
      res.json(successMessage(result));
    } catch (error) {
      console.error("Error completing meeting:", error);
      const message =
        error instanceof Error ? error.message : "Error completing meeting";
      res.json(errorMessage(message));
    }
  }
}
