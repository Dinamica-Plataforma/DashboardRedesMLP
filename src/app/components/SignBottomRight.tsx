// components/PoweredBy.tsx
import React from 'react';
import Image from 'next/image';

interface PoweredByProps {
  logoSrc: string;
  signatureText: string;
}

const PoweredBy: React.FC<PoweredByProps> = ({ logoSrc, signatureText }) => {
  return (
    <a href={"https://www.dinamicaplataforma.com/"} target="_blank" rel="noopener noreferrer">
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      fontStyle: 'italic',
      fontSize: '14px',
      color: '#fff',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      padding: '3px 8px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
    }}>
      {signatureText}
        <Image 
          src={logoSrc} 
          alt="Logo" 
          width={20}
          height={20}
          style={{ marginLeft: '5px' }}
        />
    </div>
    </a>
  );
}

export default PoweredBy;
