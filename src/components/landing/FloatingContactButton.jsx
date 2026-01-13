import React from 'react';
import { EmailIcon } from './icons';

function FloatingContactButton({ onClick }) {
  return (
    <button
      className="btn-contacto-flotante"
      onClick={onClick}
      title="Contactanos"
    >
      <EmailIcon size={24} color="currentColor" />
    </button>
  );
}

export default FloatingContactButton;
