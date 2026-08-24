// ========================================================
// Xinyi Sports Center AR
// MindAR + Three.js
//
// ✅ 5 張 Target
// ✅ Goose
// ✅ Arrow
// ✅ Arrived
// ❌ Dot Route
//
// 本版：
// ✅ Arrow = 原本 1/3
// ✅ Goose = 原本 1/3
// ✅ Goose 永遠在 Arrow 右下方
//
// 重要：
// ❌ 不從 route.js import ROUTE
// ========================================================


// ========================================================
// Three.js
// ========================================================

import * as THREE from
    "https://unpkg.com/three@0.160.0/build/three.module.js";


// ========================================================
// MindAR
// ========================================================

import {
    MindARThree
} from
    "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";


// ========================================================
// Target
// ========================================================

const TARGET_FILE = "./targets-v2.mind";


// ========================================================
// ROUTE
//
// 直接放在 app.js
// 不再 import "./route.js"
// ========================================================

const ROUTE = {

    // --------------------------------------------------------
    // Target 0
    // --------------------------------------------------------

    0: {

        location: "定位點",

        instruction: "你快到門口了，往左轉",

        direction: "left",

        rotation: 0,

        arrived: false

    },


    // --------------------------------------------------------
    // Target 1
    // --------------------------------------------------------

    1: {

        location: "信義運動中心",

        instruction: "往前走道電梯口",

        direction: "forward",

        rotation: 0,

        arrived: false

    },


    // --------------------------------------------------------
    // Target 2
    // --------------------------------------------------------

    2: {

        location: "信義運動中心",

        instruction: "往前走道電梯口",

        direction: "left",

        rotation: 0,

        arrived: false

    },


    // --------------------------------------------------------
    // Target 3
    // --------------------------------------------------------

    3: {

        location: "電梯口",

        instruction: "搭電梯到6樓",

        direction: "forward",

        rotation: 0,

        arrived: false

    },


    // --------------------------------------------------------
    // Target 4
    // --------------------------------------------------------

    4: {

        location: "羽球場",

        instruction: "已抵達目的地",

        direction: "arrived",

        rotation: 0,

        arrived: true

    }

};


// ========================================================
// AR 物件縮放
//
// 原本尺寸 × 1/3
// ========================================================

const OBJECT_SCALE = 1 / 3;


// ========================================================
// Arrow 位置
// ========================================================

const ARROW_X = 0;

const ARROW_Y = 0.25;

const ARROW_Z = 0.01;


// ========================================================
// Goose 位置
//
// Goose：
// X 正值 = Arrow 右邊
// Y 負值 = Arrow 下方
// ========================================================

const GOOSE_X = 0.18;

const GOOSE_Y = -0.12;

const GOOSE_Z = 0.02;


// ========================================================
// Arrow 原始尺寸
// ========================================================

const ARROW_SIZE = {

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

};


// ========================================================
// Goose 原始尺寸
// ========================================================

const GOOSE_SIZE = {

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

};


// ========================================================
// HTML
// ========================================================

const statusText =
    document.querySelector("#status");


const currentLocation =
    document.querySelector("#current-location");


// ========================================================
// MindAR
// ========================================================

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
// Arrow 圖片
// ========================================================

function getArrowImage(direction) {

    if (
        direction === "left"
    ) {

        return "./arrow_left.png";

    }


    if (
        direction === "right"
    ) {

        return "./arrow_right.png";

    }


    if (
        direction === "arrived"
    ) {

        return "./arrow_arrived.png";

    }


    return "./arrow_forward.png";

}


// ========================================================
// Goose 圖片
// ========================================================

function getGooseImage(direction) {

    if (
        direction === "left"
    ) {

        return "./goose_left.png";

    }


    if (
        direction === "right"
    ) {

        return "./goose_right.png";

    }


    if (
        direction === "arrived"
    ) {

        return "./goose_arrived.png";

    }


    return "./goose_forward.png";

}


// ========================================================
// 建立 Sprite
// ========================================================

function createSprite(

    imagePath,

    width,

    height,

    x,

    y,

    z

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

        x,

        y,

        z

    );


    return sprite;

}


