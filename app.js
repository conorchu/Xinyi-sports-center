// ========================================================
// Xinyi Sports Center AR
// MindAR + Three.js
//
// 功能：
// 1. 5 張 Target
// 2. Goose + Arrow
// 3. 不使用點點路線
// 4. Goose 永遠位於 Arrow 右下方
// 5. Goose / Arrow 尺寸縮小為原本 1/3
// 6. Target 4 = arrived
// ========================================================


// ========================================================
// Three.js
// ========================================================

import * as THREE from "three";


// ========================================================
// MindAR
// ========================================================

import {
    MindARThree
} from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";


// ========================================================
// Route
// ========================================================

import {
    ROUTE
} from "./route.js";


// ========================================================
// 基本設定
// ========================================================

const TARGET_FILE = "./targets-v2.mind";


// ========================================================
// AR 物件縮放
//
// 原本：
// Goose 約 1.0～1.1
// Arrow 約 0.85～1.0
//
// 現在全部 × 1/3
// ========================================================

const OBJECT_SCALE = 1 / 3;


// ========================================================
// Goose / Arrow 相對位置
//
// Arrow：上方
// Goose：右下方
//
// 注意：
// Three.js
// X 正值 = 右
// Y 負值 = 下
// ========================================================

const ARROW_POSITION = {
    x: 0,
    y: 0.25,
    z: 0.01
};


const GOOSE_POSITION = {
    x: 0.18,
    y: -0.12,
    z: 0.02
};


// ========================================================
// 原始尺寸
// ========================================================

const ORIGINAL_SIZE = {

    goose: {

        forward: {
            width: 1.0,
            height: 1.35
        },

        left: {
            width: 1.1,
            height: 1.3
        },

        right: {
            width: 1.1,
            height: 1.3
        },

        arrived: {
            width: 1.1,
            height: 1.3
        }

    },


    arrow: {

        forward: {
            width: 0.85,
            height: 1.0
        },

        left: {
            width: 1.0,
            height: 0.8
        },

        right: {
            width: 1.0,
            height: 0.8
        },

        arrived: {
            width: 1.0,
            height: 0.8
        }

    }

};


// ========================================================
// 實際尺寸 = 原本的 1/3
// ========================================================

function getSize(type, direction) {

    const original =
        ORIGINAL_SIZE[type][direction]
        ||
        ORIGINAL_SIZE[type].forward;


    return {

        width:
            original.width *
            OBJECT_SCALE,

        height:
            original.height *
            OBJECT_SCALE

    };

}


// ========================================================
// HTML
// ========================================================

const statusText =
    document.querySelector("#status");


const currentLocation =
    document.querySelector("#current-location");


// ========================================================
// 狀態
// ========================================================

let currentTargetIndex = null;

let currentAnchor = null;

let mindarThree = null;

let renderer = null;

let scene = null;

let camera = null;


// ========================================================
// Texture Loader
// ========================================================

const textureLoader =
    new THREE.TextureLoader();


// ========================================================
// 取得 Arrow 圖片
// ========================================================

function getArrowImage(direction) {

    switch (direction) {

        case "left":

            return "./arrow_left.png";


        case "right":

            return "./arrow_right.png";


        case "arrived":

            return "./arrow_arrived.png";


        case "forward":

        default:

            return "./arrow_forward.png";

    }

}


// ========================================================
// 取得 Goose 圖片
// ========================================================

function getGooseImage(direction) {

    switch (direction) {

        case "left":

            return "./goose_left.png";


        case "right":

            return "./goose_right.png";


        case "arrived":

            return "./goose_arrived.png";


        case "forward":

        default:

            return "./goose_forward.png";

    }

}


// ========================================================
// 建立 Sprite
// ========================================================

function createSprite(
    imagePath,
    width,
    height,
    position
) {

    const texture =
        textureLoader.load(
            imagePath
        );


    texture.colorSpace =
        THREE.SRGBColorSpace;


    const material =
        new THREE.SpriteMaterial({

            map: texture,

            transparent: true,

            depthTest: false,

            depthWrite: false

        });


    const sprite =
        new THREE.Sprite(
            material
        );


    sprite.scale.set(
        width,
        height,
        1
    );


    sprite.position.set(
        position.x,
        position.y,
        position.z
    );


    return sprite;

}


// ========================================================
// 建立 Goose + Arrow
// ========================================================

