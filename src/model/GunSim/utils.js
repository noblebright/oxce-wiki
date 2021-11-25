export function generate(x) {
	return Math.floor(Math.random() * (x + 1));
}

export function mergeStats(a, b = {}) {
    const result = { ...a }; //clone a
    Object.keys(b).forEach(k => {
        if(result[k]) {
            result[k] += b[k];
        } else {
            result[k] = b[k];
        }
    });
    return result;
}
