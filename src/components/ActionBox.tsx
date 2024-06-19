import React from 'react'; // Import React library
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon component
import { faUndo, faRedo, faTimes } from '@fortawesome/free-solid-svg-icons'; // Import specific icons from FontAwesome

// Define the ActionBox functional component
const ActionBox: React.FC<{
  clearAllAction: () => void, // Prop for the clear all action function
  undoAction: () => void, // Prop for the undo action function
  redoAction: () => void, // Prop for the redo action function
}> = ({ clearAllAction, undoAction, redoAction }) => { // Destructure props
  return (
    <div className="action-box"> {/* Container for the action buttons */}
      <button onClick={undoAction} className="glowing-icon" title="Undo"> {/* Undo button with click handler */}
        <FontAwesomeIcon icon={faUndo} /> {/* Undo icon */}
      </button>
      <button onClick={redoAction} className="glowing-icon" title="Redo"> {/* Redo button with click handler */}
        <FontAwesomeIcon icon={faRedo} /> {/* Redo icon */}
      </button>
      <button onClick={clearAllAction} className="glowing-icon" title="Clear Canvas"> {/* Clear all button with click handler */}
        <FontAwesomeIcon icon={faTimes} /> {/* Clear all icon */}
      </button>
    </div>
  );
};

export default ActionBox; // Export the ActionBox component as the default export
