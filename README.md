# D3 Node Tree Visualization Generator

A tool to generate interactive, force-directed node tree visualizations from JSON data using D3.js and HTML Canvas.

## Features

- Force-directed graph layout
- Interactive node dragging
- Automatic node clustering for nodes with more than 3 children
- Click to expand/collapse clusters
- Smooth animations
- Canvas-based rendering for better performance

## Prerequisites

- Node.js installed on your system
- A modern web browser

## Project Structure

```
d3-node-tree/
├── src/
│   ├── nodeTree.js        # Core visualization implementation
│   └── generateNodeTree.js # Generator script
├── examples/
│   └── example_data.json  # Example data structure
├── package.json           # Project configuration
├── README.md             # Documentation
└── .gitignore           # Git ignore rules
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/d3-node-tree.git
cd d3-node-tree
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Using npm scripts

1. Generate visualization from example data:
```bash
npm run example
```

2. Generate visualization from your own data:
```bash
npm run generate path/to/your/data.json
```

### Using node directly
```bash
node src/generateNodeTree.js path/to/your/data.json
```

## Data Format

Your JSON data should follow this structure:
```json
{
    "id": "Root",
    "children": [
        {
            "id": "Node1",
            "children": [
                { "id": "Child1" },
                { "id": "Child2" }
            ]
        }
    ]
}
```

### Example Data Structure
The repository includes an example data file (`examples/example_data.json`) that demonstrates a hierarchical structure of technology and design concepts:

- Root
  - Technology
    - Frontend (HTML, CSS, JavaScript, React, Vue)
    - Backend (Node.js, Python, Java, Go)
    - Database (SQL, MongoDB, Redis)
  - Design
    - UI (Layout, Typography, Color Theory)
    - UX (User Research, Wireframing, Prototyping, Testing)
  - Management (Agile, Scrum, Kanban)

## Interaction Guide

- **Drag nodes**: Click and drag any node to reposition it
- **Expand cluster**: Click on an orange node (collapsed cluster) to expand it
- **Collapse node**: Click on a blue node with children to collapse it
- **Node colors**:
  - Orange: Collapsed node with children
  - Blue: Expanded node or leaf node
- **Numbers**: Displayed in collapsed nodes to show the number of hidden children

## Technical Details

### Visualization Features
- Force-directed layout for automatic node positioning
- Canvas rendering for better performance
- Automatic clustering of nodes with more than 3 children
- Interactive drag and click functionality
- Smooth animations for expanding/collapsing nodes

### Dependencies
- D3.js v7.0.0 for force simulation and interactions
- HTML5 Canvas for rendering
- Node.js for generating the visualization file

## Troubleshooting

1. If the visualization is not showing:
   - Check your JSON file format
   - Ensure all files are in the same directory
   - Check browser console for errors

2. If nodes are not draggable:
   - Make sure you're using a modern browser
   - Check if D3.js is loading correctly

3. If clustering is not working:
   - Verify your JSON structure
   - Check that nodes have proper `children` arrays

## Limitations

- Best suited for trees with less than 1000 nodes
- Requires modern browser with Canvas support
- JSON file must be valid and follow the required structure

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Look through existing issues
3. Create a new issue with:
   - Your JSON data structure
   - Steps to reproduce the problem
   - Browser and system information 