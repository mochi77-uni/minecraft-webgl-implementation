
function eventListenerRegister() {
    // event listeners for buttons
    document.getElementById('fullscreen-button').addEventListener('click', handleFullscreen);
    gl.canvas.addEventListener('mousemove', handleCanvasMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('msfullscreenchange', handleFullScreenChange);
    window.addEventListener('resize', handleWindowResize);
}