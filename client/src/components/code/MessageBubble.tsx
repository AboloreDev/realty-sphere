"use client";

import React from "react";
import { Message } from "@/types/prismaTypes";
import { CheckCircle2, Clock } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

const MessageBubble = ({
  message,
  isCurrentUser,
  showAvatar = true,
  showTimestamp = true,
}: MessageBubbleProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={`flex gap-3 mb-4 ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
              isCurrentUser
                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                : "bg-gradient-to-br from-gray-400 to-gray-500"
            }`}
          >
            {message.sender.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Message Content */}
      <div
        className={`flex flex-col max-w-[70%] ${
          isCurrentUser ? "items-end" : "items-start"
        }`}
      >
        {/* Sender name (only show for received messages or in group context) */}
        {!isCurrentUser && showAvatar && (
          <div className="text-xs text-gray-500 mb-1 px-3">
            {message.sender.name}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`relative px-4 py-2 rounded-2xl shadow-sm ${
            isCurrentUser
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-md"
          }`}
        >
          {/* Message text */}
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>

          {/* Message tail/arrow */}
          <div
            className={`absolute top-2 w-3 h-3 transform rotate-45 ${
              isCurrentUser
                ? "bg-blue-500 -right-1.5"
                : "bg-white dark:bg-gray-700 border-r border-b border-gray-200 dark:border-gray-600 -left-1.5"
            }`}
          />
        </div>

        {/* Timestamp and status */}
        {showTimestamp && (
          <div
            className={`flex items-center gap-1 mt-1 px-3 ${
              isCurrentUser ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <span className="text-xs text-gray-500">
              {formatTime(message.createdAt)}
            </span>
            {isCurrentUser && (
              <div className="flex items-center">
                {message.isRead ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                ) : (
                  <Clock className="w-3 h-3 text-gray-400" />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
