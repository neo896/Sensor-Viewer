function findPathToTarget(arr, target) {
    let result = [];
    let map = new Map();

    arr.forEach(item => map.set(item.name, item));

    function isReachable(name, target) {
        if (name === target) return true;
        if (!map.has(name)) return false;
        return isReachable(map.get(name).ref_point, target);
    }

    arr.forEach(item => {
        if (isReachable(item.name, target)) {
            result.push(item);
        }
    });

    function shouldABeBeforeB(a, b) {
        let current = a;

        while (current && map.has(current.ref_point)) {
            if (current.ref_point === b.name) {
                return true;
            }
            current = map.get(current.ref_point);
        }
        return false;
    }

    result.sort((a, b) => (shouldABeBeforeB(a, b) ? 1 : -1));

    return result;
}

export { findPathToTarget };
