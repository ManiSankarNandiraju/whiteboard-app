import React from 'react';
import html2canvas from 'html2canvas'; // Import html2canvas for exporting canvas as an image
import './Canvas.css';

interface HeadingBoxProps {
  title: string; // Title to be displayed in the heading box
}

const HeadingBox: React.FC<HeadingBoxProps> = ({ title }) => {
  // Function to export the canvas as an image
  const exportAsImage = () => {
    const canvasElement = document.getElementById('canvas-element'); // Get the canvas element by its ID
    if (canvasElement) {
      html2canvas(canvasElement)
        .then(canvas => {
          const link = document.createElement('a'); // Create a link element
          link.download = 'canvas-image.png'; // Set the download attribute with a filename
          link.href = canvas.toDataURL(); // Convert the canvas content to a data URL
          link.click(); // Simulate a click to trigger the download
        })
        .catch(err => {
          console.error('Failed to capture the canvas element:', err); // Log any errors that occur
        });
    } else {
      console.error('Canvas element not found'); // Log an error if the canvas element is not found
    }
  };

  return (
    <div className="heading-box">
      <div className="heading">
        <h2>{title}</h2> {/* Display the title */}
      </div>
      <button className="export-button glowing-icon" onClick={exportAsImage} title="Export as Image">
        <img src="/export.png" alt="Export as Image" className="export-icon" /> {/* Export button with an icon */}
      </button>
    </div>
  );
};

export default HeadingBox;