// ========================================================
// 建立 Arrow + Goose
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


    // ====================================================
    // Arrow
    // ====================================================

    const originalArrow =

        ARROW_SIZE[direction]

        ||

        ARROW_SIZE.forward;


    const arrowWidth =

        originalArrow.width *

        OBJECT_SCALE;


    const arrowHeight =

        originalArrow.height *

        OBJECT_SCALE;


    const arrowImage =

        getArrowImage(
            direction
        );


    const arrow =

        createSprite(

            arrowImage,

            arrowWidth,

            arrowHeight,

            ARROW_X,

            ARROW_Y,

            ARROW_Z

        );


    arrow.name =
        "ARROW";


    // ====================================================
    // Goose
    // ====================================================

    const originalGoose =

        GOOSE_SIZE[direction]

        ||

        GOOSE_SIZE.forward;


    const gooseWidth =

        originalGoose.width *

        OBJECT_SCALE;


    const gooseHeight =

        originalGoose.height *

        OBJECT_SCALE;


    const gooseImage =

        getGooseImage(
            direction
        );


    const goose =

        createSprite(

            gooseImage,

            gooseWidth,

            gooseHeight,

            GOOSE_X,

            GOOSE_Y,

            GOOSE_Z

        );


    goose.name =
        "GOOSE";


    // ====================================================
    // 加入 AR
    // ====================================================

    anchor.group.add(
        arrow
    );


    anchor.group.add(
        goose
    );


    // ====================================================
    // Console
    // ====================================================

    console.log(
        "✅ Arrow：1/3"
    );

    console.log(
        "✅ Goose：1/3"
    );

    console.log(
        "Arrow position:",
        ARROW_X,
        ARROW_Y
    );

    console.log(
        "Goose position:",
        GOOSE_X,
        GOOSE_Y
    );

    console.log(
        "Goose = Arrow 右下方"
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
// 清除 AR 物件
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


            if (
                object.material
            ) {

                if (
                    object.material.map
                ) {

                    object.material.map.dispose();

                }


                object.material.dispose();

            }


            if (
                object.geometry
            ) {

                object.geometry.dispose();

            }

        }

    );

}


// ========================================================
// Target Found
// ========================================================

function handleTargetFound(

    targetIndex,

    anchor

) {

    console.log(
        "================================"
    );

    console.log(
        "🎯 Target",
        targetIndex,
        "Found"
    );


    const data =
        ROUTE[targetIndex];


    if (!data) {

        console.error(

            "❌ ROUTE 找不到 Target：",

            targetIndex

        );

        return;

    }


    // ====================================================
    // UI
    // ====================================================

    if (
        currentLocation
    ) {

        currentLocation.textContent =
            data.location;

    }


    if (
        statusText
    ) {

        statusText.textContent =
            data.instruction;

    }


    // ====================================================
    // Console
    // ====================================================

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


    // ====================================================
    // 清除舊 AR
    // ====================================================

    clearARObjects(
        anchor
    );


    // ====================================================
    // 建立新的 AR
    // ====================================================

    createARObjects(

        anchor,

        data.direction

    );


    console.log(
        "================================"
    );

}


// ========================================================
// Target Lost
// ========================================================

function handleTargetLost(
    targetIndex
) {

    console.log(

        "Target",

        targetIndex,

        "Lost"

    );

}


// ========================================================
// 初始化 MindAR
// ========================================================

function initAR() {

    console.log(
        "================================"
    );

    console.log(
        "Xinyi Sports Center AR"
    );

    console.log(
        "開始初始化 MindAR..."
    );


    try {

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
        // 5 個 Target
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


            anchor.onTargetFound =

                () => {

                    handleTargetFound(

                        i,

                        anchor

                    );

                };


            anchor.onTargetLost =

                () => {

                    handleTargetLost(
                        i
                    );

                };

        }


        console.log(
            "✅ MindAR 初始化完成"
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
            "================================"
        );


    } catch (error) {

        console.error(

            "❌ MindAR 初始化失敗：",

            error

        );


        if (
            statusText
        ) {

            statusText.textContent =
                "AR 初始化失敗";

        }

    }

}


// ========================================================
// 開啟 AR 相機
// ========================================================

async function startAR() {

    console.log(
        "================================"
    );

    console.log(
        "📷 startAR() 被執行"
    );

    console.log(
        "================================"
    );


    try {

        // ==================================================
        // 如果尚未初始化
        // ==================================================

        if (
            !mindarThree
        ) {

            initAR();

        }


        if (
            !mindarThree
        ) {

            throw new Error(

                "MindAR 尚未成功初始化"

            );

        }


        // ==================================================
        // 啟動相機
        // ==================================================

        if (
            statusText
        ) {

            statusText.textContent =
                "正在開啟相機…";

        }


        console.log(
            "正在啟動 MindAR..."
        );


        await mindarThree.start();


        console.log(
            "================================"
        );

        console.log(
            "✅ MindAR 啟動成功"
        );

        console.log(
            "================================"
        );


        if (
            statusText
        ) {

            statusText.textContent =
                "請對準標地圖";

        }


        // ==================================================
        // Render
        // ==================================================

        renderer.setAnimationLoop(

            () => {

                renderer.render(

                    scene,

                    camera

                );

            }

        );


    } catch (error) {

        console.error(
            "================================"
        );

        console.error(
            "❌ AR 啟動失敗"
        );

        console.error(
            error
        );

        console.error(
            "================================"
        );


        if (
            statusText
        ) {

            statusText.textContent =

                "AR 啟動失敗：" +

                error.message;

        }

    }

}


// ========================================================
// 給 index.html 的按鈕使用
// ========================================================

window.startAR =
    startAR;


// ========================================================
// 初始化
//
// 注意：
// 只初始化 MindAR
// 不會自動開啟相機
// ========================================================

initAR();


// ========================================================
// Resize
// ========================================================

window.addEventListener(

    "resize",

    () => {

        if (
            !renderer
        ) {

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
    "Xinyi Sports Center AR Loaded"
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