const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = innerHeight;

class InputHandler {
    constructor(engine) {
        this.keys = [];
        this.engine = engine;

        window.addEventListener('keydown', (e) => {
            if ((e.key === 'ArrowUp'
                || e.key === 'ArrowDown'
                || e.key === 'ArrowRight'
                || e.key === 'ArrowLeft'
                || e.key === 'a'
                || e.key === 'd'
                || e.key === 'w'
                || e.key === 's'
            ) && this.keys.indexOf(e.key) === -1) {
                this.keys.push(e.key);
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.keys.indexOf(e.key) > -1) {
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });
    }
}

class Vect2 {
    constructor(x = 0, y = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.w = w;
    }
}

class Vect3 {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

class Triangle {
    constructor(points = Array.from({ length: 3 }).fill(new Vect3()), tex = Array.from({ length: 3 }).fill(new Vect2()), color = 0) {
        this.points = points;
        this.tex = tex;
        this.color = color;
    }
}

class Engine {
    constructor(ctx) {
        this.ctx = ctx;
        this.theta = 0;

        this.camera = { x: 0, y: 0, z: 0 };
        this.lookDir = { x: 0, y: 0, z: 0 };
        this.yaw = 0;

        this.meshCube = [

            // // SOUTH
            // new Triangle([new Vect3(0, 0, 0, 1), new Vect3(0, 1, 0, 1), new Vect3(1, 1, 0, 1)], [new Vect2(0, 1, 1), new Vect2(0, 0, 1), new Vect2(1, 0, 1)]),
            // new Triangle([new Vect3(0, 0, 0, 1), new Vect3(1, 1, 0, 1), new Vect3(1, 0, 0, 1)], [new Vect2(0, 1, 1), new Vect2(1, 0, 1), new Vect2(1, 1, 1)]),

            // // EAST   
            // new Triangle([new Vect3(1, 0, 0, 1), new Vect3(1, 1, 0, 1), new Vect3(1, 1, 1, 1)], [new Vect2(0, 1, 1), new Vect2(0, 0, 1), new Vect2(1, 0, 1)]),
            // new Triangle([new Vect3(1, 0, 0, 1), new Vect3(1, 1, 1, 1), new Vect3(1, 0, 1, 1)], [new Vect2(0, 1, 1), new Vect2(1, 0, 1), new Vect2(1, 1, 1)]),

            // // NORTH      
            // new Triangle([new Vect3(1, 0, 1, 1), new Vect3(1, 1, 1, 1), new Vect3(0, 1, 1, 1)], [new Vect2(0, 1, 1), new Vect2(0, 0, 1), new Vect2(1, 0, 1)]),
            // new Triangle([new Vect3(1, 0, 1, 1), new Vect3(0, 1, 1, 1), new Vect3(0, 0, 1, 1)], [new Vect2(0, 1, 1), new Vect2(1, 0, 1), new Vect2(1, 1, 1)]),

            // // WEST
            // new Triangle([new Vect3(0, 0, 1, 1), new Vect3(0, 1, 1, 1), new Vect3(0, 1, 0, 1)], [new Vect2(0, 1, 1), new Vect2(0, 0, 1), new Vect2(1, 0, 1)]),
            // new Triangle([new Vect3(0, 0, 1, 1), new Vect3(0, 1, 0, 1), new Vect3(0, 0, 0, 1)], [new Vect2(0, 1, 1), new Vect2(1, 0, 1), new Vect2(1, 1, 1)]),

            // // TOP
            // new Triangle([new Vect3(0, 1, 0, 1), new Vect3(0, 1, 1, 1), new Vect3(1, 1, 1, 1)], [new Vect2(0, 1, 1), new Vect2(0, 0, 1), new Vect2(1, 0, 1)]),
            // new Triangle([new Vect3(0, 1, 0, 1), new Vect3(1, 1, 1, 1), new Vect3(1, 1, 0, 1)], [new Vect2(0, 1, 1), new Vect2(1, 0, 1), new Vect2(1, 1, 1)]),

            // // BOTTOM   
            // new Triangle([new Vect3(1, 0, 1, 1), new Vect3(0, 0, 1, 1), new Vect3(0, 0, 0, 1)], [new Vect2(0, 1, 1), new Vect2(0, 0, 1), new Vect2(1, 0, 1)]),
            // new Triangle([new Vect3(1, 0, 1, 1), new Vect3(0, 0, 0, 1), new Vect3(1, 0, 0, 1)], [new Vect2(0, 1, 1), new Vect2(1, 0, 1), new Vect2(1, 1, 1)])
        ];

        this.input = new InputHandler(this);

        this.matrixProject = this.matrixMakeProjection(90, canvas.height / canvas.width, 0.1, 1000);

        // this.img = document.getElementById('image');

        this.loadFromObjectFile("mountains.obj");
    }

