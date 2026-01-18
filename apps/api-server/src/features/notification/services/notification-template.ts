import { Injectable } from '@nestjs/common';
import { TNotificationPayload, TNotificationPayloadMap, TNotificationType } from '@peernest/core';

type TNotificationResult = {
  title: string;
  body: string;
};

type TNotificationHandlerMap = {
  [K in TNotificationType]: (payload: TNotificationPayloadMap[K]) => TNotificationResult;
};

@Injectable()
export class NotificationTemplate {
  private readonly handlers: TNotificationHandlerMap = {
    // --- DISCUSSION ---
    commentReply: (payload) => ({
      title: 'New reply to your comment',
      body: `A user (ID: ${payload.replierId}) replied to your comment.`,
    }),

    // --- FRIENDSHIP ---
    friendRequestReceived: () => ({
      title: 'New friend request',
      body: 'You received a friend request.',
    }),

    friendRequestAccepted: () => ({
      title: 'Friend request accepted',
      body: 'Your friend request was accepted.',
    }),

    friendRequestRejected: () => ({
      title: 'Friend request declined',
      body: 'A friend request was declined.',
    }),

    // --- COUNSELOR ---
    percherAdded: (payload) => ({
      title: 'New percher assigned',
      body: `User ${payload.percherUserId} has been assigned to your care.`,
    }),

    percherReleased: (payload) => ({
      title: 'Percher released',
      body: `User ${payload.percherUserId} has been released.`,
    }),

    // --- ACHIEVEMENT ---
    achievementUnlocked: (payload) => ({
      title: 'Achievement unlocked 🎉',
      body: `Congratulations! You earned "${payload.achievementTitle}".`,
    }),

    // --- MODERATION ---
    banRequestCreated: (payload) => ({
      title: 'Ban request submitted',
      body: `A new ban request for user ${payload.bannedUserId} is awaiting review.`,
    }),

    banRequestApproved: (payload) => ({
      title: 'Ban request approved',
      body: `The ban request for user ${payload.bannedUserId} has been approved.`,
    }),

    banRequestRejected: (payload) => ({
      title: 'Ban request rejected',
      body: `The ban request for user ${payload.bannedUserId} was rejected.`,
    }),

    userBanned: (payload) => ({
      title: 'User Banned',
      body: `Admin ${payload.bannedBy} has banned user ${payload.bannedUserId}.`,
    }),

    userUnbanned: (payload) => ({
      title: 'User Unbanned',
      body: `Admin ${payload.unbannedBy} has reinstated user ${payload.unbannedUserId}.`,
    }),

    // --- ROLE ---
    roleChanged: () => ({
      title: 'Role updated',
      body: 'Your role has been changed.',
    }),

    roleApplicationRejected: () => ({
      title: 'Role application update',
      body: 'Your application for a new role was not accepted at this time.',
    }),
  };

  build<T extends TNotificationType>(
    type: T,
    payload: TNotificationPayload<T>
  ): TNotificationResult {
    return this.handlers[type](payload);
  }
}