function createARObjects(
    anchor,
    direction
) {

    console.log(
        "================================"
    );


    console.log(
        "載入 AR 素材：",
        direction
    );


    // ----------------------------------------------------
    // Arrow
    // ----------------------------------------------------

    const arrowSize =
        getSize(
            "arrow",
            direction
        );


    const arrowImage =
        getArrowImage(
            direction
        );


    const arrow =
        createSprite(

            arrowImage,

            arrowSize.width,

            arrowSize.height,

            ARROW_POSITION

        );


    arrow.name =
        "AR_ARROW";


    // ----------------------------------------------------
    // Goose
    // ----------------------------------------------------

    const gooseSize =
        getSize(
            "goose",
            direction
        );


    const gooseImage =
        getGooseImage(
            direction
        );


    const goose =
        createSprite(

            gooseImage,

            gooseSize.width,

            gooseSize.height,

            GOOSE_POSITION

        );


    goose.name =
        "AR_GOOSE";


    // ----------------------------------------------------
    // 加入 Anchor
    // ----------------------------------------------------

    anchor.group.add(
        arrow
    );


    anchor.group.add(
        goose
    );


    // ----------------------------------------------------
    // Console
    // ----------------------------------------------------

    console.log(
        "✅ AR 顯示：",
        direction
    );


    console.log(
        "Arrow：",
        arrowImage
    );


    console.log(
        "Goose：",
        gooseImage
    );


    console.log(
        "Arrow Size：",
        arrowSize
    );


    console.log(
        "Goose Size：",
        gooseSize
    );


    console.log(
        "Arrow Position：",
        ARROW_POSITION
    );


    console.log(
        "Goose Position：",
        GOOSE_POSITION
    );


    console.log(
        "================================"
    );


    return {
        arrow,
        goose
    };

}


// ========================================================
// 清除目前 AR 物件
// ========================================================

function clearARObjects(anchor) {

    if (!anchor) {
        return;
    }


    const objects = [
        ...anchor.group.children
    ];


    objects.forEach(
        object => {

            anchor.group.remove(
                object
            );


            if (object.material) {

                if (object.material.map) {

                    object.material.map.dispose();

                }


                object.material.dispose();

            }


            if (object.geometry) {

                object.geometry.dispose();

            }

        }
    );

}


// ========================================================
// 更新畫面上的文字
// ========================================================

function updateUI(targetIndex) {

    const data =
        ROUTE[targetIndex];


    if (!data) {
        return;
    }


    // ----------------------------------------------------
    // 目前位置
    // ----------------------------------------------------

    if (currentLocation) {

        currentLocation.textContent =
            data.location;

    }


    // ----------------------------------------------------
    // 指示文字
    // ----------------------------------------------------

    if (statusText) {

        statusText.textContent =
            data.instruction;

    }


    console.log(
        "================================"
    );


    console.log(
        "🎯 Target",
        targetIndex,
        "已辨識"
    );


    console.log(
        "Location:",
        data.location
    );


    console.log(
        "Instruction:",
        data.instruction
    );


    console.log(
        "Direction:",
        data.direction
    );


    console.log(
        "Arrived:",
        data.arrived
    );


    console.log(
        "================================"
    );

}


// ========================================================
// Target Found
// ========================================================

function onTargetFound(
    targetIndex,
    anchor
) {

    console.log(
        "🎯 Target",
        targetIndex,
        "Found"
    );


    currentTargetIndex =
        targetIndex;


    currentAnchor =
        anchor;


    const data =
        ROUTE[targetIndex];


    if (!data) {

        console.error(
            "找不到 Route：",
            targetIndex
        );

        return;

    }


    // ----------------------------------------------------
    // 更新文字
    // ----------------------------------------------------

    updateUI(
        targetIndex
    );


    // ----------------------------------------------------
    // 清除舊物件
    // ----------------------------------------------------

    clearARObjects(
        anchor
    );


    // ----------------------------------------------------
    // 建立新的 Goose + Arrow
    // ----------------------------------------------------

    createARObjects(

        anchor,

        data.direction

    );

}


// ========================================================
// Target Lost
// ========================================================

function onTargetLost(
    targetIndex
) {

    console.log(
        "Target",
        targetIndex,
        "Lost"
    );


    if (
        currentTargetIndex ===
        targetIndex
    ) {

        currentTargetIndex =
            null;

        currentAnchor =
            null;

    }

}


