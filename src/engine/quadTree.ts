/**
 * @file quadTree.ts
 * @description QuadTree implementation for efficient spatial partitioning and collision detection
 * Provides a hierarchical structure to reduce the number of collision checks needed
 * between game entities.
 */

// Types for boundary and point representation
interface Boundary {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Point {
    x: number;
    y: number;
}

/**
 * Represents an object that can be stored in the QuadTree
 */
export interface QuadTreeObject {
    x: number;
    y: number;
    width: number;
    height: number;
    id?: string | number;
}

/**
 * Configuration for QuadTree
 */
const CONFIG = {
    MAX_OBJECTS: 10,    // Maximum objects a node can hold before splitting
    MAX_LEVELS: 5,      // Maximum levels deep the tree can grow
    DEFAULT_BOUNDARY: {
        x: 0,
        y: 0,
        width: 1000,    // Default width of game world
        height: 1000    // Default height of game world
    }
};

/**
 * QuadTree implementation for spatial partitioning
 */
export class QuadTree {
    private boundary: Boundary;
    private objects: QuadTreeObject[];
    private nodes: QuadTree[];
    private level: number;

    /**
     * Creates a new QuadTree instance
     * @param boundary - The boundary of this quad tree node
     * @param level - The depth level of this node (0 being root)
     */
    constructor(boundary: Boundary = CONFIG.DEFAULT_BOUNDARY, level: number = 0) {
        this.boundary = boundary;
        this.objects = [];
        this.nodes = [];
        this.level = level;
    }

    /**
     * Clears the QuadTree, removing all objects and subnodes
     */
    public clear(): void {
        this.objects = [];
        
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i]) {
                this.nodes[i].clear();
            }
        }
        this.nodes = [];
    }

    /**
     * Splits the node into four subnodes
     */
    private split(): void {
        const subWidth = this.boundary.width / 2;
        const subHeight = this.boundary.height / 2;
        const x = this.boundary.x;
        const y = this.boundary.y;

        this.nodes[0] = new QuadTree({
            x: x + subWidth,
            y: y,
            width: subWidth,
            height: subHeight
        }, this.level + 1);

        this.nodes[1] = new QuadTree({
            x: x,
            y: y,
            width: subWidth,
            height: subHeight
        }, this.level + 1);

        this.nodes[2] = new QuadTree({
            x: x,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, this.level + 1);

        this.nodes[3] = new QuadTree({
            x: x + subWidth,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, this.level + 1);
    }

    /**
     * Determines which node an object belongs to
     * @param rect - The object to check
     * @returns Index of the node (-1 if object cannot completely fit within a child node)
     */
    private getIndex(rect: QuadTreeObject): number {
        const verticalMidpoint = this.boundary.x + (this.boundary.width / 2);
        const horizontalMidpoint = this.boundary.y + (this.boundary.height / 2);

        const topQuadrant = (rect.y < horizontalMidpoint && rect.y + rect.height < horizontalMidpoint);
        const bottomQuadrant = (rect.y > horizontalMidpoint);

        if (rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint) {
            if (topQuadrant) return 1;
            if (bottomQuadrant) return 2;
        }
        else if (rect.x > verticalMidpoint) {
            if (topQuadrant) return 0;
            if (bottomQuadrant) return 3;
        }

        return -1;
    }

    /**
     * Inserts an object into the QuadTree
     * @param obj - The object to insert
     */
    public insert(obj: QuadTreeObject): void {
        if (!this.boundary) {
            throw new Error('QuadTree boundary not set');
        }

        if (this.nodes.length) {
            const index = this.getIndex(obj);

            if (index !== -1) {
                this.nodes[index].insert(obj);
                return;
            }
        }

        this.objects.push(obj);

        if (this.objects.length > CONFIG.MAX_OBJECTS && this.level < CONFIG.MAX_LEVELS) {
            if (this.nodes.length === 0) {
                this.split();
            }

            let i = 0;
            while (i < this.objects.length) {
                const index = this.getIndex(this.objects[i]);
                if (index !== -1) {
                    this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                } else {
                    i++;
                }
            }
        }
    }

    /**
     * Returns all objects that could collide with the given object
     * @param obj - The object to check against
     * @returns Array of objects that could collide with the given object
     */
    public retrieve(obj: QuadTreeObject): QuadTreeObject[] {
        const index = this.getIndex(obj);
        let returnObjects = this.objects;

        if (this.nodes.length) {
            if (index !== -1) {
                returnObjects = returnObjects.concat(this.nodes[index].retrieve(obj));
            } else {
                // Object spans multiple quads - need to check all
                for (const node of this.nodes) {
                    returnObjects = returnObjects.concat(node.retrieve(obj));
                }
            }
        }

        return returnObjects;
    }

    /**
     * Checks if a point is within the boundary of this quad
     * @param point - The point to check
     * @returns boolean indicating if the point is contained
     */
    public containsPoint(point: Point): boolean {
        return point.x >= this.boundary.x &&
               point.x <= this.boundary.x + this.boundary.width &&
               point.y >= this.boundary.y &&
               point.y <= this.boundary.y + this.boundary.height;
    }
}

export default QuadTree;