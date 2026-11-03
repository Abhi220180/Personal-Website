import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

class NodeFileReader {
  result = null;
  onloadend = null;

  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      queueMicrotask(() => this.onloadend?.());
    });
  }

  readAsDataURL(blob) {
    blob.arrayBuffer().then((buffer) => {
      const base64 = Buffer.from(buffer).toString("base64");
      this.result = `data:${blob.type || "application/octet-stream"};base64,${base64}`;
      queueMicrotask(() => this.onloadend?.());
    });
  }
}

globalThis.FileReader = NodeFileReader;

const modelDirectory = resolve("public/models");

function materialPair(color, sideColor = color, metalness = 0.18) {
  return [
    new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness }),
    new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.42, metalness: metalness + 0.08 })
  ];
}

function shapeFromPoints(points) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index += 1) {
    shape.lineTo(points[index][0], points[index][1]);
  }
  shape.closePath();
  return shape;
}

function circleShape(radius, x = 0, y = 0) {
  const shape = new THREE.Shape();
  shape.absarc(x, y, radius, 0, Math.PI * 2, false);
  return shape;
}

function ringShape(outerRadius, innerRadius, x = 0, y = 0) {
  const shape = circleShape(outerRadius, x, y);
  const hole = new THREE.Path();
  hole.absarc(x, y, innerRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

function extrude(name, shape, color, options = {}) {
  const depth = options.depth ?? 0.16;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: options.bevelEnabled ?? true,
    bevelSegments: 2,
    bevelSize: options.bevelSize ?? 0.018,
    bevelThickness: options.bevelThickness ?? 0.018,
    curveSegments: 14,
    steps: 1
  });
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(
    geometry,
    materialPair(color, options.sideColor ?? color, options.metalness ?? 0.18)
  );
  mesh.name = name;
  mesh.position.z = (options.z ?? 0) - depth / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createAmdModel() {
  const group = new THREE.Group();
  group.name = "AMD_Extruded_Mark";

  const upperArrow = shapeFromPoints([
    [-1.08, 1.08],
    [1.08, 1.08],
    [1.08, -1.08],
    [0.5, -0.5],
    [0.5, 0.5],
    [-0.5, 0.5]
  ]);
  const lowerArrow = shapeFromPoints([
    [-1.08, -0.18],
    [-0.5, 0.4],
    [-0.5, -0.5],
    [0.42, -0.5],
    [-0.18, -1.08],
    [-1.08, -1.08]
  ]);

  group.add(
    extrude("AMD_Upper_Arrow", upperArrow, "#080808", {
      depth: 0.22,
      sideColor: "#242424",
      bevelSize: 0.025,
      bevelThickness: 0.025,
      metalness: 0.28
    }),
    extrude("AMD_Lower_Arrow", lowerArrow, "#080808", {
      depth: 0.22,
      sideColor: "#242424",
      bevelSize: 0.025,
      bevelThickness: 0.025,
      metalness: 0.28
    })
  );

  return group;
}

function eyeShape(x, y, width, height) {
  const shape = new THREE.Shape();
  shape.moveTo(x - width / 2, y);
  shape.bezierCurveTo(x - width * 0.27, y + height / 2, x + width * 0.27, y + height / 2, x + width / 2, y);
  shape.bezierCurveTo(x + width * 0.27, y - height / 2, x - width * 0.27, y - height / 2, x - width / 2, y);
  shape.closePath();
  return shape;
}

function eyelidShape(x, y, width, thickness) {
  const shape = new THREE.Shape();
  shape.moveTo(x - width / 2, y);
  shape.bezierCurveTo(x - width * 0.24, y + 0.46, x + width * 0.24, y + 0.46, x + width / 2, y);
  shape.lineTo(x + width / 2, y - thickness);
  shape.bezierCurveTo(
    x + width * 0.24,
    y + 0.3,
    x - width * 0.24,
    y + 0.3,
    x - width / 2,
    y - thickness
  );
  shape.closePath();
  return shape;
}

function wingShape(x, y, direction) {
  const shape = new THREE.Shape();
  shape.moveTo(x, y + 0.2);
  shape.bezierCurveTo(x + direction * 0.55, y + 0.08, x + direction * 0.6, y - 0.48, x + direction * 0.26, y - 0.58);
  shape.bezierCurveTo(x + direction * 0.02, y - 0.66, x - direction * 0.08, y - 0.24, x, y + 0.2);
  shape.closePath();
  return shape;
}

function roundedCapsuleShape(x, y, width, height) {
  const radius = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x - radius, y + height / 2 - radius);
  shape.absarc(x, y + height / 2 - radius, radius, Math.PI, 0, true);
  shape.lineTo(x + radius, y - height / 2 + radius);
  shape.absarc(x, y - height / 2 + radius, radius, 0, Math.PI, true);
  shape.closePath();
  return shape;
}

