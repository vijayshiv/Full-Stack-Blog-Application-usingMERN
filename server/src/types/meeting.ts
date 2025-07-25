export interface MeetingRequest {
  id?: number;
  requester_id: number;
  author_id: number;
  post_id: number;
  post_title: string;
  message: string;
  status: "pending" | "approved" | "declined" | "completed";
  created_at?: Date;
  updated_at?: Date;
  meeting_url?: string;
  scheduled_time?: Date;
}

export interface MeetingRequestInput {
  authorId: number;
  postId: number;
  postTitle: string;
  message: string;
  requesterName: string;
}

export interface MeetingResponse {
  requestId: number;
  action: "approve" | "decline";
  scheduledTime?: string;
}
