import {Text} from "@react-three/drei";
import { Camera } from "@react-three/fiber";
import React, {useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {DoubleSide} from "three/src/constants";
import {Interactive} from "@react-three/xr";
import {UseAppContext} from "../AppContextProvider";

export const fontUrl = "https://rawcdn.githack.com/google/fonts/3b179b729ac3306ab2a249d848d94ff08b90a0af/apache/syncopate/Syncopate-Bold.ttf";

function Pin({index, gl, raycaster, showPin, camera, position} :
                 {gl: any, raycaster: any, index:number, showPin: boolean, camera: Camera, position: THREE.Vector3} ){

    const {
        isXR: { isXR },
        isVertical: { isVertical },
        currentPointer: {
            currentPointer, setCurrentPointer
        },
        xrHoveredIndex: { xrHoveredIndex },
        isVRsupported: {isVRsupported},
        pinQty: {pinQty},
        yModifierVertical
    } = UseAppContext();



    const [hovered, setHovered] = useState(false);
    const [isCurrent, setIsCurrent] = useState(false);

    useEffect(() => {
        setIsCurrent(currentPointer === index)
    }, [currentPointer])

    useEffect(() => {
       setHovered(xrHoveredIndex === index);
    }, [xrHoveredIndex])

    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto'
    }, [hovered])

    const ref = useRef(null);

    const notXRnorVertical = !isXR && !isVertical;
    const [isRotationSet, setIsRotationSet] = useState(false);


    return <mesh
        ref={ref}
        visible={showPin}
                       position={position}
                       onPointerOver={() => showPin && setHovered(true)}
                       onPointerOut={() => showPin && setHovered(false)}
                       onClick={() => showPin && setCurrentPointer(index)}
                       onUpdate={self => {
                           if(isXR){
                               if(!isRotationSet){
                                   self.lookAt(position.x * Math.PI, position.y * Math.PI + (isVRsupported ? 0 : yModifierVertical), position.z * Math.PI)
                                   setIsRotationSet(true);
                               }
                           } else {
                               if(isCurrent){
                                   self.lookAt(0, isVertical ? yModifierVertical : 0,0)
                               } else {
                                   self.quaternion.copy(camera.quaternion)
                               }
                           }
                       }} >

        {isCurrent ?  <mesh position={[0,0,0.02]}
                            scale={[0.1,0.1,0.1]}
                            rotation={[0, 0, 0]} >
                <torusGeometry args={[0.8, 0.02, 2, 40]}/>
                <meshStandardMaterial color="white" transparent opacity={0.8}/>
            </mesh>
            :
            (!isVRsupported || pinQty < 2) && <mesh position={[0,0,-0.25]}
                  scale={[0.1,0.1,0.1]}
                  rotation={[1.6, 0, 0]} >
                <cylinderGeometry args={[0.05, 0.05, 4, 3]}/>
                <meshStandardMaterial color="white" transparent opacity={0.8}/>
            </mesh>

        }
        <Interactive onHover={() =>  setHovered(true)}
                     onBlur={() =>  setHovered(false)}
                     onSelect={() => setCurrentPointer(index)}>
            <mesh name={'pin'+index}
                  visible={showPin}
                  position={[0, (isCurrent ? 0.075 : 0), isXR ? 0.022 : 0.002]}
                  rotation={[0, isCurrent && !isXR ? Math.PI : 0,0]}
                  scale={isCurrent ? 0.5 : 1}>
                <circleGeometry args={[notXRnorVertical ? 0.04 : 0.07, 20]} />
                <meshStandardMaterial color="white" transparent
                                      emissive={1}
                                      opacity={isCurrent || hovered ? 1 : 0.3}
                                      side={DoubleSide}/>
                <Text
                    font={fontUrl}
                    scale={[0.85, 1, 1]}
                    color={isCurrent ? 0x444444 : "white"}
                    letterSpacing={isCurrent ? 0 : -0.1}
                    outlineWidth={isCurrent ? 0 : notXRnorVertical ? 0.004 : 0.008}
                    outlineColor={0x111111}
                    depthOffset={-3}
                    fontSize={notXRnorVertical ? 0.04 : 0.08}
                >
                    {index + 1}
                </Text>
            </mesh>
        </Interactive>
    </mesh>
}

export default Pin;
