// Handles all the game logic for all the boats on the board
export class Boats {
    public nbOfBoats: number;
    public boats: Boat[];

    constructor(nbOfBoats: number) {
        this.nbOfBoats = nbOfBoats;
        this.boats = [];
        // Generate the size of boats and their positions
        this.generateBoats(nbOfBoats);
    }

    // Reset the game
    public reset() {
        this.boats = [];
        this.generateBoats(this.nbOfBoats);
    }

    // Check if the shot hit a boat
    public updateHit(coord: Coord): boolean {
        return this.boats.find(b => b.updateHit(coord)) ? true : false;
    }

    // Return which boats are left on the board
    public boatsLeft(): Boat[] {
        return this.boats.filter(b => b.coords.some(c => !c.isHit));
    }

    // Generate the size of boats and their positions
    private generateBoats(nbOfBoats: number){
        for (let i = 0; i < nbOfBoats; i++) {
            // Generate a random size between 2 and 7
            const size = Math.floor(Math.random() * 6) + 2;
            // Generate a boat with the random size and add it to the list of boats
            this.boats.push(this.generateBoat(size));
        }
        // For debugging purposes
        console.log(this.boats);
    }

    // Generate a boat with a given size and position
    private generateBoat(size: number): Boat {
        // Generate a random position
        const x = Math.floor(Math.random() * 8);
        const y = Math.floor(Math.random() * 8);
        
        // Check if the boat is out of bounds
        if (x + size > 8) {
            return this.generateBoat(size);
        }
        if (y + size > 8) {
            return this.generateBoat(size);
        }

        // Determine the orientation of the boat
        const isVertical = Math.random() > 0.5;
        // Create the boat based on the characteristics determined above
        const boat = new Boat(size, new Coord(x, y), isVertical);

        // Check if the boat is overlapping with another boat
        if (this.boats.some(b => b.coords.some(c => boat.coords.some(c2 => c.equals(c2))))) {
            // If it is, generate a new boat
            return this.generateBoat(size);
        } else {
            // If it isn't, return the boat
            return boat;
        }
    }
}

// Handles all the game logic for 1 boat
export class Boat {
    public size: number;
    public origin: Coord;
    public isVertical: boolean;
    public coords: Coord[];

    constructor(size: number, origin: Coord, isVertical: boolean = false) {
        this.size = size;
        this.origin = origin;
        this.isVertical = isVertical;
        this.coords = this.generateCords();
    }

    // Check if the shot hit the boat
    public updateHit(coord: Coord): boolean {
        const index = this.coords.findIndex(c => c.equals(coord));
        if (index > -1) {
            this.coords[index].isHit = true;
            return true;
        }
        return false;
    }

    // Generate the coordinates of the boat
    private generateCords(): Coord[] {
        const coords: Coord[] = [];
        // Add the origin to the list of coordinates
        coords.push(this.origin);
        for (let i = 1; i < this.size; i++) {
            // Add the other coordinates based on the orientation of the boat
            if (this.isVertical) {
                coords.push(new Coord(this.origin.x + i, this.origin.y));
            } else {
                coords.push(new Coord(this.origin.x, this.origin.y + i));
            }
        }
        return coords;
    }
}

// Handles the coordinates of the board
export class Coord {
    public x: number;
    public y: number;
    // Keep track if coordinate is marked as hit or not
    public isHit: boolean = false;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // Check if 2 coordinates are equal
    public equals(other: Coord): boolean {
        return this.x == other.x && this.y == other.y;
    }
}