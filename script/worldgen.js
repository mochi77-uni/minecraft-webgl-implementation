
class WorldGen {
    constructor(chunkSize) {
        this.chunkSize = chunkSize;
        this.chunkSizeX = chunkSize;
        this.chunkSizeY = chunkSize;
        this.chunkSizeZ = chunkSize;
        this.blocksUniformList = new Uint8Array(cacheSizeX * cacheSizeY * cacheSizeZ);
    }


}