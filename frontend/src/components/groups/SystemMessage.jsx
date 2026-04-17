import React from 'react';

const SystemMessage = ({ text, createdAt }) => {
  return (
    <div className="flex justify-center my-4 w-full px-6">
      <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 shadow-sm max-w-[80%] md:max-w-md">
        <p className="text-[11px] font-medium text-white/50 text-center leading-relaxed">
          {text}
        </p>
        
        {/* Only show time if createdAt is provided */}
        {createdAt && (
          <p className="text-[9px] text-white/30 text-center mt-0.5 opacity-70">
            {new Date(createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
    </div>
  );
};

export default SystemMessage;