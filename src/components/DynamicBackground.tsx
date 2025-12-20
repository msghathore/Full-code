import React from 'react';

export const DynamicBackground = React.memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-black">
      {/* Static gradient overlay - No animations for maximum performance */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 50%)'
        }}
      />

      {/* Static texture layer */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
});