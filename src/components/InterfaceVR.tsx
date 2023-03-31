import {useFrame, useLoader } from "@react-three/fiber";
import {Box, Text} from "@react-three/drei";
import React, {useEffect, useRef, useState} from "react";
import {UseAppContext} from "../AppContextProvider";
import {i, pins, speeds} from "./Interface";
import * as THREE from "three";
import {Interactive} from "@react-three/xr";
import {fontUrl} from "./Pin";

const notFound = "/not-found.jpg";

const ImageTexture = ({imgTextureUrl} : {imgTextureUrl: string}) => {
    const loader = new THREE.TextureLoader();
    const imgTexture = loader.load(imgTextureUrl);

    return imgTexture ? <mesh position={[-0.95, 1.9, 0]}>
        <planeBufferGeometry attach="geometry" args={[0.75,0.5,1,1]} />
        <meshToonMaterial attach="material"
                           map={imgTexture}/>
    </mesh> : null;
}

const VrButton = ({onSelect, position = [0,2.2,0], text, width = 0.3, fontSize = 0.16} :
                      {onSelect: any, position?: any, text?: string, width? : number, fontSize? : number}) => {
    const [hover, setHover] = useState(false)

    let buttonText = text || "Start Journey";

    return <Interactive onSelect={onSelect}
                              onHover={() => setHover(true)}
                              onBlur={() => setHover(false)}>
        <Box scale={[1, 1, 1]} args={text ? [width,0.3,0.3] : [1,0.3,0.3]} position={position}>
            <meshPhongMaterial attach="material"
                               color={hover ? "#2c8677" : "#205E56"}/>
            <Text position={[0, -0.05, 0.2]} fontSize={text ? fontSize : 0.08}
                  font={fontUrl}
                  color="#fff" anchorX="center" anchorY="middle">
                {buttonText}
            </Text>
        </Box>
    </Interactive>
}

function InterfaceVR( ) {

    const { updatePointer, dataItems: { dataItems },
        planetVR: {planetVR, setPlanetVR},
        currentPointer: {currentPointer},
        autoRotateIndex: {
            autoRotateIndex, setAutoRotateIndex
        },
        pinQty: {
            pinQty, setPinQty
        },
    } = UseAppContext();

    const [imgTextureUrl, setImageTextureUrl] = useState(notFound);

    const pointerInfo = dataItems[currentPointer];

    const ref = useRef(null!);

    useFrame((state) => {
        const pos = state.camera.position;
        ref.current.lookAt(state.camera.position)
    });

    useEffect(()=>{
        if(pointerInfo){
            setImageTextureUrl(pointerInfo[i.img]);
        }
    }, [currentPointer])

    const toogler = (value: number, set: (n: number) => void) => {
        let next = value + 1;
        if(next >= 3){
            next = 0;
        }
        set(next)
    }

    const vrpositioneraux = false;
    return (<mesh ref={ref}  position={[0, -0.8, -0.8]}>


        <mesh rotation={[0.5, 0, 0]} position={[0,0,-1.3]}>
        {pointerInfo ? <>
            <Text position={[-0.5, 2.2, 0]}
                  font={fontUrl}
                  anchorX="left" anchorY="top">
                {currentPointer + 1}. {pointerInfo[i.name]} {pointerInfo[i.type]}
            </Text>
            <Text position={[-0.5, 2, 0]} maxWidth={1.5}
                  fontSize={0.06}
                  anchorY="top" anchorX="left" textAlign="justify">
                {pointerInfo[i.description].replace(/\^/g, "")}
            </Text>
           <ImageTexture imgTextureUrl={imgTextureUrl}/>
            <VrButton onSelect={()=> updatePointer()}
                      text="<"
                      position={[-0.3,2.5, 0]}/>
            <VrButton onSelect={()=> updatePointer(true)}
                      text=">"
                      position={[0.3,2.5, 0]}/>
        </>
            :
            <VrButton onSelect={()=> updatePointer(true)}/>
        }


        <mesh position={[-0.6, 4, 0.2]} rotation={[1,0,0]}>
            {/* <VrButton onSelect={()=> {}}
                      position={[-1.1,0,0]}
                      text="Exit VR"
                      width={0.7}
                      fontSize={0.1}
            />*/}
            <VrButton onSelect={()=> toogler(autoRotateIndex, setAutoRotateIndex)}
                      position={[0,0,0]}
                      text={`Rot: ${speeds[autoRotateIndex]}`}
                      width={1}
                      fontSize={0.1}
            />
            <VrButton onSelect={()=> toogler(pinQty, setPinQty)}
                      position={[1.1,0,0]}
                      text={`Pins: ${pins[pinQty]}`}
                      width={1}
                      fontSize={0.1}
            />
        </mesh>

            {vrpositioneraux && <mesh  position={[0, 2.7, -2.2]} rotation={[1,0,0]}>
            <VrButton onSelect={()=> {
                setPlanetVR((oldVr:any) => [oldVr[0], oldVr[1] + 0.1, oldVr[2]]);
            }}
                      text="y+"
                      position={[-1,1.8, 0]}/>
            <VrButton onSelect={()=> {
                setPlanetVR((oldVr:any) => [oldVr[0], oldVr[1] - 0.1, oldVr[2]]);
            }}
                      text="y-"
                      position={[-0.5,1.8, 0]}/>
            <VrButton onSelect={()=> {
                setPlanetVR((oldVr:any) => [oldVr[0], oldVr[1], oldVr[2] + 0.2]);
            }}
                      text="z+"
                      position={[0,1.8, 0]}/>
            <VrButton onSelect={()=> {
                setPlanetVR((oldVr:any) => [oldVr[0], oldVr[1], oldVr[2] - 0.2]);
            }}
                      text="z-"
                      position={[0.5,1.8, 0]}/>
            <Text position={[0, 2, 1.2]}>
                {JSON.stringify(planetVR)}
            </Text>
        </mesh>}
        </mesh>
    </mesh>)
}
export default InterfaceVR;