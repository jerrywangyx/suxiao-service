const fs = require('fs');
const path = require('path');
const Module = require('module');

const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function patchedResolve(request, parent, isMain, options) {
  try {
    return originalResolveFilename.call(this, request, parent, isMain, options);
  } catch (error) {
    const isRelativeChunk = request.startsWith('./');
    const parentInNextServer = parent && parent.filename && parent.filename.includes(`${path.sep}.next${path.sep}server${path.sep}`);

    if (error.code === 'MODULE_NOT_FOUND' && isRelativeChunk && parentInNextServer) {
      const candidate = path.join(path.dirname(parent.filename), 'chunks', request.slice(2));
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    throw error;
  }
};
