const MessageSkeleton = () => {
  // Create an array of 6 items for skeleton messages
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {skeletonMessages.map((_, idx) => (
        <div
          key={idx}
          className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}
        >
          <div className="chat-image avatar">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
          </div>

          <div className="chat-header mb-1">
            <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 animate-pulse rounded" />
          </div>

          <div className="chat-bubble bg-transparent p-0">
            <div className="h-16 w-[200px] bg-gray-300 dark:bg-gray-700 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
