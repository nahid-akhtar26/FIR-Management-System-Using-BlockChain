import React from 'react';
import { FiHelpCircle } from 'react-icons/fi';
import './Tooltip.css';

const Tooltip = ({ text, children }) => {
  return (
    <div className="tooltip-wrapper">
      {children}
      <div className="tooltip">
        <FiHelpCircle />
        <span className="tooltip-text">{text}</span>
      </div>
    </div>
  );
};

export default Tooltip;

