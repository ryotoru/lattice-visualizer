
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
- A modern web browser.

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

## Embedding in a Blog

To embed the LatticeVisualizer app in a blog that supports Markdown (`.md` file):

### Step 1: Deploy Your React App

1. **Create a GitHub Repository**: Create a GitHub repository for your project if you don't have one already.
2. **Push Your Code to GitHub**: Push your local project to the GitHub repository.
3. **Install gh-pages**: Install the `gh-pages` package to help deploy to GitHub Pages.
   ```sh
   npm install gh-pages --save-dev
   ```

4. **Update `package.json`**: Add the following lines to your `package.json` file.
   ```json
   "homepage": "http://{your-username}.github.io/{your-repo-name}",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
   Replace `{your-username}` with your GitHub username and `{your-repo-name}` with your repository name.

5. **Deploy**: Deploy your app to GitHub Pages by running:
   ```sh
   npm run deploy
   ```

6. **Access Your App**: After deployment, you can access your app at `http://{your-username}.github.io/{your-repo-name}`.

### Step 2: Embed the App Using an Iframe

Once your app is deployed, you can embed it into your Markdown file using an iframe. Here’s how you can do it:

```markdown
# My Blog Post

Here is my Lattice Visualizer app embedded:

<iframe src="http://{your-username}.github.io/{your-repo-name}" width="1024" height="768"></iframe>
```

Replace `http://{your-username}.github.io/{your-repo-name}` with the actual URL of your deployed app.

### Full Example

Here is a full example of how your Markdown file (`post.md`) might look:

```markdown
# Exploring Lattice Visualizations

LatticeVisualizer is a React-based application for visualizing lattice points in 2D and 3D space. The application supports the generation and rendering of lattice points based on user-defined dimensions and basis vectors. Additionally, it provides functionality to shade and unshade random parallelepipeds within the lattice.

## Features

- **2D and 3D Visualization**: Visualize lattice points in 2D and 3D space.
- **Dynamic Basis Vectors**: Modify the basis vectors to see how the lattice changes.
- **Dimension Support**: Supports up to 3D visualization.
- **Shading Parallelepiped**: Shade a random parallelepiped within the lattice.
- **Unshading Parallelepiped**: Unshade the previously shaded parallelepiped.

## Try It Out

Here is my Lattice Visualizer app embedded:

<iframe src="http://{your-username}.github.io/{your-repo-name}" width="1024" height="768"></iframe>
```

Replace `http://{your-username}.github.io/{your-repo-name}` with the URL of your deployed app.

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