function thinSegmentShape(x1, y1, x2, y2, width) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const px = (-dy / length) * width * 0.5;
  const py = (dx / length) * width * 0.5;
  return shapeFromPoints([
    [x1 + px, y1 + py],
    [x2 + px, y2 + py],
    [x2 - px, y2 - py],
    [x1 - px, y1 - py]
  ]);
}

function chamferedRectShape(width, height, chamfer, x = 0, y = 0) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  return shapeFromPoints([
    [x - halfWidth + chamfer, y + halfHeight],
    [x + halfWidth - chamfer, y + halfHeight],
    [x + halfWidth, y + halfHeight - chamfer],
    [x + halfWidth, y - halfHeight + chamfer],
    [x + halfWidth - chamfer, y - halfHeight],
    [x - halfWidth + chamfer, y - halfHeight],
    [x - halfWidth, y - halfHeight + chamfer],
    [x - halfWidth, y + halfHeight - chamfer]
  ]);
}

function arcBandShape(x, y, innerRadius, outerRadius, startAngle, endAngle) {
  const shape = new THREE.Shape();
  shape.absarc(x, y, outerRadius, startAngle, endAngle, false);
  shape.absarc(x, y, innerRadius, endAngle, startAngle, true);
  shape.closePath();
  return shape;
}

function boxMesh(name, size, position, color, options = {}) {
  const geometry = new THREE.BoxGeometry(size[0], size[1], size[2], 1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.38,
    metalness: options.metalness ?? 0.16,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    depthWrite: options.depthWrite ?? true
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function sideProfileSolid(name, shape, width, color, sideColor) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    curveSegments: 10,
    steps: 1
  });
  geometry.translate(0, 0, -width / 2);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, materialPair(color, sideColor, 0.18));
  mesh.name = name;
  mesh.rotation.x = Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinderAlongZ(name, radius, height, position, color, radialSegments = 16) {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments, 1, false);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color, roughness: 0.34, metalness: 0.24 })
  );
  mesh.name = name;
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  return mesh;
}

function createBeeMStripes() {
  const stripes = new THREE.Group();
  stripes.name = "IBM_Striped_M";
  const blue = "#627bd7";
  const left = 1.45;
  const right = 3.25;
  const top = 0.72;
  const stripeHeight = 0.115;
  const gap = 0.13;
  const stemWidth = 0.3;
  const center = (left + right) / 2;
  const fullHeight = 7 * (stripeHeight + gap) + stripeHeight;

  for (let row = 0; row < 8; row += 1) {
    const yTop = top - row * (stripeHeight + gap);
    const yBottom = yTop - stripeHeight;
    const yCenter = (yTop + yBottom) / 2;
    const progress = (top - yCenter) / fullHeight;
    const leftDiagonalCenter = THREE.MathUtils.lerp(left + stemWidth / 2, center, progress);
    const rightDiagonalCenter = THREE.MathUtils.lerp(right - stemWidth / 2, center, progress);

    const intervals = [
      [left, left + stemWidth],
      [leftDiagonalCenter - stemWidth / 2, leftDiagonalCenter + stemWidth / 2],
      [rightDiagonalCenter - stemWidth / 2, rightDiagonalCenter + stemWidth / 2],
      [right - stemWidth, right]
    ].sort((a, b) => a[0] - b[0]);

    const merged = [];
    for (const interval of intervals) {
      const previous = merged[merged.length - 1];
      if (previous && interval[0] <= previous[1] + 0.015) {
        previous[1] = Math.max(previous[1], interval[1]);
      } else {
        merged.push([...interval]);
      }
    }

    merged.forEach(([xStart, xEnd], segmentIndex) => {
      const segment = shapeFromPoints([
        [xStart, yTop],
        [xEnd, yTop],
        [xEnd, yBottom],
        [xStart, yBottom]
      ]);
      stripes.add(
        extrude(`IBM_M_Stripe_${row + 1}_${segmentIndex + 1}`, segment, blue, {
          depth: 0.15,
          sideColor: "#344993",
          bevelSize: 0.009,
          bevelThickness: 0.009
        })
      );
    });
  }

  return stripes;
}

