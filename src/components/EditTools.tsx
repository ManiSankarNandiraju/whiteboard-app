import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMousePointer,
  faPencilAlt,
  faEraser,
  faShapes,
  faFont,
  faSlash,
  faArrowRight,
  faCircle,
  faSquare,
  faTriangleCircleSquare,
} from '@fortawesome/free-solid-svg-icons';
import './Canvas.css';

const EditTools: React.FC<{
  selectedTool: string; // Currently selected tool
  onToolChange: (tool: string) => void; // Function to change the selected tool
  pencilSize: number; // Size of the pencil
  setPencilSize: (size: number) => void; // Function to change the pencil size
  eraserSize: number; // Size of the eraser
  setEraserSize: (size: number) => void; // Function to change the eraser size
  color: string; // Current color
  setColor: (color: string) => void; // Function to change the color
  addShape: (shape: string) => void; // Function to add a shape to the canvas
  addLine: (arrow: boolean) => void; // Function to add a line to the canvas
  addText: () => void; // Function to add text to the canvas
}> = ({
  selectedTool,
  onToolChange,
  pencilSize,
  setPencilSize,
  eraserSize,
  setEraserSize,
  color,
  setColor,
  addShape,
  addLine,
  addText,
}) => {
  const handleToolChange = (tool: string) => {
    onToolChange(tool);
  };

  // Handle size change for pencil and eraser
  const handleSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setSize: (size: number) => void
  ) => {
    const value = e.target.value.replace(/^0+/, ''); // Remove leading zeros
    const numberValue = Number(value);
    if (numberValue >= 1 && numberValue <= 20) {
      setSize(numberValue);
    }
  };

  // Handle blur event for size input
  const handleSizeBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    setSize: (size: number) => void
  ) => {
    const value = Number(e.target.value);
    if (value < 1) {
      setSize(1);
    } else if (value > 20) {
      setSize(20);
    }
  };

  // Determine if tool options should be visible
  const isToolOptionsVisible = ['pencil', 'eraser', 'shapes', 'line'].includes(selectedTool);

  return (
    <div className="edit-tools-container">
      <div className="toolbox">
        <button
          className={`${selectedTool === 'cursor' ? 'active' : ''} glowing-icon`}
          onClick={() => handleToolChange('cursor')}
          title="Selection Tool"
        >
          <FontAwesomeIcon icon={faMousePointer} />
        </button>

        <button
          className={`${selectedTool === 'pencil' ? 'active' : ''} glowing-icon`}
          onClick={() => handleToolChange('pencil')}
          title="Pencil"
        >
          <FontAwesomeIcon icon={faPencilAlt} />
        </button>

        <button
          className={`${selectedTool === 'eraser' ? 'active' : ''} glowing-icon`}
          onClick={() => handleToolChange('eraser')}
          title="Eraser"
        >
          <FontAwesomeIcon icon={faEraser} />
        </button>

        <button
          className={`${selectedTool === 'shapes' ? 'active' : ''} glowing-icon`}
          onClick={() => handleToolChange('shapes')}
          title="Shapes"
        >
          <FontAwesomeIcon icon={faShapes} />
        </button>

        <button
          className={`${selectedTool === 'line' ? 'active' : ''} glowing-icon`}
          onClick={() => handleToolChange('line')}
          title="Lines"
        >
          <FontAwesomeIcon icon={faSlash} />
        </button>

        <button className="glowing-icon" onClick={() => addText()} title="Text">
          <FontAwesomeIcon icon={faFont} />
        </button>
        <div className="color-picker">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
      </div>

      {isToolOptionsVisible && (
        <div className="tool-items visible">
          {selectedTool === 'pencil' && (
            <div className="tool-options pencil-options">
              <label>Size</label>
              <input
                type="number"
                min="1"
                max="20"
                value={pencilSize}
                onChange={(e) => handleSizeChange(e, setPencilSize)}
                onBlur={(e) => handleSizeBlur(e, setPencilSize)}
              />
            </div>
          )}
          {selectedTool === 'eraser' && (
            <div className="tool-options eraser-options">
              <label>Size</label>
              <input
                type="number"
                min="1"
                max="20"
                value={eraserSize}
                onChange={(e) => handleSizeChange(e, setEraserSize)}
                onBlur={(e) => handleSizeBlur(e, setEraserSize)}
              />
            </div>
          )}
          {selectedTool === 'shapes' && (
            <div className="tool-options shape-options">
              <button
                onClick={() => addShape('circle')}
                className="glowing-icon"
                title="Circles"
              >
                <FontAwesomeIcon icon={faCircle} />
              </button>
              <button
                onClick={() => addShape('rectangle')}
                className="glowing-icon"
                title="Rectangle"
              >
                <FontAwesomeIcon icon={faSquare} />
              </button>
              <button
                onClick={() => addShape('triangle')}
                className="glowing-icon"
                title="Triangle"
              >
                <FontAwesomeIcon icon={faTriangleCircleSquare} />
              </button>
            </div>
          )}
          {selectedTool === 'line' && (
            <div className="tool-options line-options">
              <button onClick={() => addLine(false)} className="glowing-icon">
                <FontAwesomeIcon icon={faSlash} />
              </button>
              <button onClick={() => addLine(true)} className="glowing-icon">
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditTools;
