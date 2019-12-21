
// setup program info

function createProgramInfo(gl, vShaderName, fShaderName) {
    const program = initShaders(gl, vShaderName, fShaderName);
    const attribSetters = createAttribSetters(gl, program);
    const uniformSetters = createUniformSetters(gl, program);
    console.log(attribSetters)
    console.log(uniformSetters)
    return {
        program: program,
        attribSetters: attribSetters,
        uniformSetters: uniformSetters
    }
}

// buffers and attributes set function

function setBuffersAndAttributes(gl, setters, buffers) {
    setAttributes(setters, buffers.attribs);

}

function createBufferInfo(gl, arrays) {
    const bufferInfo = {
        attribs: createAttribs(gl, arrays)
    };

    return bufferInfo;
}

function createAttribs(gl, arrays) {
    const attribs = {};
    Object.keys(arrays).forEach(function(attribName) {
        attribs[attribName] = {
            buffer: createBuffer(gl, arrays[attribName]),
            type:   getGLType(gl, arrays[attribName])
        }
    });
    return attribs;
}

function createBuffer(gl, array, type, drawType) {
    type = type || gl.ARRAY_BUFFER;
    const buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
    return buffer;
}

function getGLType(gl, array) {
    if (array instanceof Int8Array)    { return gl.BYTE; }
    if (array instanceof Uint8Array)   { return gl.UNSIGNED_BYTE; }
    if (array instanceof Int16Array)   { return gl.SHORT; }
    if (array instanceof Uint16Array)  { return gl.UNSIGNED_SHORT; }
    if (array instanceof Int32Array)   { return gl.INT; }
    if (array instanceof Uint32Array)  { return gl.UNSIGNED_INT; }
    if (array instanceof Float32Array) { return gl.FLOAT; }
    throw 'unsupported typed array type';
}

// attribute setter functions

function setAttributes(setters, attribs) {
    setters = setters || setters.attribSetters;
    Object.keys(attribs).forEach(function(name) {
        const setter = setters[name];
        if(setter) { setter(attribs[name]); }
    })
}

function createAttribSetters(gl, program) {
    function createAttribSetter(index) {
        return function(b) {
            gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
            gl.enableVertexAttribArray(index);
            gl.vertexAttribPointer(index, b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
        }
    }

    const attribSetters = {};
    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

    for(let i = 0; i < numAttribs; i++) {
        const attribInfo = gl.getActiveAttrib(program, i);
        if(!attribInfo) break;
        let name = attribInfo.name;
        const index = gl.getAttribLocation(program, name);
        attribSetters[name] = createAttribSetter(index);
    }
    return attribSetters;
}

// uniform setter functions

function setUniforms(setters, values) {
    Object.keys(setters).forEach(function(name) {
        const setter = setters[name];
        if(setter) { setter(values[setter]); }
    });
}

function createUniformSetters(gl, program) {
    let textureUnit = 0;
    function createUniformSetter(program, uniformInfo) {
        const location = gl.getUniformLocation(program, uniformInfo.name);
        const type = uniformInfo.type;
        const isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]");

        // all types of float (vector)
        if(type === gl.FLOAT && isArray)
            return function(v) { gl.uniform1fv(location, v); }
        else if(type === gl.FLOAT)
            return function(v) { gl.uniform1f(location, v); }
        else if(type === gl.FLOAT_VEC2)
            return function(v) { gl.uniform2fv(location, v); }
        else if(type === gl.FLOAT_VEC3)
            return function(v) { gl.uniform3fv(location, v); }
        else if(type === gl.FLOAT_VEC4)
            return function(v) { gl.uniform4fv(location, v); }

        // all types of int (vector)
        if(type === gl.INT && isArray)
            return function(v) { gl.uniform1i(location, v); }
        else if(type === gl.INT_VEC2)
            return function(v) { gl.uniform2iv(location, v); }
        else if(type === gl.INT_VEC3)
            return function(v) { gl.uniform3iv(location, v); }
        else if(type === gl.INT_VEC4)
            return function(v) { gl.uniform4iv(location, v); }

        // all types of bool (vector)
        if(type === gl.BOOL && isArray)
            return function(v) { gl.uniform1iv(location, v); }
        else if(type === gl.BOOL_VEC2)
            return function(v) { gl.uniform2iv(location, v); }
        else if(type === gl.BOOL_VEC3)
            return function(v) { gl.uniform3iv(location, v); }
        else if(type === gl.BOOL_VEC4)
            return function(v) { gl.uniform4iv(location, v); }

        // all types of float matrix
        if(type === gl.FLOAT_MAT2)
            return function(v) { gl.uniformMatrix2fv(location, false, v); }
        else if(type === gl.FLOAT_MAT3)
            return function(v) { gl.uniformMatrix3fv(location, false, v); }
        else if(type === gl.FLOAT_MAT4)
            return function(v) { gl.uniformMatrix4fv(location, false, v); }

        // sampler types
        else if(type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
            return function(bindPoint, unit) {
                return function(texture) {
                    gl.uniform1f(location, unit);
                    gl.activeTexture(gl.TEXTURE0 + unit);
                    gl.bindTexture(bindPoint, texture);
                };
            }(getSamplerType(gl, type), textureUnit++);
        }

        throw("Error: Unknown type");
    }

    const uniformSetters = {};
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for(let i = 0; i < numUniforms; i++) {
        // gl.getActiveUniform gives back "name", "size", and "type"
        const uniformInfo = gl.getActiveUniform(program, i);
        let name = uniformInfo.name;
        if(name.substr(-3) === '[0]')
            name = name.substr(0, name.length - 3);
        const setter = createUniformSetter(program, uniformInfo);
        uniformSetters[name] = setter;
    }
    return uniformSetters;
}

function getSamplerType(gl, type) {
    if(type === gl.SAMPLER_2D)      return gl.TEXTURE_2D;
    if(type === gl.SAMPLER_CUBE)    return gl.TEXTURE_CUBE_MAP;
    return undefined;
}
