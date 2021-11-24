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

export default intersects;