// ========================================================
// 建立 MindAR
// ========================================================

async function initAR() {

    console.log(
        "================================"
    );


    console.log(
        "Xinyi Sports Center AR"
    );


    console.log(
        "================================"
    );


    try {

        // ==================================================
        // 建立 MindAR
        // ==================================================

        mindarThree =
            new MindARThree({

                container:
                    document.body,

                imageTargetSrc:
                    TARGET_FILE,

                maxTrack:
                    1

            });


        renderer =
            mindarThree.renderer;


        scene =
            mindarThree.scene;


        camera =
            mindarThree.camera;


        // ==================================================
        // Renderer
        // ==================================================

        renderer.outputColorSpace =
            THREE.SRGBColorSpace;


        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );


        // ==================================================
        // Target 數量
        // ==================================================

        console.log(
            "Target：0 ~ 4"
        );


        // ==================================================
        // 建立 5 個 Target Anchor
        // ==================================================

        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const anchor =
                mindarThree.addAnchor(
                    i
                );


            // ------------------------------------------------
            // Target Found
            // ------------------------------------------------

            anchor.onTargetFound =
                () => {

                    onTargetFound(
                        i,
                        anchor
                    );

                };


            // ------------------------------------------------
            // Target Lost
            // ------------------------------------------------

            anchor.onTargetLost =
                () => {

                    onTargetLost(
                        i
                    );

                };

        }


        // ==================================================
        // Console
        // ==================================================

        console.log(
            "MindAR：ON"
        );


        console.log(
            "Target：0 ~ 4"
        );


        console.log(
            "Goose：ON"
        );


        console.log(
            "Arrow：ON"
        );


        console.log(
            "Arrived：ON"
        );


        console.log(
            "Dot Route：OFF"
        );


        console.log(
            "Object Scale：1/3"
        );


        console.log(
            "Goose Position：Arrow 右下方"
        );


        console.log(
            "================================"
        );


    } catch (error) {

        console.error(
            "❌ MindAR 初始化失敗：",
            error
        );


        if (statusText) {

            statusText.textContent =
                "AR 初始化失敗";

        }

    }

}


// ========================================================
// 啟動 AR
// ========================================================

async function startAR() {

    console.log(
        "================================"
    );


    console.log(
        "開始啟動 AR"
    );


    console.log(
        "================================"
    );


    try {

        if (!mindarThree) {

            console.log(
                "MindAR 尚未初始化，開始初始化..."
            );


            await initAR();

        }


        if (!mindarThree) {

            throw new Error(
                "MindAR 初始化失敗"
            );

        }


        // ==================================================
        // 開始 AR
        // ==================================================

        await mindarThree.start();


        console.log(
            "✅ MindAR 啟動成功"
        );


        // ==================================================
        // 更新 UI
        // ==================================================

        if (statusText) {

            statusText.textContent =
                "請對準標地圖";

        }


        // ==================================================
        // Render Loop
        // ==================================================

        renderer.setAnimationLoop(
            () => {

                renderer.render(
                    scene,
                    camera
                );

            }
        );


        console.log(
            "================================"
        );


        console.log(
            "🟢 AR Camera Ready"
        );


        console.log(
            "================================"
        );


    } catch (error) {

        console.error(
            "❌ AR 啟動失敗：",
            error
        );


        if (statusText) {

            statusText.textContent =
                "AR 啟動失敗：" +
                error.message;

        }

    }

}


// ========================================================
// 暴露給 index.html
//
// 如果你的 index.html 是：
// onclick="startAR()"
// 就需要這一行。
// ========================================================

window.startAR =
    startAR;


// ========================================================
// 初始化
// ========================================================

initAR();


// ========================================================
// 防止手機旋轉後畫面尺寸錯誤
// ========================================================

window.addEventListener(
    "resize",
    () => {

        if (!renderer) {
            return;
        }


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


// ========================================================
// 完成
// ========================================================

console.log(
    "================================"
);


console.log(
    "Xinyi Sports Center AR App Loaded"
);


console.log(
    "Arrow：1/3"
);


console.log(
    "Goose：1/3"
);


console.log(
    "Goose：Arrow 右下方"
);


console.log(
    "Dot Route：OFF"
);


console.log(
    "================================"
);