function createIbmModel() {
  const group = new THREE.Group();
  group.name = "IBM_Eye_Bee_M_Extruded";

  const eyeX = -2.05;
  group.add(
    extrude("IBM_Eye_White", eyeShape(eyeX, -0.12, 1.72, 1.2), "#f8f8f5", {
      depth: 0.13,
      sideColor: "#c7c9cd"
    }),
    extrude("IBM_Eye_Iris", ringShape(0.47, 0.2, eyeX, -0.12), "#ad9273", {
      depth: 0.18,
      z: 0.05,
      sideColor: "#725d46"
    }),
    extrude("IBM_Eye_Pupil", circleShape(0.21, eyeX, -0.12), "#070707", {
      depth: 0.2,
      z: 0.1,
      sideColor: "#000000"
    }),
    extrude("IBM_Eye_Lid", eyelidShape(eyeX, 0.45, 1.58, 0.15), "#d55e3c", {
      depth: 0.18,
      z: 0.04,
      sideColor: "#8f3423"
    })
  );

  const beeX = 0.1;
  group.add(
    extrude("IBM_Bee_Left_Wing", wingShape(beeX - 0.42, -0.02, -1), "#42754c", {
      depth: 0.12,
      sideColor: "#284a2f"
    }),
    extrude("IBM_Bee_Right_Wing", wingShape(beeX + 0.42, -0.02, 1), "#42754c", {
      depth: 0.12,
      sideColor: "#284a2f"
    }),
    extrude("IBM_Bee_Body", roundedCapsuleShape(beeX, -0.05, 0.72, 1.5), "#e4a04e", {
      depth: 0.16,
      sideColor: "#9d6329",
      z: 0.03
    }),
    extrude("IBM_Bee_Left_Antenna", circleShape(0.17, beeX - 0.25, 0.9), "#ec9bad", {
      depth: 0.18,
      sideColor: "#a85167",
      z: 0.05
    }),
    extrude("IBM_Bee_Right_Antenna", circleShape(0.17, beeX + 0.25, 0.9), "#ec9bad", {
      depth: 0.18,
      sideColor: "#a85167",
      z: 0.05
    })
  );

  for (const [index, y] of [0.47, 0.08, -0.32].entries()) {
    group.add(
      extrude(
        `IBM_Bee_Black_Stripe_${index + 1}`,
        shapeFromPoints([
          [beeX - 0.38, y + 0.08],
          [beeX + 0.38, y + 0.08],
          [beeX + 0.38, y - 0.08],
          [beeX - 0.38, y - 0.08]
        ]),
        "#090909",
        { depth: 0.18, z: 0.1, sideColor: "#000000", bevelSize: 0.009, bevelThickness: 0.009 }
      )
    );
  }

  group.add(createBeeMStripes());
  group.position.x = -0.05;
  group.position.y = -0.02;
  group.scale.z = 2;
  return group;
}

