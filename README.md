
# LatticeVisualizer

LatticeVisualizer is a React-based application for visualizing lattice points in 2D and 3D space. The application supports the generation and rendering of lattice points based on user-defined dimensions and basis vectors. Additionally, it provides functionality to shade and unshade random parallelepipeds within the lattice.

## Features

- **2D and 3D Visualization**: Visualize lattice points in 2D and 3D space.
- **Dynamic Basis Vectors**: Modify the basis vectors to see how the lattice changes.
- **Dimension Support**: Supports up to 3D visualization.
- **Shading Parallelepiped**: Shade a random parallelepiped within the lattice.
- **Unshading Parallelepiped**: Unshade the previously shaded parallelepiped.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/LatticeVisualizer.git
   cd LatticeVisualizer
   ```

2. Install the dependencies:
   ```sh
   npm install
   ```

### Running the Application

1. Start the development server:
   ```sh
   npm start
   ```

2. Open your web browser and navigate to `http://localhost:3000` to see the application in action.

## Usage

### Controls

- **Dimension**: Use the input field to set the lattice dimension (2D or 3D).
- **Sum Limit**: Set the range for the coefficients used in generating lattice points.
- **Basis Vectors**: Modify the basis vectors to see how the lattice changes.
- **Shade Parallelepiped**: Click the "Shade Parallelepiped" button to shade a random parallelepiped within the lattice.
- **Unshade Parallelepiped**: Click the "Unshade Parallelepiped" button to remove the shading.

### Example

To visualize a 2D lattice:
1. Set the dimension to 2.
2. Set the basis vectors to `[[1, 0], [0, 1]]`.
3. Click "Shade Parallelepiped" to shade a random area within the lattice.

To visualize a 3D lattice:
1. Set the dimension to 3.
2. Set the basis vectors to `[[1, 0, 0], [0, 1, 0], [0, 0, 1]]`.
3. Click "Shade Parallelepiped" to shade a random area within the lattice.

## See It in Action

You can see it in action on my blog: [CryptiCosmos]<https://ryotoru.github.io/blog/2024/math/>

## Code Overview

### Main Component

`LatticeVisualizer.js`:
- Handles the state and logic for dimension, basis vectors, sum limit, and shading.
- Generates lattice points based on user inputs.
- Renders 2D and 3D lattice visualizations using D3.js and Three.js.
- Provides buttons to shade and unshade parallelepipeds within the lattice.

### Dependencies

- **React**: UI library for building the application.
- **Three.js**: Library for 3D visualization.
- **D3.js**: Library for 2D visualization.
- **OrbitControls**: Three.js add-on for interactive controls.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any feature requests, bug fixes, or improvements.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React](https://reactjs.org/)
- [Three.js](https://threejs.org/)
- [D3.js](https://d3js.org/)
