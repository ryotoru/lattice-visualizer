import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as d3 from 'd3';

const MAX_POINTS = 50000; // Adjusted maximum number of points to be generated

const LatticeVisualizer = () => {
  const [dimension, setDimension] = useState(2);
  const [basis, setBasis] = useState([
    [1, 0],
    [0, 1]
  ]);
  const [sumLimit, setSumLimit] = useState(5);
  const [shadeParallelepiped, setShadeParallelepiped] = useState(false);
  const [parallelepipedMesh, setParallelepipedMesh] = useState(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());

  const generateLatticePoints = useMemo(() => {
    const points = [];

    const range = Array.from({ length: 2 * sumLimit + 1 }, (_, i) => i - sumLimit);

    const cartesianProduct = (...arrays) => arrays.reduce((acc, array) => acc.flatMap(x => array.map(y => [...x, y])), [[]]);

    const coefficients = cartesianProduct(...Array(dimension).fill(range));

    const limitedCoefficients = coefficients.slice(0, MAX_POINTS);

    for (const coeff of limitedCoefficients) {
      const point = new Array(dimension).fill(0);
      for (let i = 0; i < dimension; i++) {
        for (let j = 0; j < dimension; j++) {
          point[j] += coeff[i] * basis[i][j];
        }
      }
      points.push(point);
    }

    return points;
  }, [dimension, basis, sumLimit]);

  const projectTo3D = useMemo(() => points => {
    return points.map(point => {
      const [x, y, z] = point;
      return [x || 0, y || 0, z || 0];
    });
  }, []);

  const render2DLattice = () => {
    const svg = d3.select(canvasRef.current);
    svg.selectAll("*").remove();

    const width = 1024;
    const height = 768;
    const margin = 20;

    svg.attr("width", width).attr("height", height);

    const points = generateLatticePoints;

    const xExtent = d3.extent(points, d => d[0]);
    const yExtent = d3.extent(points, d => d[1]);

    const xScale = d3.scaleLinear()
      .domain([xExtent[0], xExtent[1]])
      .range([margin, width - margin]);

    const yScale = d3.scaleLinear()
      .domain([yExtent[0], yExtent[1]])
      .range([height - margin, margin]);

    svg.selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d[0]))
      .attr("cy", d => yScale(d[1]))
      .attr("r", 3)
      .attr("fill", "red");

    svg.append("line")
      .attr("x1", xScale(0))
      .attr("y1", 0)
      .attr("x2", xScale(0))
      .attr("y2", height)
      .attr("stroke", "black");

    svg.append("line")
      .attr("x1", 0)
      .attr("y1", yScale(0))
      .attr("x2", width)
      .attr("y2", yScale(0))
      .attr("stroke", "black");
  };

  const render3DLattice = (isProjected) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = sceneRef.current;
    scene.clear(); 

    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas });

    renderer.setSize(1024, 768);

    let points = generateLatticePoints;
    if (isProjected) {
      points = projectTo3D(points);
    }

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({ color: 0xff0000, size: 0.1 });
    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    camera.position.z = 10;

    const controls = new OrbitControls(camera, renderer.domElement);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();
  };

  useEffect(() => {
    if (dimension > 3) {
      console.warn("Visualization only supports up to 3 dimensions.");
      render3DLattice(true); 
    } else if (dimension === 2) {
      render2DLattice();
    } else if (dimension === 3) {
      render3DLattice(false);
    }
  }, [dimension, basis, sumLimit, shadeParallelepiped, generateLatticePoints]);

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
      parallelepipedVertices.push(...vertex.slice(0, 3)); 
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
    const newBasis = Array.from({ length: dim }, (_, i) => (
      Array.from({ length: dim }, (_, j) => (i === j ? 1 : 0))
    ));
    setBasis(newBasis);
  };

  const handleBasisChange = (i, j, value) => {
    const newBasis = basis.map((row, rowIndex) => (
      row.map((col, colIndex) => (rowIndex === i && colIndex === j ? parseFloat(value) : col))
    ));
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
              <input
                key={j}
                type="number"
                value={value}
                onChange={(e) => handleBasisChange(i, j, e.target.value)}
                style={{ width: '50px', marginRight: '5px' }}
              />
            ))}
          </div>
        ))}
      </div>
      <button onClick={handleShadeParallelepiped}>Shade Parallelepiped</button>
      <button onClick={handleUnshadeParallelepiped}>Unshade Parallelepiped</button>
      {dimension <= 3 && (
        <div style={{ width: '1024px', height: '768px' }}>
          {dimension === 2 ? (
            <svg ref={canvasRef}></svg>
          ) : (
            <canvas ref={canvasRef}></canvas>
          )}
        </div>
      )}
      {dimension > 3 && (
        <div style={{ width: '1024px', height: '768px' }}>
          <canvas ref={canvasRef}></canvas>
        </div>
      )}
    </div>
  );
};

export default LatticeVisualizer;







