class NodeTree {
    constructor(container, data) {
        this.container = container;
        this.data = data;
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.simulation = null;
        this.nodes = [];
        this.links = [];
        this.transform = d3.zoomIdentity;
        this.dragging = false;
        this.selectedNode = null;
        this.clusterThreshold = 3;
        
        this.init();
    }

    init() {
        // Setup canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Process data
        this.processData(this.data);

        // Setup force simulation with adjusted parameters
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.links)
                .id(d => d.id)
                .distance(100)
                .strength(1))
            .force('charge', d3.forceManyBody()
                .strength(-500)
                .distanceMax(300))
            .force('collide', d3.forceCollide()
                .radius(30)
                .strength(0.7))
            .force('center', d3.forceCenter(
                this.canvas.width / 2,
                this.canvas.height / 2)
            )
            .velocityDecay(0.3)
            .alphaMin(0.001)
            .alphaDecay(0.0228)
            .on('tick', () => this.draw());

        // Setup interactions
        this.setupDrag();
    }

    resizeCanvas() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    processData(data, parent = null, depth = 0) {
        const node = {
            id: data.id || `node-${this.nodes.length}`,
            children: [],
            depth: depth,
            collapsed: data.children && data.children.length > this.clusterThreshold,
            childCount: data.children ? data.children.length : 0,
            originalData: data
        };

        this.nodes.push(node);

        if (parent) {
            this.links.push({
                source: parent.id,
                target: node.id
            });
        }

        if (data.children && data.children.length) {
            if (!node.collapsed) {
                data.children.forEach(child => {
                    const childNode = this.processData(child, node, depth + 1);
                    node.children.push(childNode);
                });
            }
        }

        return node;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.transform.x, this.transform.y);
        this.ctx.scale(this.transform.k, this.transform.k);

        // Draw links
        this.links.forEach(link => {
            const sourceNode = this.nodes.find(n => n.id === link.source.id || n.id === link.source);
            const targetNode = this.nodes.find(n => n.id === link.target.id || n.id === link.target);
            
            if (sourceNode && targetNode && sourceNode.x != null && sourceNode.y != null && 
                targetNode.x != null && targetNode.y != null) {
                this.ctx.beginPath();
                this.ctx.moveTo(sourceNode.x, sourceNode.y);
                this.ctx.lineTo(targetNode.x, targetNode.y);
                this.ctx.strokeStyle = '#999';
                this.ctx.stroke();
            }
        });

        // Draw nodes
        this.nodes.forEach(node => {
            if (node.x == null || node.y == null) return;
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI);
            this.ctx.fillStyle = node.collapsed ? '#ff7f0e' : '#1f77b4';
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.stroke();

            if (node.collapsed && node.childCount > 0) {
                this.ctx.fillStyle = 'white';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(node.childCount.toString(), node.x, node.y);
            }

            // Add node label
            this.ctx.fillStyle = '#000';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillText(node.id, node.x, node.y - 15);
        });

        this.ctx.restore();
    }

    setupDrag() {
        let draggedNode = null;
        let dragStartPosition = null;

        const dragSubject = (event) => {
            // Get mouse position in canvas coordinates
            const point = d3.pointer(event, this.canvas);
            // Transform to simulation coordinates
            const x = (point[0] - this.transform.x) / this.transform.k;
            const y = (point[1] - this.transform.y) / this.transform.k;

            // Find the closest node
            const node = this.nodes.find(n => {
                const dx = x - (n.x || 0);
                const dy = y - (n.y || 0);
                return dx * dx + dy * dy < 400; // Increased hit area
            });

            return node;
        };

        const drag = d3.drag()
            .container(this.canvas)
            .subject(dragSubject)
            .on('start', (event) => {
                if (!event.subject) return;
                
                draggedNode = event.subject;
                dragStartPosition = d3.pointer(event, this.canvas);
                
                // Stop any ongoing simulation
                this.simulation.alphaTarget(0.3).restart();
                
                // Fix the node in place during drag
                draggedNode.fx = draggedNode.x;
                draggedNode.fy = draggedNode.y;
            })
            .on('drag', (event) => {
                if (!draggedNode) return;
                
                // Update node position
                draggedNode.fx = (event.x - this.transform.x) / this.transform.k;
                draggedNode.fy = (event.y - this.transform.y) / this.transform.k;
                
                // Keep simulation running
                this.simulation.alpha(0.3).restart();
            })
            .on('end', (event) => {
                if (!draggedNode || !dragStartPosition) return;

                // Check if this was a click (not a drag)
                const endPoint = d3.pointer(event, this.canvas);
                const dx = endPoint[0] - dragStartPosition[0];
                const dy = endPoint[1] - dragStartPosition[1];
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 5) {
                    console.log('Click detected on node:', draggedNode);
                    if (draggedNode.collapsed) {
                        this.expandCluster(draggedNode);
                    } else if (draggedNode.children && draggedNode.children.length > 0) {
                        this.collapseCluster(draggedNode);
                    }
                }

                // Release the node
                draggedNode.fx = null;
                draggedNode.fy = null;
                
                this.simulation.alphaTarget(0);
                draggedNode = null;
                dragStartPosition = null;
            });

        d3.select(this.canvas).call(drag);
    }

    expandCluster(node) {
        console.log('Expanding node:', node);
        
        if (!node.originalData.children || node.originalData.children.length === 0) {
            console.log('No children to expand');
            return;
        }
        
        // Mark the node as expanded
        node.collapsed = false;
        
        const angleStep = (2 * Math.PI) / node.originalData.children.length;
        const radius = 100; // Distance from parent
        
        node.originalData.children.forEach((childData, index) => {
            const angle = index * angleStep;
            
            const childNode = {
                id: childData.id,
                children: [],
                depth: node.depth + 1,
                collapsed: childData.children && childData.children.length > this.clusterThreshold,
                childCount: childData.children ? childData.children.length : 0,
                originalData: childData,
                // Position around parent with some randomness
                x: node.x + radius * Math.cos(angle) * (0.9 + Math.random() * 0.2),
                y: node.y + radius * Math.sin(angle) * (0.9 + Math.random() * 0.2)
            };
            
            this.nodes.push(childNode);
            this.links.push({
                source: node.id,
                target: childNode.id
            });
            node.children.push(childNode);
        });
        
        // Update simulation with higher alpha to ensure proper layout
        this.simulation.nodes(this.nodes);
        this.simulation.force('link').links(this.links);
        this.simulation.alpha(1).restart();
    }

    collapseCluster(node) {
        console.log('Collapsing node:', node);
        
        // Mark the node as collapsed
        node.collapsed = true;
        
        // Remove all descendant nodes and their links
        const descendantIds = new Set();
        const getDescendants = (n) => {
            n.children.forEach(child => {
                descendantIds.add(child.id);
                getDescendants(child);
            });
        };
        getDescendants(node);
        
        // Filter out the descendants
        this.nodes = this.nodes.filter(n => !descendantIds.has(n.id));
        this.links = this.links.filter(l => 
            !descendantIds.has(l.source.id) && 
            !descendantIds.has(l.target.id)
        );
        
        // Clear the node's children array
        node.children = [];
        
        // Update simulation
        this.simulation.nodes(this.nodes);
        this.simulation.force('link').links(this.links);
        this.simulation.alpha(1).restart();
    }
}

// Example usage:
const sampleData = {
    id: "root",
    children: [
        {
            id: "A",
            children: [
                { id: "A1" },
                { id: "A2" },
                { id: "A3" },
                { id: "A4" },
                { id: "A5" }
            ]
        },
        {
            id: "B",
            children: [
                { id: "B1" },
                { id: "B2" },
                { id: "B3" },
                { id: "B4" }
            ]
        },
        {
            id: "C",
            children: [
                { id: "C1" },
                { id: "C2" }
            ]
        }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    const nodeTree = new NodeTree(container, sampleData);
}); 