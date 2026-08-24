// ============================================================
// Xinyi Sports Center AR
// MindAR + Three.js
//
// AR 方向素材：
//
// forward
//   ├── goose_forward.png
//   └── arrow_forward.png
//
// left
//   ├── goose_left.png
//   └── arrow_left.png
//
// right
//   ├── goose_right.png
//   └── arrow_right.png
//
// arrived
//   ├── goose_arrived.png
//   └── arrow_arrived.png
//
// ============================================================
//
// 已移除：
// ✗ 點點路線
// ✗ 點點連線
// ✗ 程式生成箭頭
// ✗ GLTFLoader
//
// ============================================================


// ============================================================
// Three.js
// ============================================================

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";


// ============================================================
// MindAR
// ============================================================

import { MindARThree } from
    "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";


// ============================================================
// Route
// ============================================================

import { ROUTES } from "./route.js";


// ============================================================
// MindAR Target 檔案
// ============================================================

const TARGET_FILE = "./targets.mind";


// ============================================================
// AR Container
// ============================================================

const arContainer =
    document.querySelector("#ar-container");


// ============================================================
// MindAR 初始化
// ============================================================

const mindarThree = new MindARThree({

    container: arContainer,

    imageTargetSrc: TARGET_FILE,

    maxTrack: 1,

    uiScanning: "yes",

    uiLoading: "yes"

});


// ============================================================
// Three.js
// ============================================================

const {
    renderer,
    scene,
    camera
} = mindarThree;


// ============================================================
// 光源
// ============================================================

const hemisphereLight =
    new THREE.HemisphereLight(
        0xffffff,
        0xbbbbbb,
        3
    );

scene.add(
    hemisphereLight
);


// ============================================================
// AR 素材資料夾
// ============================================================

const ASSET_PATH = "./assets/";


// ============================================================
// 四種 AR 狀態
// ============================================================
//
// forward = 前進
// left    = 左轉
// right   = 右轉
// arrived = 抵達
//
// ============================================================

const DIRECTION_ASSETS = {

    forward: {

        goose:
            `${ASSET_PATH}goose_forward.png`,

        arrow:
            `${ASSET_PATH}arrow_forward.png`

    },


    left: {

        goose:
            `${ASSET_PATH}goose_left.png`,

        arrow:
            `${ASSET_PATH}arrow_left.png`

    },


    right: {

        goose:
            `${ASSET_PATH}goose_right.png`,

        arrow:
            `${ASSET_PATH}arrow_right.png`

    },


    arrived: {

        goose:
            `${ASSET_PATH}goose_arrived.png`,

        arrow:
            `${ASSET_PATH}arrow_arrived.png`

    }

};


// ============================================================
// Texture Loader
// ============================================================

const textureLoader =
    new THREE.TextureLoader();


// ============================================================
// Texture Cache
// ============================================================

const textureCache = {};


// ============================================================
// 目前 AR 物件
// ============================================================

let currentARGroup = null;


// ============================================================
// 目前 Target
// ============================================================

let currentTargetIndex = null;


// ============================================================
// 載入 PNG
// ============================================================

function loadTexture(path) {

    if (textureCache[path]) {

        return Promise.resolve(
            textureCache[path]
        );

    }


    return new Promise(
        (resolve, reject) => {

            textureLoader.load(

                path,

                (texture) => {

                    texture.colorSpace =
                        THREE.SRGBColorSpace;

                    textureCache[path] =
                        texture;

                    resolve(texture);

                },

                undefined,

                (error) => {

                    console.error(
                        "❌ AR 圖片載入失敗：",
                        path,
                        error
                    );

                    reject(error);

                }

            );

        }
    );

}


// ============================================================
// 建立透明 PNG Sprite
// ============================================================

