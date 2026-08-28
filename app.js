// ============================================================
// Xinyi Sports Center AR
// MindAR + Three.js
//
// Goose 位置：箭頭下方 + 偏右
// 整體大小：約為原本的 1/3
// ============================================================


// ============================================================
// ★ 羽球+1 網址
// ============================================================
//
// 把這裡改成你的「羽球+1」正式網址。
//
// ============================================================

const BADMINTON_PLUS_URL =
    "https://badminton-web-1051941896828.asia-east1.run.app/play.html";


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
// MindAR Target
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
    // Goose
    // --------------------------------------------------------

    const gooseTexture =
        await loadTexture(
            assets.goose
        );


    // --------------------------------------------------------
    // Arrow
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
    // Goose
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


    if (direction === "arrived") {

        gooseWidth = 1.15;

        gooseHeight = 1.15;

    }


    const goose =
        createSprite(
            gooseTexture,
            gooseWidth,
            gooseHeight
        );


    // Goose：
    // ↓ 箭頭下方
    // → 稍微偏右

    goose.position.set(

        0.35,

        -0.45,

        0.02

    );


    group.add(
        goose
    );


    // ========================================================
    // Arrow
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


    if (direction === "arrived") {

        arrowWidth = 1.15;

        arrowHeight = 1.15;

    }


    const arrow =
        createSprite(
            arrowTexture,
            arrowWidth,
            arrowHeight
        );


    // Arrow 在上方

    arrow.position.set(

        0,

        0.55,

        0.01

    );


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
    // 整體縮小到原本約 1/3
    // ========================================================

    group.scale.set(
        0.27,
        0.27,
        0.27
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


    if (
        currentARGroup.parent
    ) {

        currentARGroup.parent.remove(
            currentARGroup
        );

    }


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

    removeCurrentARGroup();


    const group =
        await createDirectionGroup(
            direction
        );


    if (!group) {

        return;

    }


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
// 隱藏抵達卡片
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


    currentTargetIndex =
        targetIndex;


    updateHUD(
        route
    );


    hideArrival();


    const direction =
        route.direction;


    if (
        !DIRECTION_ASSETS[direction]
    ) {

        console.error(
            "❌ 找不到這個 direction 的素材：",
            direction
        );

        return;

    }


    await showDirection(
        anchor,
        direction
    );


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


    const backButton =
        document.querySelector(
            "#back-button"
        );


    try {

        // ----------------------------------------------------
        // 開始按鈕
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
        // 啟動成功
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


        // ----------------------------------------------------
        // ★ 顯示 Icon
        // ----------------------------------------------------

        if (backButton) {

            backButton.classList.add(
                "show"
            );

        }


    } catch (error) {

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
// ★ 點擊 Icon → 返回羽球+1
// ============================================================

async function exitAR() {

    console.log(
        "================================"
    );

    console.log(
        "🏸 返回羽球+1"
    );


    // --------------------------------------------------------
    // 隱藏 Icon
    // --------------------------------------------------------

    const backButton =
        document.querySelector(
            "#back-button"
        );


    if (backButton) {

        backButton.classList.remove(
            "show"
        );

    }


    // --------------------------------------------------------
    // 移除 Goose + Arrow
    // --------------------------------------------------------

    removeCurrentARGroup();


    // --------------------------------------------------------
    // 停止 Three.js
    // --------------------------------------------------------

    renderer.setAnimationLoop(
        null
    );


    // --------------------------------------------------------
    // 停止 MindAR
    // --------------------------------------------------------

    try {

        await mindarThree.stop();

        console.log(
            "✅ MindAR 已停止"
        );

    } catch (error) {

        console.warn(
            "⚠️ MindAR stop 發生問題：",
            error
        );

    }


    // --------------------------------------------------------
    // 額外停止相機
    // --------------------------------------------------------

    try {

        const video =
            arContainer.querySelector(
                "video"
            );


        if (video) {

            if (
                video.srcObject
            ) {

                const tracks =
                    video.srcObject.getTracks();


                tracks.forEach(
                    (track) => {

                        track.stop();

                    }
                );

            }


            video.pause();

            video.srcObject =
                null;

        }

    } catch (error) {

        console.warn(
            "⚠️ 相機串流停止時發生問題：",
            error
        );

    }


    console.log(
        "✅ 相機已停止"
    );


    // --------------------------------------------------------
    // ★ 跳轉到羽球+1
    // --------------------------------------------------------

    window.location.href =
        BADMINTON_PLUS_URL;

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
// ★ Icon 按鈕
// ============================================================

const backButton =
    document.querySelector(
        "#back-button"
    );


if (backButton) {

    backButton.addEventListener(
        "click",
        exitAR
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
            "Goose Position：Below + Right"
        );

        console.log(
            "AR Object Scale：0.27"
        );

        console.log(
            "Back Icon：ON"
        );

        console.log(
            "================================"
        );

    }
);