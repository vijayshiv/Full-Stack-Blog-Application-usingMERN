import { MeetingRepository } from "../repositories";
import { MeetingRequest, MeetingRequestInput } from "../types";

export class MeetingService {
  /**
   * Create a new meeting request
   */
  static async createMeetingRequest(
    requesterId: number,
    data: MeetingRequestInput
  ): Promise<{ requestId: number; message: string }> {
    // Check if requester is trying to request meeting with themselves
    if (requesterId === data.authorId) {
      throw new Error("You cannot request a meeting with yourself");
    }

    // Check if there's already a pending/approved request for this post
    const hasExisting = await MeetingRepository.hasExistingRequest(
      requesterId,
      data.authorId,
      data.postId
    );

    if (hasExisting) {
      throw new Error(
        "You already have a pending or approved meeting request for this post"
      );
    }

    const result = await MeetingRepository.createMeetingRequest(
      requesterId,
      data.authorId,
      data.postId,
      data.postTitle,
      data.message
    );

    return {
      requestId: result.requestId,
      message: "Meeting request sent successfully",
    };
  }

  /**
   * Get meeting requests for author (received requests)
   */
  static async getMeetingRequestsForAuthor(
    authorId: number
  ): Promise<MeetingRequest[]> {
    return await MeetingRepository.getMeetingRequestsForAuthor(authorId);
  }

  /**
   * Get meeting requests by requester (sent requests)
   */
  static async getMeetingRequestsByRequester(
    requesterId: number
  ): Promise<MeetingRequest[]> {
    return await MeetingRepository.getMeetingRequestsByRequester(requesterId);
  }

  /**
   * Respond to a meeting request (approve/decline)
   */
  static async respondToMeetingRequest(
    requestId: number,
    authorId: number,
    action: "approve" | "decline",
    scheduledTime?: Date
  ): Promise<{ message: string; meetingUrl?: string }> {
    // Get the meeting request to verify ownership
    const meetingRequest = await MeetingRepository.getMeetingRequestById(
      requestId
    );

    if (!meetingRequest) {
      throw new Error("Meeting request not found");
    }

    if (meetingRequest.author_id !== authorId) {
      throw new Error("You can only respond to your own meeting requests");
    }

    if (meetingRequest.status !== "pending") {
      throw new Error("This meeting request has already been responded to");
    }

    let meetingUrl: string | undefined;

    if (action === "approve") {
      // Generate a unique meeting room URL
      meetingUrl = `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/meeting/${requestId}`;
    }

    const success = await MeetingRepository.updateMeetingRequestStatus(
      requestId,
      action === "approve" ? "approved" : "declined",
      meetingUrl,
      scheduledTime
    );

    if (!success) {
      throw new Error("Failed to update meeting request");
    }

    const message =
      action === "approve"
        ? "Meeting request approved! Meeting link has been generated."
        : "Meeting request declined.";

    return { message, meetingUrl };
  }

  /**
   * Get meeting request by ID
   */
  static async getMeetingRequestById(
    requestId: number
  ): Promise<MeetingRequest | null> {
    return await MeetingRepository.getMeetingRequestById(requestId);
  }

  /**
   * Mark meeting as completed
   */
  static async completeMeeting(
    requestId: number,
    userId: number
  ): Promise<{ message: string }> {
    const meetingRequest = await MeetingRepository.getMeetingRequestById(
      requestId
    );

    if (!meetingRequest) {
      throw new Error("Meeting request not found");
    }

    // Only author or requester can mark as completed
    if (
      meetingRequest.author_id !== userId &&
      meetingRequest.requester_id !== userId
    ) {
      throw new Error("You don't have permission to complete this meeting");
    }

    if (meetingRequest.status !== "approved") {
      throw new Error("Meeting must be approved before it can be completed");
    }

    const success = await MeetingRepository.updateMeetingRequestStatus(
      requestId,
      "completed"
    );

    if (!success) {
      throw new Error("Failed to mark meeting as completed");
    }

    return { message: "Meeting marked as completed" };
  }
}
