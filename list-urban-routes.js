const app = require('./src/app');

function printRoutes(stack, prefix = '') {
    stack.forEach(layer => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
            console.log(`${methods} ${prefix}${layer.route.path}`);
        } else if (layer.name === 'router' && layer.handle.stack) {
            printRoutes(layer.handle.stack, prefix + (layer.regexp.source.replace('\\/?(?=\\/|$)', '').replace('^\\', '').replace('\\/', '/').replace('\\', '')));
        }
    });
}

console.log('--- Urban Services Routes ---');
printRoutes(app._react_router_stack || app._router.stack);

