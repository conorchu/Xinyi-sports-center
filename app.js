// ============================================================
// 信義運動中心 AR 導引
// MindAR + Three.js
// 保留：箭頭導引
// 移除：點點路線
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

import { MindARThree } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";

import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";


// ============================================================
// 基本設定
// ============================================================

// ⚠️ 如果你的檔案名稱不是 targets.mind
// 請改成你的實際檔名
const TARGET_FILE = "./targets.mind";


// ============================================================
// AR 初始化
// ============================================================

const mindarThree = new MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: TARGET_FILE,

    // 允許使用者比較容易重新尋找圖片
    maxTrack: 1,

    uiScanning: "yes",
    uiLoading: "yes"
});

const { renderer, scene, camera } = mindarThree;


// ============================================================
// Scene
// ============================================================

scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbbb, 3));


// ============================================================
// 建立箭頭
// ============================================================

let arrowGroup = null;


// 建立一個簡單的 3D 箭頭
function createArrow() {

    const group = new THREE.Group();

    // --------------------------------------------------------
    // 箭頭主體
    // --------------------------------------------------------

    const shaftGeometry = new THREE.BoxGeometry(
        0.12,
        0.12,
        0.7
    );

    const arrowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6600
    });

    const shaft = new THREE.Mesh(
        shaftGeometry,
        arrowMaterial
    );

    shaft.position.z = 0.25;

    group.add(shaft);


    // --------------------------------------------------------
    // 箭頭前端
    // --------------------------------------------------------

    const headGeometry = new THREE.ConeGeometry(
        0.25,
        0.45,
        4
    );

    const head = new THREE.Mesh(
        headGeometry,
        arrowMaterial
    );

    head.rotation.x = Math.PI / 2;

    head.position.z = -0.25;

    group.add(head);


    // --------------------------------------------------------
    // 整體大小
    // --------------------------------------------------------

    group.scale.set(
        0.8,
        0.8,
        0.8
    );


    return group;
}


// ============================================================
// 建立 5 個 Target 的 Anchor
// ============================================================

const anchors = [];

for (let i = 0; i < 5; i++) {

    const anchor = mindarThree.addAnchor(i);

    anchors.push(anchor);

    anchor.onTargetFound = () => {

        console.log(`Target ${i} 已辨識`);

        updateRoute(i);
    };

    anchor.onTargetLost = () => {

        console.log(`Target ${i} 暫時離開視野`);
    };
}


// ============================================================
// 路線設定
// ============================================================

function updateRoute(targetIndex) {

    const route = ROUTES[targetIndex];

    if (!route) {
        return;
    }


    // --------------------------------------------------------
    // 更新目前位置
    // --------------------------------------------------------

    const currentLocation =
        document.querySelector("#current-location");

    const instruction =
        document.querySelector("#instruction");


    currentLocation.textContent =
        route.location;


    instruction.textContent =
        route.instruction;


    // --------------------------------------------------------
    // 如果是最後一個 Target
    // --------------------------------------------------------

    if (route.arrived) {

        hideArrow();

        showArrival();

        return;
    }


    // --------------------------------------------------------
    // 顯示箭頭
    // --------------------------------------------------------

    hideArrival();

    showArrow(
        route.direction,
        route.rotation
    );
}


// ============================================================
// 顯示箭頭
// ============================================================

function showArrow(direction, rotation) {

    if (!arrowGroup) {

        arrowGroup = createArrow();

        scene.add(arrowGroup);
    }


    // --------------------------------------------------------
    // 箭頭方向
    // --------------------------------------------------------

    switch (direction) {

        case "forward":

            arrowGroup.rotation.set(
                0,
                0,
                0
            );

            break;


        case "left":

            arrowGroup.rotation.set(
                0,
                Math.PI / 2,
                0
            );

            break;


        case "right":

            arrowGroup.rotation.set(
                0,
                -Math.PI / 2,
                0
            );

            break;


        case "back":

            arrowGroup.rotation.set(
                0,
                Math.PI,
                0
            );

            break;
    }


    // 如果 route 有額外 rotation
    if (rotation !== undefined) {

        arrowGroup.rotation.y += rotation;
    }


    arrowGroup.visible = true;
}


// ============================================================
// 隱藏箭頭
// ============================================================

function hideArrow() {

    if (arrowGroup) {

        arrowGroup.visible = false;
    }
}


// ============================================================
// 抵達畫面
// ============================================================

function showArrival() {

    const arrival =
        document.querySelector("#arrival");

    arrival.classList.add("show");
}


function hideArrival() {

    const arrival =
        document.querySelector("#arrival");

    arrival.classList.remove("show");
}


// ============================================================
// 開始 AR
// ============================================================

async function startAR() {

    try {

        const startButton =
            document.querySelector("#start-button");

        const status =
            document.querySelector("#status");


        startButton.disabled = true;

        startButton.textContent =
            "正在開啟相機…";


        status.textContent =
            "正在啟動 AR";


        // 啟動 MindAR
        await mindarThree.start();


        // Renderer
        renderer.setAnimationLoop(() => {

            renderer.render(
                scene,
                camera
            );
        });


        status.textContent =
            "請對準場景圖片";


        startButton.style.display =
            "none";


    } catch (error) {

        console.error(
            "AR 啟動失敗：",
            error
        );


        const status =
            document.querySelector("#status");


        status.textContent =
            "無法開啟相機，請確認瀏覽器相機權限。";


        const startButton =
            document.querySelector("#start-button");


        startButton.disabled = false;

        startButton.textContent =
            "重新開啟 AR";
    }
}


// ============================================================
// 停止 AR
// ============================================================

async function stopAR() {

    try {

        await mindarThree.stop();

        renderer.setAnimationLoop(null);

    } catch (error) {

        console.error(
            "停止 AR 失敗：",
            error
        );
    }
}


// ============================================================
// 開始按鈕
// ============================================================

document
    .querySelector("#start-button")
    .addEventListener(
        "click",
        startAR
    );


// ============================================================
// 頁面載入完成
// ============================================================

window.addEventListener(
    "load",
    () => {

        console.log(
            "Xinyi Sports Center AR Ready"
        );

    }
);