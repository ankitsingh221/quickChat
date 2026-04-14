function MessagesLoadingSkeleton() {
  return (
    <div className="flex flex-col space-y-4">
      {[...Array(6)].map((_, index) => {
        // Alternate between sent (right) and received (left) messages
        const isSent = index % 2 === 0;
        
        return (
          <div
            key={index}
            className={`flex ${isSent ? "justify-end" : "justify-start"} animate-pulse`}
          >
            <div 
              className={`w-48 h-10 rounded-xl ${
                isSent 
                  ? "bg-white/10 rounded-br-none" 
                  : "bg-white/10 rounded-bl-none"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

export default MessagesLoadingSkeleton;