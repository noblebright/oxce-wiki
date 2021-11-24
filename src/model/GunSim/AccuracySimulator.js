import intersects from "./Vector";

export const VOXEL_PER_TILE = 16;

function generate(x) {
	return Math.floor(Math.random() * (x + 1));
}

function deg2Rad(deg) {
	return deg * Math.PI / 180;
}

const ShotType = {
	Aimed: 1,
	Snap: 2,
	Auto: 3
};

function applyAccuracy(origin, target, accuracy, keepRange, extendLine, weapon, shotType) {
	let xdiff = origin.x - target.x;
	let ydiff = origin.y - target.y;
	let realDistance = Math.sqrt(xdiff ** 2 + ydiff ** 2);
	let maxRange = keepRange ? realDistance : VOXEL_PER_TILE * 1000;
	let modifier = 0.0;
	let upperLimit;
	let lowerLimit = weapon.minRange;

	switch(shotType) {
	case ShotType.Aimed:
		upperLimit = weapon.aimRange;
		break;
	case ShotType.Snap:
		upperLimit = weapon.snapRange;
		break;
	case ShotType.Auto:
			upperLimit = weapon.autoRange;
		break;
	}

	if(realDistance / VOXEL_PER_TILE < lowerLimit) {
		modifier = (weapon.dropOff * (lowerLimit - realDistance / VOXEL_PER_TILE)) / 100;
	} else if (upperLimit < realDistance / VOXEL_PER_TILE) {
		modifier = (weapon.dropOff * (realDistance / VOXEL_PER_TILE - upperLimit)) / 100;
	}

	accuracy = Math.max(0, accuracy - modifier);

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


	if (extendLine) {
		const rotation = Math.atan2(target.y - origin.y, target.x - origin.x) * 180 / Math.PI;
		const tilt = Math.atan2(target.z - origin.z,
				Math.sqrt((target.x - origin.x) * (target.x - origin.x)
						+ (target.y - origin.y) * (target.y - origin.y)))
				* 180 / Math.PI;
		// calculate new target
		// this new target can be very far out of the map, but we don't care about that
		// right now
		const cos_fi = Math.cos(deg2Rad(tilt));
		const sin_fi = Math.sin(deg2Rad(tilt));
		const cos_te = Math.cos(deg2Rad(rotation));
		const sin_te = Math.sin(deg2Rad(rotation));
		target.x = Math.floor(origin.x + maxRange * cos_te * cos_fi);
		target.y = Math.floor(origin.y + maxRange * sin_te * cos_fi);
		target.z = Math.floor(origin.z + maxRange * sin_fi);
	}
}

//Position: { x, y, z }
//Target: { x, y, z, width, height}

const isBetween = (x, range , t) => t >= x && t <= x + range;

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

function simulateAcc(source, target, w, acc, simulations, shots, type) {
	let hit = 0;
	for(let i = 0; i < simulations; i++) {
		for(let s = 0; s < shots; s++) {
			let p = { x: target.x + target.width/2, y: target.y, z: target.z + target.height/2 }

			applyAccuracy(source, p, acc, true, false, w, type);

			if(intersects({...source}, {...p}, target)) {
				hit++;
			}
		}
	}
	return hit;
}

class Weapon {
		constructor(aimRange, minRange, autoRange, snapRange, dropOff, dmg) {
			this.aimRange = aimRange;
			this.minRange = minRange;
			this.autoRange = autoRange;
			this.snapRange = snapRange;
			this.dropOff = dropOff;
			this.dmg = dmg;
		}
}

//const source = { x: 160, y: 160, z: 160 };
//const target = { x: 160, y: source.y + (distance * Simulator.VOXEL_PER_TILE), z: 160, width: ?, height: ? };

export default simulateAcc;