function createWisconsinAutonomousModel() {
  const car = new THREE.Group();
  car.name = "Wisconsin_Autonomous_Standing_Car";
  const red = "#d60012";
  const white = "#f8f8f5";
  const black = "#080808";

  const carBody = new THREE.Shape();
  carBody.moveTo(-1.08, -0.2);
  carBody.bezierCurveTo(-1.08, 0.02, -0.96, 0.28, -0.74, 0.36);
  carBody.bezierCurveTo(-0.45, 0.53, -0.08, 0.55, 0.18, 0.47);
  carBody.lineTo(0.58, 0.25);
  carBody.bezierCurveTo(0.8, 0.2, 1.0, 0.1, 1.08, -0.07);
  carBody.lineTo(1.04, -0.34);
  carBody.lineTo(0.72, -0.4);
  carBody.lineTo(-0.78, -0.4);
  carBody.lineTo(-1.07, -0.31);
  carBody.closePath();

  car.add(
    extrude("WA_Car_Body", carBody, red, {
      depth: 0.46,
      sideColor: "#79000a",
      bevelSize: 0.04,
      bevelThickness: 0.04,
      metalness: 0.24
    }),
    extrude(
      "WA_Underside",
      shapeFromPoints([
        [-0.78, -0.42],
        [0.75, -0.42],
        [0.67, -0.49],
        [-0.68, -0.49]
      ]),
      black,
      { depth: 0.38, sideColor: "#202020", bevelSize: 0.012, bevelThickness: 0.012 }
    )
  );

  for (const [axleName, wheelX] of [
    ["Rear", -0.72],
    ["Front", 0.62]
  ]) {
    for (const [sideName, wheelZ] of [
      ["Left", -0.28],
      ["Right", 0.28]
    ]) {
      const wheel = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 20, 14),
        new THREE.MeshStandardMaterial({ color: white, roughness: 0.38, metalness: 0.08 })
      );
      wheel.name = `WA_${axleName}_${sideName}_Separate_Wheel`;
      wheel.position.set(wheelX, -0.34, wheelZ);
      wheel.scale.z = 0.23;
      wheel.castShadow = true;
      wheel.receiveShadow = true;
      car.add(wheel);
    }
  }

  const rearWindow = shapeFromPoints([
    [-0.6, 0.36],
    [-0.3, 0.46],
    [-0.13, 0.43],
    [-0.18, 0.14],
    [-0.55, 0.18]
  ]);
  const frontWindow = shapeFromPoints([
    [-0.07, 0.43],
    [0.17, 0.39],
    [0.51, 0.21],
    [-0.01, 0.15]
  ]);
  const headlight = shapeFromPoints([
    [0.82, 0.02],
    [1.04, -0.04],
    [0.99, -0.14],
    [0.76, -0.12]
  ]);
  const bumper = shapeFromPoints([
    [0.75, -0.26],
    [1.05, -0.24],
    [1.02, -0.34],
    [0.72, -0.35]
  ]);
  const tailLight = shapeFromPoints([
    [-1.04, 0.03],
    [-0.94, 0.09],
    [-0.91, -0.03],
    [-1.03, -0.08]
  ]);

  for (const [sideIndex, sideZ] of [0.27, -0.27].entries()) {
    const detailOptions = {
      depth: 0.055,
      z: sideZ,
      sideColor: "#aeb4bd",
      bevelSize: 0.006,
      bevelThickness: 0.006
    };
    car.add(
      extrude(`WA_Rear_Window_${sideIndex}`, rearWindow, black, {
        depth: 0.055,
        z: sideZ,
        sideColor: "#20262d"
      }),
      extrude(`WA_Front_Window_${sideIndex}`, frontWindow, black, {
        depth: 0.055,
        z: sideZ,
        sideColor: "#20262d"
      }),
      extrude(`WA_Headlight_${sideIndex}`, headlight, white, detailOptions),
      extrude(`WA_Front_Bumper_${sideIndex}`, bumper, white, detailOptions),
      extrude(`WA_Tail_Light_${sideIndex}`, tailLight, white, detailOptions)
    );

    const waLetters = new THREE.Group();
    waLetters.name = `WA_Letters_${sideIndex}`;
    waLetters.add(
      extrude(`WA_W_Left_${sideIndex}`, thinSegmentShape(-0.47, 0.03, -0.33, -0.23, 0.075), white, detailOptions),
      extrude(`WA_W_Middle_Left_${sideIndex}`, thinSegmentShape(-0.33, -0.23, -0.23, -0.05, 0.075), white, detailOptions),
      extrude(`WA_W_Middle_Right_${sideIndex}`, thinSegmentShape(-0.23, -0.05, -0.12, -0.25, 0.075), white, detailOptions),
      extrude(`WA_W_Right_${sideIndex}`, thinSegmentShape(-0.12, -0.25, 0.02, 0.0, 0.075), white, detailOptions),
      extrude(`WA_A_Left_${sideIndex}`, thinSegmentShape(0.02, -0.24, 0.18, 0.04, 0.075), white, detailOptions),
      extrude(`WA_A_Right_${sideIndex}`, thinSegmentShape(0.18, 0.04, 0.36, -0.23, 0.075), white, detailOptions),
      extrude(`WA_A_Bar_${sideIndex}`, thinSegmentShape(0.08, -0.13, 0.29, -0.13, 0.06), white, detailOptions)
    );
    if (sideZ < 0) {
      waLetters.scale.x = -1;
    }
    car.add(waLetters);
  }

  for (const [index, radii] of [
    [0.18, 0.22],
    [0.26, 0.3],
    [0.34, 0.38]
  ].entries()) {
    car.add(
      extrude(
        `WA_Sensor_Arc_${index + 1}`,
        arcBandShape(-0.12, 0.57, radii[0], radii[1], 0.18 * Math.PI, 0.82 * Math.PI),
        red,
        { depth: 0.4, sideColor: "#79000a", bevelSize: 0.004, bevelThickness: 0.004 }
      )
    );
  }

  car.position.y = 0.57;
  car.scale.z = 1.5;
  const standingCar = new THREE.Group();
  standingCar.name = "Wisconsin_Autonomous_Complete_Standing_Car";
  standingCar.rotation.x = Math.PI / 2;
  standingCar.add(car);
  return standingCar;
}

