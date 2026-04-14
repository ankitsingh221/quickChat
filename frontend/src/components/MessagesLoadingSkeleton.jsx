function MessagesLoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"} animate-pulse`}
        >
          <div 
            className={`w-32 h-10 rounded-xl ${
              index % 2 === 0 
                ? "bg-white/10 rounded-bl-none" 
                : "bg-white/10 rounded-br-none"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

export default MessagesLoadingSkeleton;