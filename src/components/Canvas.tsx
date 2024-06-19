import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import EditTools from './EditTools';
import './Canvas.css';
import ActionBox from './ActionBox';
import User from './User';
import HeadingBox from './HeadingBox';
import LiveChat from './LiveChat';

// Extend the fabric object type to include a custom id property
interface CustomFabricObject extends fabric.Object {
  id?: string;
}

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [drawings, setDrawings] = useState<any[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState('cursor');
  const [pencilSize, setPencilSize] = useState(2);
  const [eraserSize, setEraserSize] = useState(10);
  const [color, setColor] = useState('#000000');
  const [userCount, setUserCount] = useState(0);
  const userImageSrc = '/image.png';
  const userName = 'Admin (you)';
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  // Save state of canvas actions for undo/redo functionality
  const saveState = (actionType: string, object: CustomFabricObject, modifiedState?: any) => {
    const state = {
      actionType,
      objectId: object.id,
      objectState: object.toObject(),
      modifiedState,
    };
    setHistory((prevHistory) => [...prevHistory, state]);
    setRedoStack([]);
  };

  // Find an object on the canvas by its ID
  const findObjectById = (id: string) => {
    if (!fabricRef.current) return null;
    const objects = fabricRef.current.getObjects();
    return objects.find((obj) => (obj as CustomFabricObject).id === id) || null;
  };

  // Create a fabric object from its data
  const createFabricObject = (objectData: any) => {
    let fabricObject: fabric.Object | null = null;
    switch (objectData.type) {
      case 'circle':
        fabricObject = new fabric.Circle(objectData);
        break;
      case 'rect':
        fabricObject = new fabric.Rect(objectData);
        break;
      case 'triangle':
        fabricObject = new fabric.Triangle(objectData);
        break;
      case 'path':
        fabricObject = new fabric.Path(objectData.path, objectData);
        break;
      case 'i-text':
        fabricObject = new fabric.IText(objectData.text, objectData);
        break;
      // Add more cases here for other object types as needed
      default:
        break;
    }
    return fabricObject;
  };

  // Redraw canvas based on the current drawings state
  const redrawCanvas = () => {
    if (fabricRef.current) {
      fabricRef.current.clear();
      drawings.forEach((line) => {
        const path = new fabric.Path(`M ${line.x0} ${line.y0} L ${line.x1} ${line.y1}`, {
          stroke: line.color,
          strokeWidth: line.size,
          selectable: false,
          evented: false,
        });
        fabricRef.current?.add(path);
      });
    }
  };

  // Initialize the fabric canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fabricCanvas = new fabric.Canvas(canvas, {
      isDrawingMode: selectedTool === 'pencil',
      selection: true,
      width: window.innerWidth,
      height: window.innerHeight,
    });
    fabricRef.current = fabricCanvas;

    const handleResize = () => {
      const canvasContainer = document.querySelector('.canvas-container');
      if (canvasContainer) {
        fabricCanvas.setWidth(canvasContainer.clientWidth);
        fabricCanvas.setHeight(canvasContainer.clientHeight);
        redrawCanvas();
      }
    };

    window.addEventListener('resize', handleResize);

    // Add event listeners for canvas actions
    fabricCanvas.on('object:added', (e) => {
      if (!e.target) return;
      const target = e.target as CustomFabricObject;
      target.id = `obj_${new Date().getTime()}`;
      saveState('add', target);
    });

    fabricCanvas.on('object:removed', (e) => {
      if (!e.target) return;
      saveState('remove', e.target as CustomFabricObject);
    });

    fabricCanvas.on('object:modified', (e) => {
      if (!e.target) return;
      saveState('modify', e.target as CustomFabricObject, e.target.toObject());
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvas.dispose();
    };
  }, [drawings]);

  // Update fabric canvas settings when the selected tool changes
  useEffect(() => {
    if (fabricRef.current) {
      if (selectedTool === 'pencil') {
        fabricRef.current.isDrawingMode = true;
        fabricRef.current.freeDrawingBrush = new fabric.PencilBrush(fabricRef.current);
        fabricRef.current.freeDrawingBrush.width = pencilSize;
        fabricRef.current.freeDrawingBrush.color = color;
        document.body.style.cursor = `url(data:image/svg+xml;base64,${btoa(`
          <svg height="${pencilSize * 2}" width="${pencilSize * 2}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${pencilSize}" cy="${pencilSize}" r="${pencilSize}" fill="${color}" />
          </svg>
        `)}), auto`;
      } else if (selectedTool === 'eraser') {
        fabricRef.current.isDrawingMode = true;
        const eraserBrush = new fabric.PencilBrush(fabricRef.current) as fabric.BaseBrush & { globalCompositeOperation?: string };
        eraserBrush.width = eraserSize;
        eraserBrush.color = 'rgba(255,255,255,1)';
        eraserBrush.globalCompositeOperation = 'destination-out';
        fabricRef.current.freeDrawingBrush = eraserBrush;
        document.body.style.cursor = `url(data:image/svg+xml;base64,${btoa(`
          <svg height="${eraserSize * 2}" width="${eraserSize * 2}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${eraserSize}" cy="${eraserSize}" r="${eraserSize}" fill="rgba(255,255,255,1)" stroke="black" stroke-width="1" />
          </svg>
        `)}), auto`;
      } else {
        fabricRef.current.isDrawingMode = false;
        document.body.style.cursor = 'default';
      }
    }
  }, [selectedTool, pencilSize, eraserSize, color]);

  // Redraw canvas whenever the drawings state changes
  useEffect(() => {
    redrawCanvas();
  }, [drawings]);

  // Add event listener for key down events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (fabricRef.current) {
        const activeObject = fabricRef.current.getActiveObject();
        if ((event.key === 'Delete' || event.key === 'Backspace') &&
            (!activeObject || activeObject.type !== 'i-text')) {
          fabricRef.current.getActiveObjects().forEach((obj) => {
            fabricRef.current?.remove(obj);
          });
          fabricRef.current.discardActiveObject().renderAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Add shape to the canvas
  const addShape = (shape: string) => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    let shapeObj: fabric.Object | null = null;

    const center = canvas.getCenter();

    switch (shape) {
      case 'circle':
        shapeObj = new fabric.Circle({
          radius: 50,
          fill: color,
          left: center.left,
          top: center.top,
        });
        break;
      case 'rectangle':
        shapeObj = new fabric.Rect({
          width: 100,
          height: 100,
          fill: color,
          left: center.left,
          top: center.top,
        });
        break;
      case 'triangle':
        shapeObj = new fabric.Triangle({
          width: 100,
          height: 100,
          fill: color,
          left: center.left,
          top: center.top,
        });
        break;
      default:
        break;
    }

    if (shapeObj) {
      canvas.add(shapeObj);
      canvas.setActiveObject(shapeObj);
      setSelectedTool('cursor');
      const message = JSON.stringify({ action: 'addShape', shape: shapeObj });
      ws?.send(message);
    }
  };

  // Add line to the canvas
  const addLine = (arrow: boolean) => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const center = canvas.getCenter();

    const linePath = arrow
      ? `M 0 0 L 100 0 M 80 -10 L 100 0 L 80 10`
      : `M 0 0 L 100 0`;

    const path = new fabric.Path(linePath, {
      fill: color,
      stroke: color,
      strokeWidth: pencilSize,
      selectable: true,
      evented: true,
      left: center.left,
      top: center.top,
    });

    canvas.add(path);
    canvas.setActiveObject(path);
    setSelectedTool('cursor');
    const message = JSON.stringify({ action: 'addLine', path });
    ws?.send(message);
  };

  // Add text to the canvas
  const addText = () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const center = canvas.getCenter();
    const text = new fabric.IText('Edit me', {
      left: center.left,
      top: center.top,
      fill: color,
      fontSize: 20,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    setSelectedTool('cursor');
    const message = JSON.stringify({ action: 'addText', text });
    ws?.send(message);
  };

  // Handle mouse down event for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const nativeEvent = e.nativeEvent;
    if (selectedTool === 'cursor') {
      setIsPanning(true);
      setPanStart({ x: nativeEvent.clientX, y: nativeEvent.clientY });
    }
  };

  // Handle mouse move event for panning
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const nativeEvent = e.nativeEvent;
    if (isPanning && fabricRef.current) {
      const deltaX = nativeEvent.clientX - panStart.x;
      const deltaY = nativeEvent.clientY - panStart.y;
      setOffset({ x: offset.x + deltaX, y: offset.y + deltaY });
      fabricRef.current.relativePan(new fabric.Point(deltaX, deltaY));
      setPanStart({ x: nativeEvent.clientX, y: nativeEvent.clientY });
    }
  };

  // Handle mouse up event to stop panning
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Toggle the visibility of the live chat
  const toggleLiveChat = () => {
    setShowLiveChat(!showLiveChat);
  };

  // Change the color of the selected tool or active object
  const handleChangeColor = (newColor: string) => {
    setColor(newColor);
    if (fabricRef.current) {
      const activeObject = fabricRef.current.getActiveObject();
      if (activeObject) {
        activeObject.set('fill', newColor);
        fabricRef.current.renderAll();
      }
    }
  };

  // Undo the last action
  const undo = () => {
    if (!fabricRef.current || history.length === 0) return;
    const lastAction = history.pop();
    if (lastAction) {
      setRedoStack([...redoStack, lastAction]);
      switch (lastAction.actionType) {
        case 'add':
          const objToRemove = findObjectById(lastAction.objectId);
          if (objToRemove) fabricRef.current.remove(objToRemove);
          break;
        case 'remove':
          const objToAdd = createFabricObject(lastAction.objectState);
          if (objToAdd) fabricRef.current.add(objToAdd);
          break;
        case 'modify':
          const objToModify = findObjectById(lastAction.objectId);
          if (objToModify) {
            objToModify.set(lastAction.modifiedState);
            fabricRef.current.renderAll();
          }
          break;
        default:
          break;
      }
    }
  };

  // Redo the last undone action
  const redo = () => {
    if (!fabricRef.current || redoStack.length === 0) return;
    const lastUndoAction = redoStack.pop();
    if (lastUndoAction) {
      setHistory([...history, lastUndoAction]);
      switch (lastUndoAction.actionType) {
        case 'add':
          const objToAdd = createFabricObject(lastUndoAction.objectState);
          if (objToAdd) fabricRef.current.add(objToAdd);
          break;
        case 'remove':
          const objToRemove = findObjectById(lastUndoAction.objectId);
          if (objToRemove) fabricRef.current.remove(objToRemove);
          break;
        case 'modify':
          const objToModify = findObjectById(lastUndoAction.objectId);
          if (objToModify) {
            objToModify.set(lastUndoAction.objectState);
            fabricRef.current.renderAll();
          }
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="canvas-container">
      <HeadingBox title="White Board" />
      <EditTools
        selectedTool={selectedTool}
        onToolChange={setSelectedTool}
        pencilSize={pencilSize}
        setPencilSize={setPencilSize}
        eraserSize={eraserSize}
        setEraserSize={setEraserSize}
        color={color}
        setColor={handleChangeColor}
        addShape={addShape}
        addLine={addLine}
        addText={addText}
      />
      <ActionBox
        clearAllAction={() => fabricRef.current?.clear()}
        undoAction={undo}
        redoAction={redo}
      />
      <User
        userImageSrc={userImageSrc}
        userName={userName}
        userCount={userCount}
      />
      <canvas
        ref={canvasRef}
        id="canvas-element" // Ensure the ID is correctly set
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseUp}
      />
      <button className="chat-button" onClick={toggleLiveChat}>
        <i className="fas fa-comment-dots"></i>
      </button>
      {showLiveChat && <LiveChat />}
    </div>
  );
};

export default Canvas;
