import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as d3 from 'd3';
import numeric from 'numeric';

const MAX_POINTS = 50000;

const LatticeVisualizer = () => {
  const [dimension, setDimension] = useState(2);
  const [basis, setBasis] = useState([
    [1, 0],
    [0, 1]
  ]);
  const [sumLimit, setSumLimit] = useState(5);
  const [dualBasis, setDualBasis] = useState(null);
  const [shadeParallelepiped, setShadeParallelepiped] = useState(false);
  const [parallelepipedMesh, setParallelepipedMesh] = useState(null);
  const canvasContainerRef = useRef(null);
  const rendererRef = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(new THREE.PerspectiveCamera(75, 1024 / 768, 0.1, 1000));

  useEffect(() => {
    const renderer = rendererRef.current;
    renderer.setSize(1024, 768);

    const camera = cameraRef.current;
    camera.position.z = 10;

    const canvas = renderer.domElement;
    if (canvasContainerRef.current && !canvasContainerRef.current.contains(canvas)) {
      canvasContainerRef.current.appendChild(canvas);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(sceneRef.current, camera);
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
  }, [dimension, basis, sumLimit, shadeParallelepiped, dualBasis]);

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

    if (coefficients.length > MAX_POINTS) {
      alert(`Too many points (${coefficients.length}). Limiting to ${MAX_POINTS} points for visualization.`);
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

    return points;
  };

  const calculateDualBasis = (basisMatrix) => {
    const basisMatrixT = numeric.transpose(basisMatrix);
    const inverseBasisMatrixT = numeric.inv(basisMatrixT);
    return numeric.transpose(inverseBasisMatrixT);
  };

  const points = useMemo(() => generateLatticePoints(basis), [dimension, basis, sumLimit]);
  const dualPoints = useMemo(() => (dualBasis ? generateLatticePoints(dualBasis) : []), [dimension, dualBasis, sumLimit]);

  const projectTo3D = (points) => points.map(point => [point[0] || 0, point[1] || 0, point[2] || 0]);

  const render2DLattice = () => {
    const svg = d3.select(canvasContainerRef.current).select('svg');
    svg.selectAll("*").remove();
    const width = 1024;
    const height = 768;
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

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
  };

  const shadeRandomParallelepiped = () => {
    const scene = sceneRef.current;
    if (parallelepipedMesh) {
      scene.remove(parallelepipedMesh);
    }

    const randomOffsets = Array.from({ length: dimension }, () => Math.floor(Math.random() * (2 * sumLimit + 1)) - sumLimit);
    const parallelepipedVertices = [];

    for (let i = 0; i < (1 << dimension); i++) {
      const vertex = new Array(dimension).fill(0);
      for (let j = 0; j < dimension; j++) {
        vertex[j] = randomOffsets[j];
        if (i & (1 << j)) {
          for (let k = 0; k < dimension; k++) {
            vertex[k] += basis[j][k];
          }
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
  };

  const handleDualBasis = () => {
    const calculatedDualBasis = calculateDualBasis(basis);
    setDualBasis(calculatedDualBasis);
  };

  return (
    <div>
      <div>
        <label>
          Dimension:
          <input type="number" min="2" max="400" value={dimension} onChange={handleDimensionChange} />
        </label>
      </div>
      <div>
        <label>
          Sum Limit:
          <input type="number" min="1" max="10" value={sumLimit} onChange={(e) => setSumLimit(parseInt(e.target.value))} />
        </label>
      </div>
      <div>
        <h3>Basis Vectors:</h3>
        {basis.map((vector, i) => (
          <div key={i}>
            {vector.map((value, j) => (
              <input key={j} type="number" value={value} onChange={(e) => handleBasisChange(i, j, e.target.value)} style={{ width: '50px', marginRight: '5px' }} />
            ))}
          </div>
        ))}
      </div>
      <button onClick={handleShadeParallelepiped}>Shade Parallelepiped</button>
      <button onClick={handleUnshadeParallelepiped}>Unshade Parallelepiped</button>
      <button onClick={handleDualBasis}>Dual</button>
      <div style={{ width: '1024px', height: '768px' }} ref={canvasContainerRef}>
        {dimension === 2 && <svg></svg>}
        {dimension > 2 && <canvas></canvas>}
      </div>
    </div>
  );
};

export default LatticeVisualizer;