function createNovaModel() {
  const group = new THREE.Group();
  group.name = "NOVA_Complete_Autonomous_Vehicle";
  const bodyLight = "#e3e6e8";
  const bodyMid = "#bbc1c5";
  const bodyDark = "#25272a";
  const orange = "#e9721b";
  const orangeDark = "#7e320c";

  const bodyProfile = shapeFromPoints([
    [-1.12, 0.24],
    [-1.08, 0.52],
    [-0.62, 0.68],
    [-0.22, 0.98],
    [0.2, 0.92],
    [0.62, 0.72],
    [1.08, 0.56],
    [1.12, 0.24]
  ]);
  const upperPanel = shapeFromPoints([
    [-0.64, 0.63],
    [-0.2, 0.91],
    [0.18, 0.85],
    [0.52, 0.7],
    [0.14, 0.59],
    [-0.34, 0.61]
  ]);
  const rearWindowOutline = shapeFromPoints([
    [-0.56, 0.64],
    [-0.22, 0.89],
    [-0.05, 0.85],
    [-0.16, 0.63]
  ]);
  const rearWindowInset = shapeFromPoints([
    [-0.5, 0.66],
    [-0.2, 0.85],
    [-0.1, 0.82],
    [-0.19, 0.66]
  ]);
  const frontWindowOutline = shapeFromPoints([
    [0, 0.84],
    [0.18, 0.8],
    [0.48, 0.68],
    [0.08, 0.62]
  ]);
  const frontWindowInset = shapeFromPoints([
    [0.04, 0.8],
    [0.17, 0.77],
    [0.4, 0.68],
    [0.1, 0.65]
  ]);

  group.add(
    boxMesh("NOVA_Underbody", [2.15, 0.86, 0.18], [0, 0, 0.2], bodyDark, {
      roughness: 0.44,
      metalness: 0.28
    }),
    sideProfileSolid("NOVA_Main_Body", bodyProfile, 0.92, bodyLight, bodyMid),
    sideProfileSolid("NOVA_Upper_Panel", upperPanel, 0.78, "#f1f2f2", "#aeb4b8")
  );

  for (const x of [-0.72, 0.72]) {
    for (const y of [-0.52, 0.52]) {
      group.add(
        boxMesh(`NOVA_Transparent_Wheel_${x}_${y}`, [0.42, 0.2, 0.3], [x, y, 0.17], "#eda26d", {
          roughness: 0.22,
          metalness: 0.04,
          transparent: true,
          opacity: 0.18,
          depthWrite: false
        }),
        boxMesh(`NOVA_Transparent_Hub_${x}_${y}`, [0.24, 0.025, 0.15], [x, y * 1.12, 0.17], orangeDark, {
          roughness: 0.24,
          metalness: 0.04,
          transparent: true,
          opacity: 0.28,
          depthWrite: false
        })
      );
    }
  }

  for (const [sideIndex, sideY] of [0.49, -0.49].entries()) {
    const outward = sideY > 0 ? 1 : -1;
    const rearOutline = sideProfileSolid(`NOVA_Rear_Window_Black_Edge_${sideIndex}`, rearWindowOutline, 0.026, bodyDark, bodyDark);
    const rearInset = sideProfileSolid(`NOVA_Rear_Window_White_Face_${sideIndex}`, rearWindowInset, 0.026, "#ffffff", "#d9d8d8");
    const frontOutline = sideProfileSolid(`NOVA_Front_Window_Black_Edge_${sideIndex}`, frontWindowOutline, 0.026, bodyDark, bodyDark);
    const frontInset = sideProfileSolid(`NOVA_Front_Window_White_Face_${sideIndex}`, frontWindowInset, 0.026, "#ffffff", "#d9d8d8");
    rearOutline.position.y = sideY;
    frontOutline.position.y = sideY;
    rearInset.position.y = sideY + outward * 0.02;
    frontInset.position.y = sideY + outward * 0.02;
    group.add(rearOutline, rearInset, frontOutline, frontInset);
  }

  for (const [index, z] of [0.19, 0.28, 0.37].entries()) {
    group.add(
      boxMesh(`NOVA_Front_Bumper_${index}`, [0.1, 0.98 - index * 0.08, 0.045], [-1.14, 0, z], index === 1 ? bodyDark : bodyLight, {
        roughness: 0.42,
        metalness: 0.2
      })
    );
  }

  group.add(
    boxMesh("NOVA_Left_Side_Rail", [1.62, 0.055, 0.055], [0.05, 0.49, 0.46], bodyDark),
    boxMesh("NOVA_Right_Side_Rail", [1.62, 0.055, 0.055], [0.05, -0.49, 0.46], bodyDark),
    boxMesh("NOVA_Roof_Pad", [0.42, 0.38, 0.07], [-0.05, 0, 0.94], bodyMid, {
      roughness: 0.36,
      metalness: 0.22
    }),
    cylinderAlongZ("NOVA_Antenna_Mast", 0.035, 0.42, [-0.05, 0, 1.17], bodyDark, 12),
    cylinderAlongZ("NOVA_Antenna_Base", 0.16, 0.06, [-0.05, 0, 0.99], bodyDark, 16),
    cylinderAlongZ("NOVA_Sensor_Orb_Stem", 0.055, 0.18, [-0.05, 0, 1.39], bodyDark, 12)
  );

  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 20, 16),
    new THREE.MeshStandardMaterial({
      color: orange,
      emissive: "#6b2507",
      emissiveIntensity: 0.18,
      roughness: 0.28,
      metalness: 0.18
    })
  );
  orb.name = "NOVA_Orange_Sensor_Orb";
  orb.position.set(-0.05, 0, 1.54);
  group.add(orb);

  return group;
}

