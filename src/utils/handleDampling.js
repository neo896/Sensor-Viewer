function createGraph(edges) {
    let graph = {};
    for (let edge of edges) {
        if (!graph[edge.name]) graph[edge.name] = [];
        if (!graph[edge.ref_point]) graph[edge.ref_point] = [];
        graph[edge.name].push(edge.ref_point);
        graph[edge.ref_point].push(edge.name);
    }
    return graph;
}

function bfs(graph, start) {
    let queue = [start];
    let visited = new Set();
    while (queue.length > 0) {
        let node = queue.shift();
        if (!visited.has(node)) {
            visited.add(node);
            queue.push(...(graph[node] || []));
        }
    }
    return visited;
}

function findDangling(edges) {
    let graph = createGraph(edges);
    let paths = bfs(graph, 'chassis');
    let nodes = edges.flatMap(edge => [edge.name, edge.ref_point]);
    let dangling = nodes.filter(node => !paths.has(node));
    return [...new Set(dangling)];
}

export { findDangling };
