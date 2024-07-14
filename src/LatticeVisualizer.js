import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as d3 from 'd3';
import numeric from 'numeric';

const MAX_POINTS = 50000000;

const LatticeVisualizer = () => {
  const [dimension, setDimension] = useState(2);
  const [basis, setBasis] = useState(() => {
    const initialBasis = [
      [1, 0],
      [0, 1]
    ];
    console.log('Initial basis:', initialBasis);
    return initialBasis;
  });
  const [sumLimit, setSumLimit] = useState(5);
  const [dualBasis, setDualBasis] = useState(null);
  const [shadeParallelepiped, setShadeParallelepiped] = useState(false);
  const [parallelepipedMesh, setParallelepipedMesh] = useState(null);
  const [axesVisible, setAxesVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pointCount, setPointCount] = useState(0);
  const [totalPointsGenerated, setTotalPointsGenerated] = useState(0);
  const canvasContainerRef = useRef(null);
  const rendererRef = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(new THREE.PerspectiveCamera(75, 1920 / 1080, 0.1, 1000));
  const controlsRef = useRef(null);
  const axesHelperRef = useRef(null);
  const gridHelperRef = useRef(null);

  useEffect(() => {
    const renderer = rendererRef.current;
    renderer.setSize(1920, 1080);

    const camera = cameraRef.current;
    camera.position.z = 10;

    const canvas = renderer.domElement;
    if (canvasContainerRef.current && !canvasContainerRef.current.contains(canvas)) {
      canvasContainerRef.current.appendChild(canvas);
    }

    const scene = sceneRef.current;
    if (!axesHelperRef.current) {
      const axesHelper = new THREE.AxesHelper(5);
      const gridHelper = new THREE.GridHelper(100, 100);
      scene.add(axesHelper);
      scene.add(gridHelper);
      axesHelperRef.current = axesHelper;
      gridHelperRef.current = gridHelper;
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
  }, []);

  useEffect(() => {
    if (dimension > 3) {
      console.warn("Visualization only supports up to 3 dimensions.");
      render3DLattice(true); // For higher dimensions, project to 3D
    } else if (dimension === 2) {
      render2DLattice();
    } else if (dimension === 3) {
      render3DLattice(false);
    }
    updateAxesVisibility();
  }, [dimension, basis, sumLimit, shadeParallelepiped, dualBasis, axesVisible, isFullscreen]);

  const updateAxesVisibility = () => {
    if (axesHelperRef.current && gridHelperRef.current) {
      axesHelperRef.current.visible = axesVisible;
      gridHelperRef.current.visible = axesVisible;
    }
  };

  const generateLatticePoints = (basisMatrix) => {
    const points = [];
    const range = Array.from({ length: 2 * sumLimit + 1 }, (_, i) => i - sumLimit);
    const coefficients = [];

    const stack = [[]];
    while (stack.length > 0) {
      const current = stack.pop();
      if (current.length === dimension) {
        coefficients.push(current);
      } else {
        for (let value of range) {
          stack.push([...current, value]);
        }
      }
    }

    console.log('Coefficients:', coefficients);
    console.log('Basis Matrix:', basisMatrix);

    let pointLimitExceeded = false;
    setTotalPointsGenerated(coefficients.length);
    if (coefficients.length > MAX_POINTS) {
      pointLimitExceeded = true;
      coefficients.length = MAX_POINTS;
    }

    for (const coeff of coefficients) {
      const point = new Array(dimension).fill(0);
      for (let i = 0; i < dimension; i++) {
        for (let j = 0; j < dimension; j++) {
          point[j] += coeff[i] * basisMatrix[i][j];
        }
      }
      points.push(point);
    }

    setPointCount(points.length);
    return points;
  };

  const calculateDualBasis = (basisMatrix) => {
    const basisMatrixT = numeric.transpose(basisMatrix);
    const product = numeric.dot(basisMatrixT, basisMatrix);
    const inverse = numeric.inv(product);
    return numeric.dot(basisMatrix, inverse);
  };

  const points = useMemo(() => {
    if (!basis || !basis.length || !basis[0].length) {
      console.error('Invalid basis:', basis);
      return [];
    }
    console.log('Generating points with basis:', basis);
    return generateLatticePoints(basis);
  }, [dimension, basis, sumLimit]);

  const dualPoints = useMemo(() => {
    if (dualBasis) {
      console.log('Generating dual points with basis:', dualBasis);
      return generateLatticePoints(dualBasis);
    }
    return [];
  }, [dimension, dualBasis, sumLimit]);

  const projectTo3D = (points) => points.map(point => [point[0] || 0, point[1] || 0, point[2] || 0]);

  const render2DLattice = () => {
    const svg = d3.select(canvasContainerRef.current).select('svg');
    svg.selectAll("*").remove();
    const width = isFullscreen ? 1920 : 1280;
    const height = isFullscreen ? 1080 : 1024;
    const margin = 20;

    svg.attr("width", width).attr("height", height);

    const xExtent = d3.extent(points.concat(dualPoints), d => d[0]);
    const yExtent = d3.extent(points.concat(dualPoints), d => d[1]);
    const xScale = d3.scaleLinear().domain([xExtent[0], xExtent[1]]).range([margin, width - margin]);
    const yScale = d3.scaleLinear().domain([yExtent[0], yExtent[1]]).range([height - margin, margin]);

    svg.selectAll("circle.original").data(points).enter().append("circle").attr("class", "original").attr("cx", d => xScale(d[0])).attr("cy", d => yScale(d[1])).attr("r", 3).attr("fill", "red");
    svg.selectAll("circle.dual").data(dualPoints).enter().append("circle").attr("class", "dual").attr("cx", d => xScale(d[0])).attr("cy", d => yScale(d[1])).attr("r", 3).attr("fill", "blue");

    svg.append("line").attr("x1", xScale(0)).attr("y1", 0).attr("x2", xScale(0)).attr("y2", height).attr("stroke", "black");
    svg.append("line").attr("x1", 0).attr("y1", yScale(0)).attr("x2", width).attr("y2", yScale(0)).attr("stroke", "black");
  };

  const render3DLattice = (isProjected) => {
    const scene = sceneRef.current;
    scene.clear();

    const camera = cameraRef.current;
    const renderer = rendererRef.current;

    let renderPoints = points;
    let renderDualPoints = dualPoints;
    if (isProjected) {
      renderPoints = projectTo3D(points);
      renderDualPoints = projectTo3D(dualPoints);
    }

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(renderPoints.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const dualGeometry = new THREE.BufferGeometry();
    const dualPositions = new Float32Array(renderDualPoints.flat());
    dualGeometry.setAttribute('position', new THREE.BufferAttribute(dualPositions, 3));

    const material = new THREE.PointsMaterial({ color: 0xff0000, size: 0.1 });
    const dualMaterial = new THREE.PointsMaterial({ color: 0x0000ff, size: 0.1 });

    const pointCloud = new THREE.Points(geometry, material);
    const dualPointCloud = new THREE.Points(dualGeometry, dualMaterial);

    scene.add(pointCloud);
    scene.add(dualPointCloud);

    // Re-add axes and grid helpers
    if (axesHelperRef.current) scene.add(axesHelperRef.current);
    if (gridHelperRef.current) scene.add(gridHelperRef.current);

    updateAxesVisibility();

    const controls = controlsRef.current;
    controls.update();
  };

  const shadeRandomParallelepiped = () => {
    const scene = sceneRef.current;
    if (parallelepipedMesh) {
      scene.remove(parallelepipedMesh);
    }
  
    const parallelepipedVertices = [];
  
    for (let i = 0; i < (1 << dimension); i++) {
      const vertex = new Array(dimension).fill(0);
      for (let j = 0; j < dimension; j++) {
        const a_i = (i & (1 << j)) ? Math.random() : 0; // Random coefficient in [0, 1)
        for (let k = 0; k < dimension; k++) {
          vertex[k] += a_i * basis[j][k];
        }
      }
      parallelepipedVertices.push(...vertex.slice(0, 3)); // Use the first three dimensions
    }
  
    const parallelepipedGeometry = new THREE.BufferGeometry();
    parallelepipedGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(parallelepipedVertices), 3));
    const parallelepipedMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
    const newParallelepipedMesh = new THREE.Mesh(parallelepipedGeometry, parallelepipedMaterial);
    scene.add(newParallelepipedMesh);
    setParallelepipedMesh(newParallelepipedMesh);
  
    updateAxesVisibility();
  };
  

  const handleDimensionChange = (e) => {
    const newDimension = parseInt(e.target.value);
    if (newDimension > 400) {
      alert("Dimension cannot exceed 400");
      return;
    }
    setDimension(newDimension);
    initializeBasis(newDimension);
  };

  const initializeBasis = (dim) => {
    const newBasis = Array.from({ length: dim }, (_, i) => Array.from({ length: dim }, (_, j) => (i === j ? 1 : 0)));
    setBasis(newBasis);
  };

  const handleBasisChange = (i, j, value) => {
    const newBasis = basis.map((row, rowIndex) => row.map((col, colIndex) => (rowIndex === i && colIndex === j ? parseFloat(value) : col)));
    console.log(`Basis change at [${i}, ${j}]:`, newBasis);
    setBasis(newBasis);
  };

  const handleShadeParallelepiped = () => {
    shadeRandomParallelepiped();
    setShadeParallelepiped(true);
  };

  const handleUnshadeParallelepiped = () => {
    const scene = sceneRef.current;
    if (parallelepipedMesh) {
      scene.remove(parallelepipedMesh);
      setParallelepipedMesh(null);
      setShadeParallelepiped(false);
    }
    updateAxesVisibility();
  };

  const handleDualBasis = () => {
    if (basis.length !== dimension || basis[0].length !== dimension) {
      console.log("Invalid basis provided. The basis should be a square matrix with dimensions equal to the original lattice dimension.");
      return;
    }

    const calculatedDualBasis = calculateDualBasis(basis);
    setDualBasis(calculatedDualBasis);
  };

  const handleShowOriginal = () => {
    setDualBasis(null);
  };

  const handleReturnToZeroView = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    camera.position.set(10, 10, 10);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    controls.update();
  };

  const handleToggleAxes = () => {
    setAxesVisible(!axesVisible);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (canvasContainerRef.current.requestFullscreen) {
        canvasContainerRef.current.requestFullscreen();
      } else if (canvasContainerRef.current.mozRequestFullScreen) { // Firefox
        canvasContainerRef.current.mozRequestFullScreen();
      } else if (canvasContainerRef.current.webkitRequestFullscreen) { // Chrome, Safari and Opera
        canvasContainerRef.current.webkitRequestFullscreen();
      } else if (canvasContainerRef.current.msRequestFullscreen) { // IE/Edge
        canvasContainerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div>
          <label>
            Dimension:
            <input id="dimension" name="dimension" type="number" min="2" max="400" value={dimension} onChange={handleDimensionChange} />
          </label>
        </div>
        <div>
          <label>
            Sum Limit:
            <input id="sumLimit" name="sumLimit" type="number" min="1" max="10" value={sumLimit} onChange={(e) => setSumLimit(parseInt(e.target.value))} />
          </label>
        </div>
        <div style={{ marginLeft: '20px' }}>
          <h3>Basis Vectors:</h3>
          {basis.map((vector, i) => (
            <div key={i} style={{ display: 'flex', marginBottom: '5px' }}>
              {vector.map((value, j) => (
                <input key={j} id={`basis-${i}-${j}`} name={`basis-${i}-${j}`} type="number" value={value} onChange={(e) => handleBasisChange(i, j, e.target.value)} style={{ width: '50px', marginRight: '5px' }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleShadeParallelepiped}>Shade Parallelepiped</button>
        <button onClick={handleUnshadeParallelepiped}>Unshade Parallelepiped</button>
        <button onClick={handleDualBasis}>Dual</button>
        <button onClick={handleShowOriginal}>Show Original</button>
        <button onClick={handleReturnToZeroView}>Return to Zero View</button>
        <button onClick={handleToggleAxes}>{axesVisible ? 'Hide Axes' : 'Show Axes'}</button>
        <button onClick={toggleFullscreen}>{isFullscreen ? 'Exit Fullscreen' : 'Go Fullscreen'}</button>
      </div>
      <div 
        style={{ 
          width: isFullscreen ? '100vw' : '1920px', 
          height: isFullscreen ? '100vh' : '1080px' 
        }} 
        ref={canvasContainerRef}
      >
        {dimension === 2 && <svg></svg>}
        {dimension > 2 && <canvas></canvas>}
      </div>
      <div id="info-board" style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 1000,
        fontSize: '14px'
      }}>
        Total Points Generated: {totalPointsGenerated} <br />
        Points Displayed: {pointCount} {totalPointsGenerated > MAX_POINTS && <span>(Showing only {MAX_POINTS})</span>}
      </div>
    </div>
  );
};

export default LatticeVisualizer;



