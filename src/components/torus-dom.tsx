"use dom";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ShaderScene({
  style,
  speed,
}: {
  style?: React.CSSProperties;
  dom?: import("expo/dom").DOMProps;
  speed?: number;
}) {
  const mountRef = useRef(null);
  const uniformsRef = useRef({});

  useEffect(() => {
    const uniforms = uniformsRef.current;
    if (uniforms?.speed) {
      uniforms.speed.value = speed;
      uniforms.direction.value = speed > 0 ? -1.0 : 1.0;
    }
  }, [speed]);

  useEffect(() => {
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      iTime: { value: 0 },
      iResolution: {
        value: new THREE.Vector2(
          window.innerWidth * window.devicePixelRatio,
          window.innerHeight * window.devicePixelRatio
        ),
      },
      speed: { value: 0.5 },
      direction: { value: -1.0 },
      colorTint: { value: new THREE.Vector3(6, 6, 6) },
      paletteShift: { value: 0.0 },
      sphereSize: { value: 1.2 },
      positionOffset: { value: new THREE.Vector3(-2.0, -2.0, 0) },
      //   positionOffset: { value: new THREE.Vector3(-1.8, 0, 0) },
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,
      // Based on https://www.shadertoy.com/view/WdB3Dw
      fragmentShader: `
                                uniform vec2 iResolution;
                                uniform float iTime;
                                uniform float speed;
                                uniform float direction;
                                uniform vec3 colorTint;
                                uniform float paletteShift;
                                uniform float sphereSize;
                                uniform vec3 positionOffset;
                                varying vec2 vUv;

                                #define PI 3.14159265359

                                void pR(inout vec2 p, float a) {
                                        p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
                                }

                                float smax(float a, float b, float r) {
                                        vec2 u = max(vec2(r + a, r + b), vec2(0.0));
                                        return min(-r, max(a, b)) + length(u);
                                }

                                vec3 pal(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
                                        return a + b*cos(6.28318*(c*t+d));
                                }

                                vec3 spectrum(float n) {
                                        return pal(n + paletteShift, vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5), vec3(1.0,1.0,1.0), vec3(0.0,0.33,0.67));
                                }

                                vec4 inverseStereographic(vec3 p, out float k) {
                                        k = 2.0/(1.0+dot(p,p));
                                        return vec4(k*p, k-1.0);
                                }

                                float fTorus(vec4 p4) {
                                        float d1 = length(p4.xy) / length(p4.zw) - 1.0;
                                        float d2 = length(p4.zw) / length(p4.xy) - 1.0;
                                        float d = d1 < 0.0 ? -d1 : d2;
                                        d /= PI;
                                        return d;
                                }

                                float fixDistance(float d, float k) {
                                        float sn = sign(d);
                                        d = abs(d);
                                        d = d / k * 1.82;
                                        d += 1.0;
                                        d = pow(d, 0.5);
                                        d -= 1.0;
                                        d *= 5.0/3.0;
                                        d *= sn;
                                        return d;
                                }

                                float map(vec3 p, float time) {
                                        // Apply controls: reposition and scale the scene
                                        p = (p - positionOffset) / sphereSize;
                                        float k;
                                        vec4 p4 = inverseStereographic(p, k);
                                        pR(p4.zy, time * -PI / 2.0 * direction);
                                        pR(p4.xw, time * -PI / 2.0 * direction);
                                        float d = fTorus(p4);
                                        d = abs(d);
                                        d -= 0.2;
                                        d = fixDistance(d, k);
                                        d = smax(d, length(p) - 1.85, 0.2);
                                        return d;
                                }

                                mat3 calcLookAtMatrix(vec3 ro, vec3 ta, vec3 up) {
                                        vec3 ww = normalize(ta - ro);
                                        vec3 uu = normalize(cross(ww, up));
                                        vec3 vv = normalize(cross(uu, ww));
                                        return mat3(uu, vv, ww);
                                }

                                void main() {
                                        float time = mod(iTime * speed / 2.0, 1.0);
                                        vec3 camPos = vec3(1.8, 5.5, -5.5) * 1.75;
                                        vec3 camTar = vec3(0.0, 0.0, 0.0);
                                        vec3 camUp = vec3(-1.0, 0.0, -1.5);
                                        mat3 camMat = calcLookAtMatrix(camPos, camTar, camUp);
                                        // sphere size
                                        float focalLength = 2.0;
                                        vec2 p = (vUv * 2.0 - 1.0) * vec2(iResolution.x / iResolution.y, 1.0);

                                        vec3 rayDirection = normalize(camMat * vec3(p, focalLength));
                                        vec3 rayPosition = camPos;
                                        float rayLength = 0.0;
                                        float distance = 0.0;
                                        vec3 color = vec3(0.0);
                                        vec3 c;

                                        const float ITER = 82.0;
                                        const float FUDGE_FACTORR = 0.8;
                                        const float INTERSECTION_PRECISION = 0.001;
                                        const float MAX_DIST = 20.0;

                                        for (float i = 0.0; i < ITER; i++) {
                                                rayLength += max(INTERSECTION_PRECISION, abs(distance) * FUDGE_FACTORR);
                                                rayPosition = camPos + rayDirection * rayLength;
                                                distance = map(rayPosition, time);
                                                c = vec3(max(0.0, 0.01 - abs(distance)) * 0.5);
                                                c *= colorTint;
                                                c += vec3(0.6, 0.25, 0.7) * FUDGE_FACTORR / 160.0;
                                                c *= smoothstep(20.0, 7.0, length(rayPosition));
                                                float rl = smoothstep(MAX_DIST, 0.1, rayLength);
                                                c *= rl;
                                                c *= spectrum(rl * 6.0 - 0.6);
                                                color += c;
                                                if (rayLength > MAX_DIST) {
                                                        break;
                                                }
                                        }

                                        color = pow(color, vec3(1.0 / 1.8)) * 2.0;
                                        color = pow(color, vec3(2.0)) * 3.0;
                                        color = pow(color, vec3(1.0 / 2.2));
                                        
                                        float alpha = length(color);
                                        gl_FragColor = vec4(color, alpha);
                                }
                        `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.iResolution.value.set(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
      );
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={mountRef} style={{ ...style, width: "100vw", height: "100vh" }} />
  );
}