function createSiliconBadgersModel() {
  const group = new THREE.Group();
  group.name = "Silicon_Badgers_Chip_Emblem";
  const red = "#e0000b";
  const black = "#050505";

  for (let index = 0; index < 9; index += 1) {
    const offset = -0.82 + index * 0.205;
    const verticalPin = shapeFromPoints([
      [offset - 0.035, 1.1],
      [offset + 0.035, 1.1],
      [offset + 0.035, 1.34],
      [offset - 0.035, 1.34]
    ]);
    const bottomPin = shapeFromPoints([
      [offset - 0.035, -1.34],
      [offset + 0.035, -1.34],
      [offset + 0.035, -1.1],
      [offset - 0.035, -1.1]
    ]);
    group.add(
      extrude(`SB_Top_Pin_${index}`, verticalPin, red, { depth: 0.12, sideColor: "#730006" }),
      extrude(`SB_Bottom_Pin_${index}`, bottomPin, red, { depth: 0.12, sideColor: "#730006" })
    );
  }

  for (let index = 0; index < 7; index += 1) {
    const offset = -0.72 + index * 0.24;
    const leftPin = shapeFromPoints([
      [-1.34, offset - 0.035],
      [-1.1, offset - 0.035],
      [-1.1, offset + 0.035],
      [-1.34, offset + 0.035]
    ]);
    const rightPin = shapeFromPoints([
      [1.1, offset - 0.035],
      [1.34, offset - 0.035],
      [1.34, offset + 0.035],
      [1.1, offset + 0.035]
    ]);
    group.add(
      extrude(`SB_Left_Pin_${index}`, leftPin, red, { depth: 0.12, sideColor: "#730006" }),
      extrude(`SB_Right_Pin_${index}`, rightPin, red, { depth: 0.12, sideColor: "#730006" })
    );
  }

  group.add(
    extrude("SB_Chip_Body", chamferedRectShape(2.25, 2.25, 0.18), black, {
      depth: 0.22,
      sideColor: "#191919",
      bevelSize: 0.035,
      bevelThickness: 0.035,
      metalness: 0.32
    }),
    extrude("SB_Red_Border", chamferedRectShape(2.08, 2.08, 0.14), red, {
      depth: 0.08,
      z: 0.13,
      sideColor: "#730006"
    }),
    extrude("SB_Black_Inset", chamferedRectShape(1.91, 1.91, 0.1), black, {
      depth: 0.07,
      z: 0.18,
      sideColor: "#111111"
    })
  );

  const tracePairs = [
    [-0.94, -0.25, -0.74, -0.25],
    [-0.94, -0.48, -0.72, -0.4],
    [-0.94, -0.7, -0.7, -0.58],
    [0.94, -0.25, 0.74, -0.25],
    [0.94, -0.48, 0.72, -0.4],
    [0.94, -0.7, 0.7, -0.58]
  ];
  tracePairs.forEach(([x1, y1, x2, y2], index) => {
    group.add(
      extrude(`SB_Circuit_Trace_${index}`, thinSegmentShape(x1, y1, x2, y2, 0.035), red, {
        depth: 0.06,
        z: 0.2,
        sideColor: "#730006",
        bevelSize: 0.002,
        bevelThickness: 0.002
      }),
      extrude(`SB_Circuit_Node_${index}`, circleShape(0.045, x1, y1), red, {
        depth: 0.06,
        z: 0.2,
        sideColor: "#730006",
        bevelSize: 0.002,
        bevelThickness: 0.002
      })
    );
  });

  return group;
}

async function exportGlb(object, filename) {
  object.updateMatrixWorld(true);
  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(object, {
    binary: true,
    onlyVisible: true,
    truncateDrawRange: true
  });
  await writeFile(resolve(modelDirectory, filename), Buffer.from(result));
}

await exportGlb(createAmdModel(), "amd-logo-black.glb");
await exportGlb(createIbmModel(), "ibm-eye-bee-m-v3.glb");
await exportGlb(createWisconsinAutonomousModel(), "wisconsin-autonomous-car-v5.glb");
await exportGlb(createNovaModel(), "nova-vehicle-v2.glb");
await exportGlb(createSiliconBadgersModel(), "silicon-badgers-chip-v3.glb");

console.log("Generated AMD, IBM, Wisconsin Autonomous, NOVA, and Silicon Badgers GLB assets");
