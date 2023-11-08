export class Boats {
    public nbOfBoats: number;
    public boats: Boat[];

    constructor(nbOfBoats: number) {
        this.nbOfBoats = nbOfBoats;
        this.boats = [];
        this.generateBoats(nbOfBoats);
    }

    public reset() {
        this.boats = [];
        this.generateBoats(this.nbOfBoats);
    }

    public updateHit(coord: Coord): boolean {
        return this.boats.find(b => b.updateHit(coord)) ? true : false;
    }

    public boatsLeft(): Boat[] {
        return this.boats.filter(b => b.coords.some(c => !c.isHit));
    }

    private generateBoats(nbOfBoats: number){
        for (let i = 0; i < nbOfBoats; i++) {
            const size = Math.floor(Math.random() * 6) + 2;
            this.boats.push(this.generateBoat(size));
        }
        console.log(this.boats);
    }

    private generateBoat(size: number): Boat {
        const x = Math.floor(Math.random() * 8);
        const y = Math.floor(Math.random() * 8);
        if (x + size > 8) {
            return this.generateBoat(size);
        }
        if (y + size > 8) {
            return this.generateBoat(size);
        }
        const isVertical = Math.random() > 0.5;
        const boat = new Boat(size, new Coord(x, y), isVertical);
        if (this.boats.some(b => b.coords.some(c => boat.coords.some(c2 => c.equals(c2))))) {
            return this.generateBoat(size);
        } else {
            return boat;
        }
    }
}

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

    public updateHit(coord: Coord): boolean {
        const index = this.coords.findIndex(c => c.equals(coord));
        if (index > -1) {
            this.coords[index].isHit = true;
            return true;
        }
        return false;
    }

    private generateCords(): Coord[] {
        const coords: Coord[] = [];
        coords.push(this.origin);
        for (let i = 1; i < this.size; i++) {
            if (this.isVertical) {
                coords.push(new Coord(this.origin.x + i, this.origin.y));
            } else {
                coords.push(new Coord(this.origin.x, this.origin.y + i));
            }
        }
        return coords;
    }
}

export class Coord {
    public x: number;
    public y: number;
    public isHit: boolean = false;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public equals(other: Coord): boolean {
        return this.x == other.x && this.y == other.y;
    }
}