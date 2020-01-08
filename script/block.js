
let blockTextures, bumpTextures, unknownTexture;
let blocksUniformList = new HashTable();

function useTextures(localBlockTextures, localBumpTextures, localUnknownTexture) {
    blockTextures = localBlockTextures;
    bumpTextures = localBumpTextures;
    unknownTexture = localUnknownTexture;
}

function readTextFile(file){
    let rawFile = new XMLHttpRequest();
    let allText;
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status === 0)
            {
                allText = rawFile.responseText;
            }
        }
    };
    rawFile.send(null);
    return allText;
}

function initBlocksTextures(gl) {
    blockTextures = getBlockTextures(gl);
    bumpTextures = getBumpTextures(gl);
    console.log(blockTextures);
}

function getNameById(object, value) {
    const list = (Number.isInteger(value)) ? [value, 0] : value;
    return Object.keys(object).find(key => object[key][0] === list[0] && object[key][1] === list[1]);
}

function placeBlock(x, y, z, id) {
    if(blocksUniformList.hasItem([x, y, z])) {
        console.log('OCCUPIED');
        return;
    }
    const name = (typeof id === "string") ? id : getNameById(blockIdList, id);
    const isCubemap = cubeMapBlocksList.includes(name);
    const texture = blockTextures[name] || unknownTexture;
    blocksUniformList.setItem([x, y, z], {
        texture: texture,
        bumpTexture: bumpTextures[name],
        modelMatrix: m4.translate(m4.identity(), [x, y, z]),
        isCubemap: isCubemap
    });
}

function removeBlock(x, y, z) {
    if(blocksUniformList.hasItem([x, y, z])) {
        blocksUniformList.setItem([x, y, z], undefined);
        blocksUniformList.removeItem([x, y, z]);
    }
}

function replaceBlock(x, y, z, id) {
    if(blocksUniformList.hasItem([x, y, z])) {
        blocksUniformList.removeItem([x, y, z]);
    }
    const name = (typeof id === "string") ? id : getNameById(blockIdList, id);
    const isCubemap = cubeMapBlocksList.includes(name);
    blocksUniformList.setItem([x, y, z], {
        texture: blockTextures[name],
        bumpTexture: bumpTextures[name],
        modelMatrix: m4.translate(m4.identity(), [x, y, z]),
        isCubemap: isCubemap
    });
}

function placeBlockByMap(mapName, offset) {
    const mapLocation = "./map/" + mapName + ".txt";
    const lines = readTextFile(mapLocation).split('\n');
    lines.forEach(function(line) {
        if(line !== "") {
            const words = line.split(' ');
            console.log(words);
            const pos = words.slice(0, 4).map(Number);
            const id = (words.length === 4) ? pos[3] : [pos[3], pos[4]];
            placeBlock(pos[0], pos[1], pos[2], pos[3]);
        }
    });
}

function getTextureUniforms(id) {
    const name = (typeof id === "string") ? id : getNameById(blockIdList, id);
    return {
        texture: blockTextures[name],
        bumpTexture: bumpTextures[name],
    };
}

const blockIdList = {
    bedrock: [7, 0],
    acacia_log: [162, 0],
    lime_terracotta: [240, 0],
    lime_wool: [35, 5],
    acacia_planks: [5, 4],
    magenta_concrete: [251, 2],
    andesite: [1, 5],
    magenta_terracotta: [237, 2],
    birch_leaves: [18, 2],
    magenta_wool: [35, 2],
    birch_log: [17, 2],
    mossy_cobblestone: [48, 0],
    mossy_stone_bricks: [98, 1],
    birch_planks: [5, 2],
    mycelium: [110, 0],
    black_concrete: [251, 15],
    black_terracotta: [250, 0],
    nether_bricks: [112, 0],
    black_wool: [35, 15],
    nether_quartz_ore: [153, 0],
    blue_concrete: [251, 11],
    netherrack: [87, 0],
    blue_terracotta: [246, 0],
    oak_leaves: [18, 0],
    blue_wool: [35, 11],
    oak_log: [17, 0],
    bricks: [45, 0],
    brown_concrete: [251, 12],
    oak_planks: [5, 0],
    brown_terracotta: [247, 0],
    obsidian: [49, 0],
    brown_wool: [35, 12],
    orange_concrete: [251, 1],
    chiseled_stone_bricks: [98, 3],
    orange_terracotta: [236, 0],
    clay: [82, 0],
    orange_wool: [35, 1],
    coal_block: [173, 0],
    pink_concrete: [251, 6],
    coal_ore: [16, 0],
    pink_terracotta: [241, 0],
    coarse_dirt: [3, 1],
    pink_wool: [35, 6],
    cobblestone: [4, 0],
    podzol: [3, 2],
    cracked_stone_bricks: [98, 2],
    cyan_concrete: [251, 9],
    polished_andesite: [1, 6],
    cyan_terracotta: [244, 0],
    polished_diorite: [1, 4],
    cyan_wool: [35, 9],
    polished_granite: [1, 2],
    dark_oak_leaves: [161, 1],
    purple_concrete: [251, 10],
    dark_oak_log: [162, 1],
    purple_terracotta: [245, 0],
    purple_wool: [35, 10],
    dark_oak_planks: [5, 5],
    red_concrete: [251, 14],
    diamond_ore: [56, 0],
    red_nether_bricks: [215, 0],
    diorite: [1, 3],
    red_sand: [12, 1],
    dirt: [3, 0],
    red_terracotta: [249, 0],
    emerald_ore: [129, 0],
    red_wool: [35, 14],
    end_stone: [121, 0],
    redstone_ore: [73, 0],
    end_stone_bricks: [206, 0],
    sand: [12, 0],
    glowstone: [89, 0],
    smooth_stone: [43, 8],
    gold_ore: [14, 0],
    snow: [80, 0],
    granite: [1, 1],
    soul_sand: [88, 0],
    grass_block: [2, 0],
    spruce_leaves: [18, 1],
    spruce_log: [17, 1],
    spruce_planks: [5, 1],
    stone: [1, 0],
    gravel: [13, 0],
    stone_bricks: [98, 0],
    gray_concrete: [251, 7],
    gray_terracotta: [242, 0],
    gray_wool: [35, 7],
    green_concrete: [251, 13],
    green_terracotta: [248, 0],
    green_wool: [35, 13],
    iron_ore: [15, 0],
    jungle_leaves: [18, 3],
    jungle_log: [17, 3],
    jungle_planks: [5, 3],
    lapis_ore: [21, 0],
    light_blue_concrete: [251, 3],
    light_blue_terracotta: [238, 0],
    white_concrete: [251, 0],
    light_blue_wool: [35, 3],
    white_terracotta: [235, 0],
    light_gray_concrete: [251, 8],
    white_wool: [35, 0],
    light_gray_terracotta: [243, 0],
    yellow_concrete: [251, 4],
    light_gray_wool: [35, 8],
    yellow_terracotta: [239, 0],
    lime_concrete: [251, 5],
    yellow_wool: [35, 4]
};