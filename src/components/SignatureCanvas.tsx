import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';

interface SignatureCanvasProps {
  onSave: (imageData: string) => void;
  onCancel: () => void;
  width?: number;
  height?: number;
}

interface PathPoint {
  x: number;
  y: number;
}

export function SignatureCanvas({ onSave, onCancel, width, height }: SignatureCanvasProps) {
  const canvasWidth = width || Dimensions.get('window').width - 40;
  const canvasHeight = height || 200;
  
  const [paths, setPaths] = useState<Array<PathPoint[]>>([]);
  const [currentPath, setCurrentPath] = useState<PathPoint[]>([]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath([{ x: locationX, y: locationY }]);
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath(prev => [...prev, { x: locationX, y: locationY }]);
    },
    onPanResponderRelease: () => {
      if (currentPath.length > 0) {
        setPaths(prev => [...prev, currentPath]);
        setCurrentPath([]);
      }
    },
  });

  const handleClear = () => {
    setPaths([]);
    setCurrentPath([]);
  };

  const pathToSvgString = (points: PathPoint[]): string => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  const handleSave = () => {
    const allPaths = [...paths, ...(currentPath.length > 0 ? [currentPath] : [])];
    
    if (allPaths.length === 0) {
      return;
    }

    // Convert SVG paths to base64 image
    const svgPaths = allPaths.map(points => {
      const pathString = pathToSvgString(points);
      return `<path d="${pathString}" stroke="#000000" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('');

    const svgContent = `
      <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        ${svgPaths}
      </svg>
    `;
    
    // Encode SVG as base64
    try {
      const base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
      onSave(base64);
    } catch (error) {
      console.error('Error encoding signature:', error);
      // Fallback: just save the SVG content as string
      onSave(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Draw your signature</Text>
      
      <View 
        style={[styles.canvasContainer, { width: canvasWidth, height: canvasHeight }]}
        {...panResponder.panHandlers}
      >
        <Svg width={canvasWidth} height={canvasHeight} style={StyleSheet.absoluteFill}>
          {paths.map((pathPoints, index) => (
            <Path
              key={index}
              d={pathToSvgString(pathPoints)}
              stroke="#000000"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPath.length > 0 && (
            <Path
              d={pathToSvgString(currentPath)}
              stroke="#000000"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
      </View>

      <View style={styles.buttons}>
        <Button mode="outlined" onPress={handleClear} style={styles.button}>
          Clear
        </Button>
        <Button mode="outlined" onPress={onCancel} style={styles.button}>
          Cancel
        </Button>
        <Button 
          mode="contained" 
          onPress={handleSave} 
          style={styles.button}
          disabled={paths.length === 0 && currentPath.length === 0}
        >
          Save
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  canvasContainer: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
    position: 'relative',
  },
  canvas: {
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    marginHorizontal: 5,
  },
});

