import { PoolConnection } from "mysql2/promise";
import pool from "../db";
import { MeetingRequest } from "../types";

export class MeetingRepository {
  /**
   * Create a new meeting request
   */
  static async createMeetingRequest(
    requesterId: number,
    authorId: number,
    postId: number,
    postTitle: string,
    message: string
  ): Promise<{ requestId: number }> {
    const connection: PoolConnection = await pool.getConnection();

    try {
      const query = `
        INSERT INTO meeting_requests (requester_id, author_id, post_id, post_title, message, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', NOW())
      `;

      const [result] = await connection.execute(query, [
        requesterId,
        authorId,
        postId,
        postTitle,
        message,
      ]);

      const insertResult = result as any;
      return { requestId: insertResult.insertId };
    } finally {
      connection.release();
    }
  }

  /**
   * Get meeting requests for a user (as author)
   */
  static async getMeetingRequestsForAuthor(
    authorId: number
  ): Promise<MeetingRequest[]> {
    const connection: PoolConnection = await pool.getConnection();

    try {
      const query = `
        SELECT 
          mr.*,
          u.fullname as requester_name,
          u.email as requester_email
        FROM meeting_requests mr
        JOIN users u ON mr.requester_id = u.id
        WHERE mr.author_id = ? AND mr.status IN ('pending', 'approved')
        ORDER BY mr.created_at DESC
      `;

      const [rows] = await connection.execute(query, [authorId]);
      return rows as MeetingRequest[];
    } finally {
      connection.release();
    }
  }

  /**
   * Get meeting requests sent by a user (as requester)
   */
  static async getMeetingRequestsByRequester(
    requesterId: number
  ): Promise<MeetingRequest[]> {
    const connection: PoolConnection = await pool.getConnection();

    try {
      const query = `
        SELECT 
          mr.*,
          u.fullname as author_name,
          u.email as author_email
        FROM meeting_requests mr
        JOIN users u ON mr.author_id = u.id
        WHERE mr.requester_id = ?
        ORDER BY mr.created_at DESC
      `;

      const [rows] = await connection.execute(query, [requesterId]);
      return rows as MeetingRequest[];
    } finally {
      connection.release();
    }
  }

  /**
   * Update meeting request status
   */
  static async updateMeetingRequestStatus(
    requestId: number,
    status: "approved" | "declined" | "completed",
    meetingUrl?: string,
    scheduledTime?: Date
  ): Promise<boolean> {
    const connection: PoolConnection = await pool.getConnection();

    try {
      let query = `
        UPDATE meeting_requests 
        SET status = ?, updated_at = NOW()
      `;
      const params: any[] = [status];

      if (meetingUrl) {
        query += `, meeting_url = ?`;
        params.push(meetingUrl);
      }

      if (scheduledTime) {
        query += `, scheduled_time = ?`;
        params.push(scheduledTime);
      }

      query += ` WHERE id = ?`;
      params.push(requestId);

      const [result] = await connection.execute(query, params);
      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Get meeting request by ID
   */
  static async getMeetingRequestById(
    requestId: number
  ): Promise<MeetingRequest | null> {
    const connection: PoolConnection = await pool.getConnection();

    try {
      const query = `
        SELECT 
          mr.*,
          u1.fullname as requester_name,
          u1.email as requester_email,
          u2.fullname as author_name,
          u2.email as author_email
        FROM meeting_requests mr
        JOIN users u1 ON mr.requester_id = u1.id
        JOIN users u2 ON mr.author_id = u2.id
        WHERE mr.id = ?
      `;

      const [rows] = await connection.execute(query, [requestId]);
      const results = rows as any[];
      return results.length > 0 ? results[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Check if user has already requested meeting for this post
   */
  static async hasExistingRequest(
    requesterId: number,
    authorId: number,
    postId: number
  ): Promise<boolean> {
    const connection: PoolConnection = await pool.getConnection();

    try {
      const query = `
        SELECT COUNT(*) as count
        FROM meeting_requests 
        WHERE requester_id = ? AND author_id = ? AND post_id = ? 
        AND status IN ('pending', 'approved')
      `;

      const [rows] = await connection.execute(query, [
        requesterId,
        authorId,
        postId,
      ]);
      const result = rows as any[];
      return result[0].count > 0;
    } finally {
      connection.release();
    }
  }
}
