fs = require("fs");
const unitWidths = {  //Derived from LOFTEMPS.DAT
	"1": 3,
	"2": 5,
	"3": 7,
	"4": 9,
	"5": 11,
	"92": 32, //aggregated from [92, 89, 90, 91]
	"105": 16, //aggregated from [105, 108, 99, 102]
	"106": 8, //aggregated from [106, 109, 100, 103]
	"104": 24 //aggregated from [104, 107, 98, 101]
};

function generate(x) {
	return Math.floor(Math.random() * (x + 1));
}

class Vector3 {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	add(other) {
		return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
	}

	sub(other) {
		return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
	}

	scale(f) {
		return new Vector3(this.x * f, this.y * f, this.z * f);
	}

	cross(other) {
		return new Vector3(this.y * other.z - this.z * other.y, this.z - other.x - this.x * other.z, this.x - other.y - this.y * other.x);
	}

	dot(other) {
		return this.x * other.x + this.y * other.y + this.z * other.z;
	}
}

function intersectRayWithSquare(rayOrigin, rayDir, square1, square2, square3) {
	// 1.
	let dS21 = square2.sub(square1);
	let dS31 = square3.sub(square1);
	let n = dS21.cross(dS31);

	// 2.
	let dR = rayOrigin.sub(rayDir);

	let ndotdR = n.dot(dR);

	if (Math.abs(ndotdR) < 1e-6) { // Choose your tolerance
		return false;
	}

	let t = -n.dot(rayOrigin.sub(square1)) / ndotdR;
	let M = rayOrigin.add(dR.scale(t));

	// 3.
	let dMS1 = M.sub(square1);
	let u = dMS1.dot(dS21);
	let v = dMS1.dot(dS31);

	// 4.
	return (u >= 0 && u <= dS21.dot(dS21) && v >= 0 && v <= dS31.dot(dS31));
}

function intersects(ray1, ray2, t) {
	let square1 = new Vector3(t.x, t.y, t.z);
	let square2 = new Vector3(t.x + t.width, t.y, t.z);
	let square3 = new Vector3(t.x + t.width, t.y, t.z+t.height);
	let rayOrigin = new Vector3(ray1.x, ray1.y, ray1.z);
	let rayDir = new Vector3(ray2.x, ray2.y, ray2.z);
	return intersectRayWithSquare(rayOrigin, rayDir, square1, square2, square3);
}

const numEntries = (Object.keys(unitWidths).length + 1) * 24 * 110 * 50;
const buffer = new Uint16Array(numEntries);
const VOXEL_PER_TILE = 16;
const ITERATIONS = 100000;

class Target {
	constructor(x, y, z, width, height) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.width = width;
		this.height = height;
	}

	isHit(p) {
		return isBetween(this.x, this.width, p.x) && isBetween(this.z, this.height, p.z);
	}
}

function getAccuracy(width, height, accuracy, distance) {
	const source = { x: 160, y: 160, z: 160 };
	const target = new Target(160, source.y + (distance * VOXEL_PER_TILE), 160, width, height);
	let hits = 0;

	for(let i = 0; i < ITERATIONS; i++) {
		let p = { x: target.x + target.width/2, y: target.y, z: target.z + target.height/2 } // shooting at center mass
		applyAccuracy(source, p, accuracy);
		if(intersects({...source}, {...p}, target)) {
			hits++;
		}
	}
	//console.log(`width: ${width}, height: ${height}, accuracy: ${accuracy}, distance: ${distance}, hits: ${Math.floor(hits / 100000 * 65535)}`)
	return Math.floor(hits / ITERATIONS * 65535); // map onto UINT_16
}

function applyAccuracy(origin, target, accuracy) {
	let xDist = Math.abs(origin.x - target.x);
	let yDist = Math.abs(origin.y - target.y);
	let zDist = Math.abs(origin.z - target.z);
	let xyShift, zShift;

	if(xDist / 2 <= yDist) {
		xyShift = xDist / 4 + yDist; // and don't ask why, please. it's The Commandment
	} else {
		xyShift = (xDist + yDist) / 2; // that's uniform part of spreading
	}
	
	if (xyShift <= zDist) { // slight z deviation
		zShift = xyShift / 2 + zDist;
	} else {
		zShift = xyShift + zDist / 2;
	}

	let deviation = generate(100) - Math.floor(accuracy * 100);

	if (deviation >= 0) {
		deviation += 50; // add extra spread to "miss" cloud
	} else {
		deviation += 10; // accuracy of 109 or greater will become 1 (tightest spread)
	}

	deviation = Math.max(1, zShift * deviation / 200); // range ratio

	target.x += generate(deviation) - deviation / 2;
	target.y += generate(deviation) - deviation / 2;
	target.z += generate(deviation / 2) / 2 - deviation / 8;
}


function generateData() {
	Object.values(unitWidths).forEach((width, widthIdx) => {
		console.log(`generating width ${width}`);
		for(let height = 0; height < 24; height++) {
			for(let accuracy = 0; accuracy < 110; accuracy++) {
				for(let distance = 0; distance < 50; distance++) {
					buffer[widthIdx * 132000 + height * 5500 + accuracy * 50 + distance] = 
						getAccuracy(width, height + 1, accuracy / 100, distance + 1);
				}
			}
		}
	});
	for(let height = 0; height < 24; height++) {
		for(let accuracy = 0; accuracy < 110; accuracy++) {
			for(let distance = 0; distance < 50; distance++) {
				buffer[9 * 132000 + height * 5500 + accuracy * 50 + distance] = 
					getAccuracy(12, height + 1, accuracy / 100, distance + 1);
			}
		}
	}
}

generateData();
fs.writeFileSync("accuracyLookup.dat", buffer);