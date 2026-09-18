import React from 'react';

const AVATAR_COLORS = [
  '#1a73e8', // Google Blue
  '#d93025', // Red
  '#1e8e3e', // Green
  '#f9ab00', // Amber
  '#9333ea', // Purple
  '#db2777', // Pink
  '#0284c7'  // Sky Blue
];

function getAvatarColor(name = 'User') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function getInitials(name = 'User') {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

export const UserAvatar = ({ name = 'User', avatar, size = 34, fontSize }) => {
  // If user provided a real uploaded avatar image data URI or URL that isn't unsplash, render img
  if (avatar && !avatar.includes('unsplash.com')) {
    return (
      <img 
        src={avatar} 
        alt={name} 
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '1.5px solid var(--border-color)'
        }}
      />
    );
  }

  const bgColor = getAvatarColor(name);
  const initials = getInitials(name);
  const calculatedFontSize = fontSize || `${Math.max(11, Math.round(size * 0.4))}px`;

  return (
    <div 
      title={name}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: calculatedFontSize,
        flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        textTransform: 'uppercase',
        userSelect: 'none'
      }}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