    loadFromObjectFile = async (file, hasTexture = false) => {
        try {
            const res = await fetch(file);
            const data = await res.text();

            let verts = [];
            let texs = [];

            const lines = data.split('\n');
            lines.forEach(line => {
                if (line.startsWith('v')) {
                    if (line[1] === 't') {
                        const s = line.split(' ');
                        texs.push(new Vect2(s[1], s[2]));
                    }
                    else {
                        const s = line.split(' ');
                        verts.push(new Vect3(s[1], s[2], s[3]));
                    }
                }

                if (!hasTexture) {
                    if (line.startsWith('f')) {
                        const s = line.split(' ');
                        this.meshCube.push(new Triangle([verts[s[1] - 1], verts[s[2] - 1], verts[s[3] - 1]]))
                    }
                }
                else {
                    if (line.startsWith('f')) {
                        const s = line.split(' ');
                        const s1 = s[1].split('/');
                        const s2 = s[2].split('/');
                        const s3 = s[3].split('/');
                        this.meshCube.push(new Triangle([verts[s1[0] - 1], verts[s2[0] - 1], verts[s3[0] - 1]], [texs[s1[1] - 1], texs[s2[1] - 1], texs[s3[1] - 1]]))
                    }
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    matrixMultiplyVector(m, i) {
        let vector = new Vect3();

        vector.x = i.x * m[0][0] + i.y * m[1][0] + i.z * m[2][0] + m[3][0];
        vector.y = i.x * m[0][1] + i.y * m[1][1] + i.z * m[2][1] + m[3][1];
        vector.z = i.x * m[0][2] + i.y * m[1][2] + i.z * m[2][2] + m[3][2];
        vector.w = i.x * m[0][3] + i.y * m[1][3] + i.z * m[2][3] + m[3][3];

        return vector;
    }

    matrixMakeIdentity() {
        let matrix = Array.from({ length: 4 }, () => Array.from({ length: 4 }).fill(0));

        matrix[0][0] = 1;
        matrix[1][1] = 1;
        matrix[2][2] = 1;
        matrix[3][3] = 1;

        return matrix;
    }

    matrixMakeRotaionX(angle) {
        let matrix = Array.from({ length: 4 }, () => Array.from({ length: 4 }).fill(0));

        matrix[0][0] = 1;
        matrix[1][1] = Math.cos(angle);
        matrix[1][2] = Math.sin(angle);
        matrix[2][1] = -Math.sin(angle);
        matrix[2][2] = Math.cos(angle);
        matrix[3][3] = 1;

        return matrix;
    }

    matrixMakeRotaionY(angle) {
        let matrix = Array.from({ length: 4 }, () => Array.from({ length: 4 }).fill(0));

        matrix[0][0] = Math.cos(angle);
        matrix[0][2] = Math.sin(angle);
        matrix[2][0] = -Math.sin(angle);
        matrix[1][1] = 1;
        matrix[2][2] = Math.cos(angle);
        matrix[3][3] = 1;

        return matrix;
    }

    matrixMakeRotaionZ(angle) {
        let matrix = Array.from({ length: 4 }, () => Array.from({ length: 4 }).fill(0));

        matrix[0][0] = Math.cos(angle);
        matrix[0][1] = Math.sin(angle);
        matrix[1][0] = -Math.sin(angle);
        matrix[1][1] = Math.cos(angle);
        matrix[2][2] = 1;
        matrix[3][3] = 1;

        return matrix;
    }

    matrixMakeTranslation(x, y, z) {
        let matrix = Array.from({ length: 4 }, () => Array.from({ length: 4 }).fill(0));

        matrix[0][0] = 1;
        matrix[1][1] = 1;
        matrix[2][2] = 1;
        matrix[3][3] = 1;
        matrix[3][0] = x;
        matrix[3][1] = y;
        matrix[3][2] = z;

        return matrix;
    }

    matrixMakeProjection(fov, aspectRatio, near, far) {
        let matrix = Array.from({ length: 4 }, () => Array.from({ length: 4 }).fill(0));

        const fovRad = 1 / Math.tan(fov * 0.5 / 180 * Math.PI);

        matrix[0][0] = aspectRatio * fovRad;
        matrix[1][1] = fovRad;
        matrix[2][2] = far / (far - near);
        matrix[3][2] = (-far * near) / (far - near);
        matrix[2][3] = 1;

        return matrix;
    }

    matrixMultiplyMatrix(m1, m2) {
        let matrix = Array.from({ length: 4 }, () => Array.from({ length: 4 }).fill(0));

        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
                matrix[r][c] = m1[r][0] * m2[0][c] + m1[r][1] * m2[1][c] + m1[r][2] * m2[2][c] + m1[r][3] * m2[3][c];
            }
        }

        return matrix;
    }

    matrixPointAt(pos, target, up) {
        let newForward = this.vectorSub(target, pos);
        newForward = this.vectorNormalise(newForward);

        const a = this.vectorMul(newForward, this.vectorDotProduct(up, newForward));
        let newUp = this.vectorSub(up, a);
        newUp = this.vectorNormalise(newUp);

        const newRight = this.vectorCrossProduct(newUp, newForward);

        let matrix = Array.from({ length: 4 }, () => Array.from({ length: 4 }).fill(0));
        matrix[0][0] = newRight.x; matrix[0][1] = newRight.y; matrix[0][2] = newRight.z; matrix[0][3] = 0;
        matrix[1][0] = newUp.x; matrix[1][1] = newUp.y; matrix[1][2] = newUp.z; matrix[1][3] = 0;
        matrix[2][0] = newForward.x; matrix[2][1] = newForward.y; matrix[2][2] = newForward.z; matrix[2][3] = 0;
        matrix[3][0] = pos.x; matrix[3][1] = pos.y; matrix[3][2] = pos.z; matrix[3][3] = 1;

        return matrix;
    }

    matrixQuickInverse(m) {
        let matrix = Array.from({ length: 4 }, () => Array.from({ length: 4 }).fill(0));
        matrix[0][0] = m[0][0]; matrix[0][1] = m[1][0]; matrix[0][2] = m[2][0]; matrix[0][3] = 0;
        matrix[1][0] = m[0][1]; matrix[1][1] = m[1][1]; matrix[1][2] = m[2][1]; matrix[1][3] = 0;
        matrix[2][0] = m[0][2]; matrix[2][1] = m[1][2]; matrix[2][2] = m[2][2]; matrix[2][3] = 0;
        matrix[3][0] = -(m[3][0] * matrix[0][0] + m[3][1] * matrix[1][0] + m[3][2] * matrix[2][0]);
        matrix[3][1] = -(m[3][0] * matrix[0][1] + m[3][1] * matrix[1][1] + m[3][2] * matrix[2][1]);
        matrix[3][2] = -(m[3][0] * matrix[0][2] + m[3][1] * matrix[1][2] + m[3][2] * matrix[2][2]);
        matrix[3][3] = 1;

        return matrix;
    }

    vectorIntersectPlane(plane_p, plane_n, startLine, endLine, t) {
        plane_n = this.vectorNormalise(plane_n);
        const plane_d = -this.vectorDotProduct(plane_n, plane_p);
        const ad = this.vectorDotProduct(startLine, plane_n);
        const bd = this.vectorDotProduct(endLine, plane_n);
        t.value = (-plane_d - ad) / (bd - ad);
        const lineStartToEnd = this.vectorSub(endLine, startLine);
        const lineToIntersect = this.vectorMul(lineStartToEnd, t.value);
        return this.vectorAdd(startLine, lineToIntersect);
    }

    triangleClipAgainstPlane(plane_p, plane_n, in_tri) {
        plane_n = this.vectorNormalise(plane_n);

        const dist = (p) => this.vectorDotProduct(plane_n, p) - this.vectorDotProduct(plane_n, plane_p);

        const insidePoints = [];
        const outsidePoints = [];
        const insideTex = [];
        const outsideTex = [];

        // Compute distances and classify points
        [in_tri.points[0], in_tri.points[1], in_tri.points[2]].forEach((point, i) => {
            const d = dist(point);
            if (d >= 0) {
                insidePoints.push(point);
                insideTex.push(in_tri.tex[i]);
            } else {
                outsidePoints.push(point);
                outsideTex.push(in_tri.tex[i]);
            }
        });

        if (insidePoints.length === 0) return { n: 0, tris: [] };
        if (insidePoints.length === 3) return { n: 1, tris: [in_tri] };

        const interpolateTex = (t, texA, texB) => ({
            x: t * (texB.x - texA.x) + texA.x,
            y: t * (texB.y - texA.y) + texA.y,
            w: t * (texB.w - texA.w) + texA.w
        });

        const t = { value: 0 };

        if (insidePoints.length === 1 && outsidePoints.length === 2) {
            const out_tri1 = new Triangle();
            out_tri1.color = in_tri.color;

            out_tri1.points[0] = insidePoints[0];
            out_tri1.tex[0] = insideTex[0];

            out_tri1.points[1] = this.vectorIntersectPlane(plane_p, plane_n, insidePoints[0], outsidePoints[0], t);
            out_tri1.tex[1] = interpolateTex(t.value, insideTex[0], outsideTex[0]);

            out_tri1.points[2] = this.vectorIntersectPlane(plane_p, plane_n, insidePoints[0], outsidePoints[1], t);
            out_tri1.tex[2] = interpolateTex(t.value, insideTex[0], outsideTex[1]);

            return { n: 1, tris: [out_tri1] };
        }

        if (insidePoints.length === 2 && outsidePoints.length === 1) {
            const out_tri1 = new Triangle();
            const out_tri2 = new Triangle();
            out_tri1.color = in_tri.color;
            out_tri2.color = in_tri.color;

            out_tri1.points[0] = insidePoints[0];
            out_tri1.tex[0] = insideTex[0];
            out_tri1.points[1] = insidePoints[1];
            out_tri1.tex[1] = insideTex[1];

            out_tri1.points[2] = this.vectorIntersectPlane(plane_p, plane_n, insidePoints[0], outsidePoints[0], t);
            out_tri1.tex[2] = interpolateTex(t.value, insideTex[0], outsideTex[0]);

            out_tri2.points[0] = insidePoints[1];
            out_tri2.tex[0] = insideTex[1];
            out_tri2.points[1] = out_tri1.points[2];
            out_tri2.tex[1] = out_tri1.tex[2];

            out_tri2.points[2] = this.vectorIntersectPlane(plane_p, plane_n, insidePoints[1], outsidePoints[0], t);
            out_tri2.tex[2] = interpolateTex(t.value, insideTex[1], outsideTex[0]);

            return { n: 2, tris: [out_tri1, out_tri2] };
        }
    }

    vectorAdd(v1, v2) {
        return new Vect3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }

    vectorSub(v1, v2) {
        return new Vect3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }

    vectorMul(v1, k) {
        return new Vect3(v1.x * k, v1.y * k, v1.z * k);
    }

    vectorDiv(v1, k) {
        return new Vect3(v1.x / k, v1.y / k, v1.z / k);
    }

    vectorDotProduct(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    vectorLength(v) {
        return Math.sqrt(this.vectorDotProduct(v, v));
    }

    vectorNormalise(v) {
        const l = this.vectorLength(v);
        return new Vect3(v.x / l, v.y / l, v.z / l);
    }

    vectorCrossProduct(v1, v2) {
        let vector = new Vect3();
        vector.x = v1.y * v2.z - v1.z * v2.y;
        vector.y = v1.z * v2.x - v1.x * v2.z;
        vector.z = v1.x * v2.y - v1.y * v2.x;

        return vector;
    }

    drawTriangle(points, color, stroke) {
        const point1 = points[0];
        const point2 = points[1];
        const point3 = points[2];

        ctx.lineWidth = stroke;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(point1.x, point1.y);
        this.ctx.lineTo(point2.x, point2.y);
        this.ctx.moveTo(point2.x, point2.y);
        this.ctx.lineTo(point3.x, point3.y);
        this.ctx.moveTo(point3.x, point3.y);
        this.ctx.lineTo(point1.x, point1.y);
        this.ctx.stroke();
    }

    fillTriangle(points, color) {
        const point1 = points[0];
        const point2 = points[1];
        const point3 = points[2];

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(point1.x, point1.y);
        this.ctx.lineTo(point2.x, point2.y);
        this.ctx.lineTo(point3.x, point3.y);
        this.ctx.closePath();
        this.ctx.fill();
    }

    texturedTriangle(x1, y1, u1, v1, w1, x2, y2, u2, v2, w2, x3, y3, u3, v3, w3, img) {
        function swap(a, b) {
            return [b, a];
        }

        // Sort vertices by y-coordinate using a single sort function for clarity
        [[x1, y1, u1, v1, w1], [x2, y2, u2, v2, w2], [x3, y3, u3, v3, w3]] =
            [[x1, y1, u1, v1, w1], [x2, y2, u2, v2, w2], [x3, y3, u3, v3, w3]]
                .sort((a, b) => a[1] - b[1]);

        const dy1 = y2 - y1;
        const dy2 = y3 - y1;
        const dy3 = y3 - y2;

        const dx1 = x2 - x1;
        const dx2 = x3 - x1;
        const dx3 = x3 - x2;

        const du1 = u2 - u1;
        const dv1 = v2 - v1;
        const dw1 = w2 - w1;

        const du2 = u3 - u1;
        const dv2 = v3 - v1;
        const dw2 = w3 - w1;

        const du3 = u3 - u2;
        const dv3 = v3 - v2;
        const dw3 = w3 - w2;

        const daxStep = dy1 ? dx1 / dy1 : 0;
        const dbxStep = dy2 ? dx2 / dy2 : 0;

        const du1Step = dy1 ? du1 / dy1 : 0;
        const dv1Step = dy1 ? dv1 / dy1 : 0;
        const dw1Step = dy1 ? dw1 / dy1 : 0;

        const du2Step = dy2 ? du2 / dy2 : 0;
        const dv2Step = dy2 ? dv2 / dy2 : 0;
        const dw2Step = dy2 ? dw2 / dy2 : 0;

        const du3Step = dy3 ? du3 / dy3 : 0;
        const dv3Step = dy3 ? dv3 / dy3 : 0;
        const dw3Step = dy3 ? dw3 / dy3 : 0;

        function drawScanline(ax, bx, tex_su, tex_sv, tex_sw, tex_eu, tex_ev, tex_ew, y) {
            if (ax > bx) {
                [ax, bx] = swap(ax, bx);
                [tex_su, tex_eu] = swap(tex_su, tex_eu);
                [tex_sv, tex_ev] = swap(tex_sv, tex_ev);
                [tex_sw, tex_ew] = swap(tex_sw, tex_ew);
            }

            const tstep = 1 / (bx - ax);
            for (let j = ax, t = 0; j < bx; j++, t += tstep) {
                const tex_u = (1 - t) * tex_su + t * tex_eu;
                const tex_v = (1 - t) * tex_sv + t * tex_ev;
                const tex_w = (1 - t) * tex_sw + t * tex_ew;

                const sampleX = Math.floor((tex_u / tex_w) * img.width);
                const sampleY = Math.floor((tex_v / tex_w) * img.height);
                ctx.drawImage(img, sampleX, sampleY, 1, 1, j, y, 1, 1);
            }
        }

        for (let y = y1; y <= y2; y++) {
            const ax = x1 + (y - y1) * daxStep;
            const bx = x1 + (y - y1) * dbxStep;

            const tex_su = u1 + (y - y1) * du1Step;
            const tex_sv = v1 + (y - y1) * dv1Step;
            const tex_sw = w1 + (y - y1) * dw1Step;

            const tex_eu = u1 + (y - y1) * du2Step;
            const tex_ev = v1 + (y - y1) * dv2Step;
            const tex_ew = w1 + (y - y1) * dw2Step;

            drawScanline(ax, bx, tex_su, tex_sv, tex_sw, tex_eu, tex_ev, tex_ew, y);
        }

        const daxStepRevised = dy3 ? dx3 / dy3 : 0;

        for (let y = y2; y <= y3; y++) {
            const ax = x2 + (y - y2) * daxStepRevised;
            const bx = x1 + (y - y1) * dbxStep;

            const tex_su = u2 + (y - y2) * du3Step;
            const tex_sv = v2 + (y - y2) * dv3Step;
            const tex_sw = w2 + (y - y2) * dw3Step;

            const tex_eu = u1 + (y - y1) * du2Step;
            const tex_ev = v1 + (y - y1) * dv2Step;
            const tex_ew = w1 + (y - y1) * dw2Step;

            drawScanline(ax, bx, tex_su, tex_sv, tex_sw, tex_eu, tex_ev, tex_ew, y);
        }
    }

    draw() {
        const matrixRotateX = this.matrixMakeRotaionX(this.theta);
        const matrixRotateZ = this.matrixMakeRotaionZ(this.theta * 0.5);
        const translateMatrix = this.matrixMakeTranslation(0, 0, 8);

        let matrixWorld = this.matrixMakeIdentity();
        matrixWorld = this.matrixMultiplyMatrix(matrixRotateX, matrixRotateZ);
        matrixWorld = this.matrixMultiplyMatrix(matrixWorld, translateMatrix);

        const up = new Vect3(0, 1, 0);
        let target = new Vect3(0, 0, 1);
        const matCameraRotate = this.matrixMakeRotaionY(this.yaw);
        this.lookDir = this.matrixMultiplyVector(matCameraRotate, target);
        target = this.vectorAdd(this.camera, this.lookDir);

        const matCamera = this.matrixPointAt(this.camera, target, up);

        const matView = this.matrixQuickInverse(matCamera);

        this.meshCube.map(triangle => {
            let projectedTriangle = new Triangle();
            let transformedTriangle = new Triangle();
            let viewdTriangle = new Triangle();

            transformedTriangle.points[0] = this.matrixMultiplyVector(matrixWorld, triangle.points[0]);
            transformedTriangle.points[1] = this.matrixMultiplyVector(matrixWorld, triangle.points[1]);
            transformedTriangle.points[2] = this.matrixMultiplyVector(matrixWorld, triangle.points[2]);
            transformedTriangle.tex[0] = triangle.tex[0];
            transformedTriangle.tex[1] = triangle.tex[1];
            transformedTriangle.tex[2] = triangle.tex[2];

            const line1 = this.vectorSub(transformedTriangle.points[1], transformedTriangle.points[0]);
            const line2 = this.vectorSub(transformedTriangle.points[2], transformedTriangle.points[0]);

            let normal = this.vectorCrossProduct(line1, line2);
            normal = this.vectorNormalise(normal);

            const vCameraRay = this.vectorSub(transformedTriangle.points[0], this.camera);

            if (this.vectorDotProduct(normal, vCameraRay) < 0) {
                let light_direction = new Vect3(0, 1, -1);
                light_direction = this.vectorNormalise(light_direction);

                const dp = Math.max(0.1, this.vectorDotProduct(light_direction, normal));

                viewdTriangle.points[0] = this.matrixMultiplyVector(matView, transformedTriangle.points[0]);
                viewdTriangle.points[1] = this.matrixMultiplyVector(matView, transformedTriangle.points[1]);
                viewdTriangle.points[2] = this.matrixMultiplyVector(matView, transformedTriangle.points[2]);
                viewdTriangle.tex[0] = transformedTriangle.tex[0];
                viewdTriangle.tex[1] = transformedTriangle.tex[1];
                viewdTriangle.tex[2] = transformedTriangle.tex[2];


                const clippedTriangle = this.triangleClipAgainstPlane(new Vect3(0, 0, 0.1), new Vect3(0, 0, 1), viewdTriangle);

                for (let i = 0; i < clippedTriangle.n; i++) {
                    projectedTriangle.points[0] = this.matrixMultiplyVector(this.matrixProject, clippedTriangle.tris[i].points[0]);
                    projectedTriangle.points[1] = this.matrixMultiplyVector(this.matrixProject, clippedTriangle.tris[i].points[1]);
                    projectedTriangle.points[2] = this.matrixMultiplyVector(this.matrixProject, clippedTriangle.tris[i].points[2]);
                    projectedTriangle.color = dp;

                    projectedTriangle.tex[0] = clippedTriangle.tris[i].tex[0];
                    projectedTriangle.tex[1] = clippedTriangle.tris[i].tex[1];
                    projectedTriangle.tex[2] = clippedTriangle.tris[i].tex[2];

                    // projectedTriangle.tex[0].x = projectedTriangle.tex[0].x / projectedTriangle.points[0].w;
                    // projectedTriangle.tex[1].x = projectedTriangle.tex[1].x / projectedTriangle.points[1].w;
                    // projectedTriangle.tex[2].x = projectedTriangle.tex[2].x / projectedTriangle.points[2].w;

                    // projectedTriangle.tex[0].y = projectedTriangle.tex[0].y / projectedTriangle.points[0].w;
                    // projectedTriangle.tex[1].y = projectedTriangle.tex[1].y / projectedTriangle.points[1].w;
                    // projectedTriangle.tex[2].y = projectedTriangle.tex[2].y / projectedTriangle.points[2].w;

                    // projectedTriangle.tex[0].w = 1 / projectedTriangle.points[0].w;
                    // projectedTriangle.tex[1].w = 1 / projectedTriangle.points[1].w;
                    // projectedTriangle.tex[2].w = 1 / projectedTriangle.points[2].w;

                    projectedTriangle.points[0] = this.vectorDiv(projectedTriangle.points[0], projectedTriangle.points[0].w);
                    projectedTriangle.points[1] = this.vectorDiv(projectedTriangle.points[1], projectedTriangle.points[1].w);
                    projectedTriangle.points[2] = this.vectorDiv(projectedTriangle.points[2], projectedTriangle.points[2].w);

                    projectedTriangle.points[0].x *= -1;
                    projectedTriangle.points[1].x *= -1;
                    projectedTriangle.points[2].x *= -1;
                    projectedTriangle.points[0].y *= -1;
                    projectedTriangle.points[1].y *= -1;
                    projectedTriangle.points[2].y *= -1;

                    const offsetView = new Vect3(1, 1, 0);
                    projectedTriangle.points[0] = this.vectorAdd(projectedTriangle.points[0], offsetView);
                    projectedTriangle.points[1] = this.vectorAdd(projectedTriangle.points[1], offsetView);
                    projectedTriangle.points[2] = this.vectorAdd(projectedTriangle.points[2], offsetView);

                    projectedTriangle.points[0].x *= 0.5 * canvas.width
                    projectedTriangle.points[0].y *= 0.5 * canvas.height
                    projectedTriangle.points[1].x *= 0.5 * canvas.width
                    projectedTriangle.points[1].y *= 0.5 * canvas.height
                    projectedTriangle.points[2].x *= 0.5 * canvas.width
                    projectedTriangle.points[2].y *= 0.5 * canvas.height

                }
            }

            return projectedTriangle;
        }).sort((a, b) => {
            let z1 = (a.points[0].z + a.points[1].z + a.points[2].z) / 3;
            let z2 = (b.points[0].z + b.points[1].z + b.points[2].z) / 3;

            return z2 - z1;
        }).forEach(tri => {

            const trianglesList = [];
            trianglesList.push(tri);
            let newTriangles = 1;

            let clipTriangles;
            for (let p = 0; p < 4; p++) {

                while (newTriangles > 0) {
                    const test = trianglesList.shift();
                    newTriangles--;

                    switch (p) {
                        case 0:
                            clipTriangles = this.triangleClipAgainstPlane({ x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, test);
                            break;
                        case 1:
                            clipTriangles = this.triangleClipAgainstPlane({ x: 0, y: canvas.height - 1, z: 0 }, { x: 0, y: -1, z: 0 }, test);
                            break;
                        case 2:
                            clipTriangles = this.triangleClipAgainstPlane({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, test);
                            break;
                        case 3:
                            clipTriangles = this.triangleClipAgainstPlane({ x: canvas.width - 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 }, test);
                            break;
                    }

                    for (let w = 0; w < clipTriangles.n; w++) {
                        trianglesList.push(clipTriangles.tris[w]);
                    }
                }
                newTriangles = trianglesList.length;
            }

            trianglesList.forEach(item => {
                this.fillTriangle(item.points, `hsl(0, 0%, ${(item.color) * 100}%)`);
                // this.texturedTriangle(
                //     item.points[0].x, item.points[0].y, item.tex[0].x, item.tex[0].y, item.tex[0].w,
                //     item.points[1].x, item.points[1].y, item.tex[1].x, item.tex[1].y, item.tex[1].w,
                //     item.points[2].x, item.points[2].y, item.tex[2].x, item.tex[2].y, item.tex[2].w,
                //     this.img
                // )
                this.drawTriangle(item.points, `hsl(0, 0%, ${(item.color) * 100}%)`, 1);
            })
        })
    }

    update(deltaTime) {
        // this.theta += deltaTime;

        const vForward = this.vectorMul(this.lookDir, 0.008 * deltaTime);

        if (this.input.keys.includes("ArrowUp")) this.camera.y += 0.008 * deltaTime;
        if (this.input.keys.includes("ArrowDown")) this.camera.y -= 0.008 * deltaTime;
        if (this.input.keys.includes("ArrowRight")) this.camera.x += 0.008 * deltaTime;
        if (this.input.keys.includes("ArrowLeft")) this.camera.x -= 0.008 * deltaTime;
        if (this.input.keys.includes("a")) this.yaw -= 0.002 * deltaTime;
        if (this.input.keys.includes("d")) this.yaw += 0.002 * deltaTime;
        if (this.input.keys.includes("w")) this.camera = this.vectorAdd(this.camera, vForward);
        if (this.input.keys.includes("s")) this.camera = this.vectorSub(this.camera, vForward);
    }
}

const engine = new Engine(ctx);

let lastTime = 1;
const animate = (timeStamp) => {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    engine.draw();
    engine.update(deltaTime);

    requestAnimationFrame(animate);
}
animate(0);