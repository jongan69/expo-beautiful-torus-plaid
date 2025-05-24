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
      iChannel0: {
        value: new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat)
      }, // dummy white texture
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,
      fragmentShader: `
        uniform vec2 iResolution;
        uniform float iTime;
        uniform sampler2D iChannel0;
        varying vec2 vUv;

        float field(in vec3 p,float s) {
          float strength = 7. + .03 * log(1.e-6 + fract(sin(iTime) * 4373.11));
          float accum = s/4.;
          float prev = 0.;
          float tw = 0.;
          for (int i = 0; i < 26; ++i) {
            float mag = dot(p, p);
            p = abs(p) / mag + vec3(-.5, -.4, -1.5);
            float w = exp(-float(i) / 7.);
            accum += w * exp(-strength * pow(abs(mag - prev), 2.2));
            tw += w;
            prev = mag;
          }
          return max(0., 5. * accum / tw - .7);
        }

        float field2(in vec3 p, float s) {
          float strength = 7. + .03 * log(1.e-6 + fract(sin(iTime) * 4373.11));
          float accum = s/4.;
          float prev = 0.;
          float tw = 0.;
          for (int i = 0; i < 18; ++i) {
            float mag = dot(p, p);
            p = abs(p) / mag + vec3(-.5, -.4, -1.5);
            float w = exp(-float(i) / 7.);
            accum += w * exp(-strength * pow(abs(mag - prev), 2.2));
            tw += w;
            prev = mag;
          }
          return max(0., 5. * accum / tw - .7);
        }

        vec3 nrand3( vec2 co )
        {
          vec3 a = fract( cos( co.x*8.3e-3 + co.y )*vec3(1.3e5, 4.7e5, 2.9e5) );
          vec3 b = fract( sin( co.x*0.3e-3 + co.y )*vec3(8.1e5, 1.0e5, 0.1e5) );
          vec3 c = mix(a, b, 0.5);
          return c;
        }

        void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          vec2 uv = 2. * fragCoord.xy / iResolution.xy - 1.;
          vec2 uvs = uv * iResolution.xy / max(iResolution.x, iResolution.y);
          vec3 p = vec3(uvs / 4., 0) + vec3(1., -1.3, 0.);
          p += .2 * vec3(sin(iTime / 16.), sin(iTime / 12.),  sin(iTime / 128.));
          
          float freqs[4];
          //Sound
          freqs[0] = texture2D( iChannel0, vec2( 0.01, 0.25 ) ).x;
          freqs[1] = texture2D( iChannel0, vec2( 0.07, 0.25 ) ).x;
          freqs[2] = texture2D( iChannel0, vec2( 0.15, 0.25 ) ).x;
          freqs[3] = texture2D( iChannel0, vec2( 0.30, 0.25 ) ).x;

          float t = field(p,freqs[2]);
          float v = (1. - exp((abs(uv.x) - 1.) * 6.)) * (1. - exp((abs(uv.y) - 1.) * 6.));
          
          //Second Layer
          vec3 p2 = vec3(uvs / (4.+sin(iTime*0.11)*0.2+0.2+sin(iTime*0.15)*0.3+0.4), 1.5) + vec3(2., -1.3, -1.);
          p2 += 0.25 * vec3(sin(iTime / 16.), sin(iTime / 12.),  sin(iTime / 128.));
          float t2 = field2(p2,freqs[3]);
          vec4 c2 = mix(.4, 1., v) * vec4(1.3 * t2 * t2 * t2 ,1.8  * t2 * t2 , t2* freqs[0], t2);
          
          //Let's add some stars
          vec2 seed = p.xy * 2.0;  
          seed = floor(seed * iResolution.x);
          vec3 rnd = nrand3( seed );
          vec4 starcolor = vec4(pow(rnd.y,40.0));
          
          //Second Layer
          vec2 seed2 = p2.xy * 2.0;
          seed2 = floor(seed2 * iResolution.x);
          vec3 rnd2 = nrand3( seed2 );
          starcolor += vec4(pow(rnd2.y,40.0));
          
          fragColor = mix(freqs[3]-.3, 1., v) * vec4(1.5*freqs[2] * t * t* t , 1.2*freqs[1] * t * t, freqs[3]*t, 1.0)+c2+starcolor;
        }

        void main() {
          vec4 color = vec4(0.0);
          mainImage(color, gl_FragCoord.xy);
          gl_FragColor = color;
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