function createSprite(
    texture,
    width,
    height
) {

    const material =
        new THREE.SpriteMaterial({

            map: texture,

            transparent: true,

            alphaTest: 0.01,

            depthTest: true,

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


    return sprite;

}


// ============================================================
// 建立 Goose + Arrow
// ============================================================

async function createDirectionGroup(
    direction
) {

    const assets =
        DIRECTION_ASSETS[direction];


    // --------------------------------------------------------
    // 檢查方向
    // --------------------------------------------------------

    if (!assets) {

        console.error(
            "❌ 找不到方向素材：",
            direction
        );

        return null;

    }


    console.log(
        "載入 AR 素材：",
        direction
    );


    // --------------------------------------------------------
    // 載入 Goose
    // --------------------------------------------------------

    const gooseTexture =
        await loadTexture(
            assets.goose
        );


    // --------------------------------------------------------
    // 載入 Arrow
    // --------------------------------------------------------

    const arrowTexture =
        await loadTexture(
            assets.arrow
        );


    // --------------------------------------------------------
    // 建立群組
    // --------------------------------------------------------

    const group =
        new THREE.Group();


    // ========================================================
    // Goose 尺寸
    // ========================================================

    let gooseWidth = 1.0;

    let gooseHeight = 1.3;


    if (direction === "forward") {

        gooseWidth = 1.0;

        gooseHeight = 1.35;

    }


    if (direction === "left") {

        gooseWidth = 1.15;

        gooseHeight = 1.3;

    }


    if (direction === "right") {

        gooseWidth = 1.15;

        gooseHeight = 1.3;

    }


    // --------------------------------------------------------
    // arrived 尺寸
    // --------------------------------------------------------
    //
    // 抵達圖片比較大，
    // 所以稍微縮小，避免佔滿整個手機畫面。
    //
    // --------------------------------------------------------

    if (direction === "arrived") {

        gooseWidth = 1.15;

        gooseHeight = 1.15;

    }


    // ========================================================
    // 建立 Goose
    // ========================================================

    const goose =
        createSprite(
            gooseTexture,
            gooseWidth,
            gooseHeight
        );


    // --------------------------------------------------------
    // Goose 位置
    // --------------------------------------------------------

    if (direction === "arrived") {

        goose.position.set(
            0,
            0.65,
            0.02
        );

    } else {

        goose.position.set(
            0,
            0.65,
            0.02
        );

    }


    group.add(
        goose
    );


    // ========================================================
    // Arrow 尺寸
    // ========================================================

    let arrowWidth = 1.0;

    let arrowHeight = 0.8;


    if (direction === "forward") {

        arrowWidth = 0.85;

        arrowHeight = 1.0;

    }


    if (direction === "left") {

        arrowWidth = 1.25;

        arrowHeight = 0.9;

    }


    if (direction === "right") {

        arrowWidth = 1.25;

        arrowHeight = 0.9;

    }


    // --------------------------------------------------------
    // arrived Arrow
    // --------------------------------------------------------

    if (direction === "arrived") {

        arrowWidth = 1.15;

        arrowHeight = 1.15;

    }


    // ========================================================
    // 建立 Arrow
    // ========================================================

    const arrow =
        createSprite(
            arrowTexture,
            arrowWidth,
            arrowHeight
        );


    // --------------------------------------------------------
    // Arrow 位置
    // --------------------------------------------------------

    if (direction === "arrived") {

        arrow.position.set(
            0,
            -0.55,
            0.01
        );

    } else {

        arrow.position.set(
            0,
            -0.55,
            0.01
        );

    }


    group.add(
        arrow
    );


    // ========================================================
    // 整體位置
    // ========================================================

    group.position.set(
        0,
        0,
        0
    );


    // ========================================================
    // 整體縮放
    // ========================================================
    //
    // 如果 AR 裡太大，可以調這裡。
    //
    // 目前：
    // 1 = 原始設定
    // 0.8 = 小一點
    // 0.6 = 更小
    //
    // ========================================================

    group.scale.set(
        0.8,
        0.8,
        0.8
    );


    return group;

}


// ============================================================
// 移除目前 Goose + Arrow
// ============================================================

function removeCurrentARGroup() {

    if (!currentARGroup) {

        return;

    }


    // --------------------------------------------------------
    // 從 Scene / Anchor 移除
    // --------------------------------------------------------

    if (
        currentARGroup.parent
    ) {

        currentARGroup.parent.remove(
            currentARGroup
        );

    }


    // --------------------------------------------------------
    // 清理 Material
    // --------------------------------------------------------

    currentARGroup.traverse(
        (object) => {

            if (
                object.material
            ) {

                object.material.dispose();

            }

        }
    );


    currentARGroup = null;

}


// ============================================================
// 顯示 Goose + Arrow
// ============================================================

async function showDirection(
    anchor,
    direction
) {

    // --------------------------------------------------------
    // 先清除上一組
    // --------------------------------------------------------

    removeCurrentARGroup();


    // --------------------------------------------------------
    // 建立新的 AR 物件
    // --------------------------------------------------------

    const group =
        await createDirectionGroup(
            direction
        );


    if (!group) {

        return;

    }


    // --------------------------------------------------------
    // 放到目前辨識到的 Target
    // --------------------------------------------------------

    anchor.group.add(
        group
    );


    currentARGroup =
        group;


    console.log(
        `✅ AR 顯示：${direction}`
    );

}


// ============================================================
// 隱藏舊的抵達 HTML
// ============================================================
//
// 現在抵達狀態使用 AR Goose + Arrow，
// 不需要額外跳出白色 HTML 卡片。
// ============================================================

function hideArrival() {

    const arrival =
        document.querySelector(
            "#arrival"
        );


    if (!arrival) {

        return;

    }


    arrival.classList.remove(
        "show"
    );


    // 保險：直接隱藏
    arrival.style.display =
        "none";

}


// ============================================================
// 更新 HUD
// ============================================================

function updateHUD(
    route
) {

    const location =
        document.querySelector(
            "#current-location"
        );


    const instruction =
        document.querySelector(
            "#instruction"
        );


    if (location) {

        location.textContent =
            route.location;

    }


    if (instruction) {

        instruction.textContent =
            route.instruction;

    }

}


// ============================================================
// 更新路線
// ============================================================

async function updateRoute(
    targetIndex,
    anchor
) {

    const route =
        ROUTES[targetIndex];


    // --------------------------------------------------------
    // 沒有 route
    // --------------------------------------------------------

    if (!route) {

        console.warn(
            `⚠️ Target ${targetIndex} 沒有 route.js 設定`
        );

        return;

    }


    console.log(
        "================================"
    );


    console.log(
        `🎯 Target ${targetIndex} 已辨識`
    );


    console.log(
        "Location:",
        route.location
    );


    console.log(
        "Instruction:",
        route.instruction
    );


    console.log(
        "Direction:",
        route.direction
    );


    console.log(
        "Arrived:",
        route.arrived
    );


    console.log(
        "================================"
    );


    // --------------------------------------------------------
    // 記錄目前 Target
    // --------------------------------------------------------

    currentTargetIndex =
        targetIndex;


    // --------------------------------------------------------
    // 更新文字
    // --------------------------------------------------------

    updateHUD(
        route
    );


    // --------------------------------------------------------
    // 隱藏 HTML 抵達卡片
    // --------------------------------------------------------

    hideArrival();


    // --------------------------------------------------------
    // 檢查方向
    // --------------------------------------------------------

    const direction =
        route.direction;


    if (
        !DIRECTION_ASSETS[direction]
    ) {

        console.error(
            "❌ 找不到這個 direction 的素材：",
            direction
        );


        console.error(
            "目前支援：",
            Object.keys(
                DIRECTION_ASSETS
            )
        );


        return;

    }


    // --------------------------------------------------------
    // 顯示 AR Goose + Arrow
    // --------------------------------------------------------

    await showDirection(
        anchor,
        direction
    );


    // --------------------------------------------------------
    // 如果是抵達
    // --------------------------------------------------------

    if (
        route.arrived === true
    ) {

        console.log(
            "🏸 已抵達目的地"
        );

    }

}


// ============================================================
// 建立 5 個 MindAR Anchor
// ============================================================
//
// Target 0
// Target 1
// Target 2
// Target 3
// Target 4
//
// ============================================================

const anchors = [];


for (
    let i = 0;
    i < 5;
    i++
) {

    const anchor =
        mindarThree.addAnchor(
            i
        );


    anchors.push(
        anchor
    );


    // --------------------------------------------------------
    // Target Found
    // --------------------------------------------------------

    anchor.onTargetFound =
        async () => {

            console.log(
                `🎯 Target ${i} Found`
            );


            await updateRoute(
                i,
                anchor
            );

        };


    // --------------------------------------------------------
    // Target Lost
    // --------------------------------------------------------

    anchor.onTargetLost =
        () => {

            console.log(
                `Target ${i} Lost`
            );

        };

}


// ============================================================
// 啟動 AR
// ============================================================

async function startAR() {

    const startButton =
        document.querySelector(
            "#start-button"
        );


    const status =
        document.querySelector(
            "#status"
        );


    try {

        // ----------------------------------------------------
        // 按鈕
        // ----------------------------------------------------

        if (startButton) {

            startButton.disabled =
                true;

            startButton.textContent =
                "正在開啟相機…";

        }


        if (status) {

            status.textContent =
                "正在啟動 AR…";

        }


        // ----------------------------------------------------
        // 清除舊 AR
        // ----------------------------------------------------

        removeCurrentARGroup();


        // ----------------------------------------------------
        // 啟動 MindAR
        // ----------------------------------------------------

        await mindarThree.start();


        // ----------------------------------------------------
        // Renderer
        // ----------------------------------------------------

        renderer.setAnimationLoop(
            () => {

                renderer.render(
                    scene,
                    camera
                );

            }
        );


        // ----------------------------------------------------
        // 成功
        // ----------------------------------------------------

        console.log(
            "================================"
        );


        console.log(
            "✅ MindAR 啟動成功"
        );


        console.log(
            "✅ Target 數量：5"
        );


        console.log(
            "✅ Goose + Arrow：ON"
        );


        console.log(
            "✅ Arrived Goose + Arrow：ON"
        );


        console.log(
            "❌ Dot Route：OFF"
        );


        console.log(
            "================================"
        );


        if (status) {

            status.textContent =
                "請對準場景圖片";

        }


        // ----------------------------------------------------
        // 隱藏開始畫面
        // ----------------------------------------------------

        const startScreen =
            document.querySelector(
                "#start-screen"
            );


        if (startScreen) {

            startScreen.style.display =
                "none";

        }

    } catch (error) {

        // ----------------------------------------------------
        // AR 啟動失敗
        // ----------------------------------------------------

        console.error(
            "❌ AR 啟動失敗：",
            error
        );


        if (status) {

            status.textContent =
                "無法開啟相機，請確認瀏覽器相機權限。";

        }


        if (startButton) {

            startButton.disabled =
                false;

            startButton.textContent =
                "重新開啟 AR";

        }

    }

}


// ============================================================
// 開啟 AR 按鈕
// ============================================================

const startButton =
    document.querySelector(
        "#start-button"
    );


if (startButton) {

    startButton.addEventListener(
        "click",
        startAR
    );

}


// ============================================================
// 頁面載入
// ============================================================

window.addEventListener(
    "load",
    () => {

        console.log(
            "================================"
        );

        console.log(
            "🏸 Xinyi Sports Center AR"
        );

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
            "================================"
        );

    }
);