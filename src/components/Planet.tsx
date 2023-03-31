import React, {useEffect, useRef, useState} from "react";
import {useFrame, useLoader, useThree} from "@react-three/fiber";
import {TextureLoader} from "three/src/loaders/TextureLoader";
import {BackSide, FrontSide, sRGBEncoding} from "three";
import * as THREE from "three";
import {Html, Text} from "@react-three/drei";
import LightsCameraAction from "./LightsCameraAction";
import Pin from "./Pin";
import { THREEx } from "../scripts/threex.atmospherematerial";
import {UseAppContext} from "../AppContextProvider";
import {DoubleSide} from "three/src/constants";

function Planet() {
    const {
        isXR: { isXR },
        autoRotateSpeeds,
        autoRotateIndex: { autoRotateIndex },
        pinQty: {  pinQty, },
        currentPointer: { currentPointer },
        poses: {  poses },
        mapSrc: { mapSrc  },
        phi: { phi },
        theta: {theta  },
        showPositioner: { showPositioner },
        isVertical: { isVertical },
        xrHoveredIndex: {
            xrHoveredIndex, setXrHoveredIndex
        },
        yModifierVertical,
        isPlanetPositionSet: { isPlanetPositionSet },
        isARsupported: { isARsupported },
        isVRsupported: { isVRsupported },
        planetVR: {planetVR},
    } = UseAppContext();

    const {camera, gl, raycaster, scene} = useThree();

    const useTexture = (src: string) => {
        const newTexture = useLoader(TextureLoader, src)
        newTexture.encoding = sRGBEncoding;
        return newTexture;
    }

    const texture = useTexture("/back002.jpg");
    const textureHeight = useTexture("/height.jpg");
    const textureSpecular = useTexture("/specular.jpg");


    const mesh = useRef<THREE.Mesh>(null!)

    const [tags, setTags] = useState([])
    const [cameraRotateTo, setCameraRotateTo] = useState([]);
    const [lightStep, setLightStep] = useState(-80);



    useEffect(() => {


        setInterval(()=>{
            setLightStep(prev => prev + 0.25);
        }, 50);



        let center = new THREE.Vector2(0, 0);
        raycaster.setFromCamera(center, gl.xr.getCamera());

        const newTags: any[] = [];
        poses.forEach((pos: any) => {
            const pinRadius = 1.1;
            const newpos = new THREE.Vector3().setFromSphericalCoords(pinRadius, pos[1] * DEG2RAD, pos[0] * DEG2RAD);
            newTags.push(newpos);
        })
        setTags(newTags);

    }, []);


    useEffect(() => {
        if(currentPointer >= 0){
            if (isXR){
                //mesh.current.quaternion.copy(camera.quaternion)

                mesh.current.lookAt(camera.position)


                const getAngle = (num: number) => ((Math.PI * num) / 180)

                const y = getAngle(poses[currentPointer][1]);
                const angle = Math.PI/2 - y;
                mesh.current.rotateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), angle)
                mesh.current.rotateY(getAngle(poses[currentPointer][0]) * -1)

            } else {
                setCameraRotateTo(poses[currentPointer]);
            }
        }
    }, [currentPointer]);


    useFrame((state) => {
        if(isXR) {

            if (autoRotateIndex > 0) {
                mesh.current.rotateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), -(autoRotateSpeeds[autoRotateIndex] / 20))
            }

            if (isARsupported && !isVRsupported && isPlanetPositionSet && gl && raycaster && mesh?.current) {

                let center = new THREE.Vector2(0, 0);
                raycaster.setFromCamera(center, gl.xr.getCamera());

                const intersection = raycaster.intersectObject(mesh.current);

                const isHovered = intersection.length > 0;
                if (isHovered) {
                    const planet = intersection.find(interPlanet =>
                        interPlanet?.object.name.includes("planet"));
                    let indexFound = -1;
                    let pin1st;
                    if(planet){
                        pin1st = intersection.find(interPin => {
                            if(interPin?.object.visible){
                                const name = interPin?.object.name;
                                const found = name.includes("pin");
                                indexFound = parseInt(name.split("pin")[1]);
                                return found;
                            }
                        });
                    }
                    if (pin1st && pin1st.distance < planet?.distance && xrHoveredIndex !== indexFound) {
                        setXrHoveredIndex(indexFound)
                    } else if (!pin1st && xrHoveredIndex !== -1) {
                        setXrHoveredIndex(-1)
                    }
                }
            }
        }
    })

    const DEG2RAD =  THREE.MathUtils.DEG2RAD;


    const phi2 = phi * DEG2RAD
    const theta2 = theta * DEG2RAD
    const newPos2 = new THREE.Vector3().setFromSphericalCoords(0.99, theta2, phi2);



    const sphereGeo = (highQuality?: boolean) => {
        return <sphereGeometry attach="geometry" args={[1, highQuality ? 200 : 16, 400, Math.PI / 2]} />;
    }

    const planetPosition = new THREE.Vector3(0,isVertical ? yModifierVertical : 0,0);

    const glowMesh = (isInside?: boolean) => {
        const material = THREEx.createAtmosphereMaterial();
        // @ts-ignore
        material.uniforms.glowColor.value	= new THREE.Color(0x33BBFF )
        // @ts-ignore
        material.uniforms.coeficient.value	= isInside ? 0.3 : 0.3;
        // @ts-ignore
        material.uniforms.power.value		=  isInside ? 1 : 3.8;

        return   <mesh
            scale={1.1}
            position={planetPosition}>
            {sphereGeo()}
            <shaderMaterial attach="material" {...material}
                            side={isInside ? FrontSide : BackSide} />
        </mesh>
    }

    return (<>

            <LightsCameraAction
                isVertical={isVertical}
                cameraRotateTo={cameraRotateTo}
                                lightStep={lightStep} />

            {!isXR && glowMesh()}

            <mesh
                name="planet"
                ref={mesh}
                scale={1}
                position={isXR ? (isVRsupported ? planetVR : [0, 1.3, 0]) : planetPosition}>
                {sphereGeo(true)}
                <meshPhongMaterial map={texture} side={DoubleSide}
                                   specularMap={textureSpecular}
                                   shininess={400}
                                   emissive={0.5}
                                   displacementScale={0.06}
                                   displacementMap={textureHeight} />

                {showPositioner && <Html distanceFactor={1}
                                         transform
                                         center
                                         position={newPos2}
                                         onUpdate={self => self.lookAt(0, 0, 0)} >

                    <div className="crosshair">       {phi}, {theta}</div>
                </Html>}

                {tags.map((tag, i) =>{
                    let showPin = false;
                    switch (pinQty){
                        case 1:
                            showPin = (currentPointer < 3 && i < 3)
                                || (i > currentPointer - 3 && i < currentPointer +2);
                            break;
                        case 2:
                            showPin = true;
                            break;
                    }
                    return <Pin
                                gl={gl}
                                raycaster={raycaster}
                                camera={camera}
                                showPin={showPin}
                                key={'pin-' + i}
                                index={i}
                                position={tag}
                    />
                })}
            </mesh>


        </>
    )
}

export default Planet;