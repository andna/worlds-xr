import React, {useEffect, useRef, useState} from "react";
import {CameraControls} from "../scripts/camera-controls";
import {useFrame} from "@react-three/fiber";
import * as THREE from "three";
import {UseAppContext} from "../AppContextProvider";

function LightsCameraAction({cameraRotateTo, lightStep, isVertical} :
                                {cameraRotateTo: number[], lightStep: number, isVertical: boolean}){
    const {
        autoRotateSpeeds,
        autoRotateIndex: { autoRotateIndex },
        isXR: { isXR },
        yModifierVertical
    } = UseAppContext();

    const cameraControls = useRef<CameraControls | null>(null);

    const [light, setLight] = useState({x: 0, y: 0});
    const [userDragging, setUserDragging] = useState(false);
    const [autoRotatingWhenRest, setAutoRotatingWhenRest] = useState(autoRotateIndex > 0);

    useEffect(() => {

        const camera = cameraControls.current;

        camera.addEventListener( 'controlstart', () => {
            camera.removeEventListener( 'rest', onRest );
            setUserDragging(true);
            setAutoRotatingWhenRest(false);

        } );

        camera.addEventListener( 'controlend', () => {

            if ( camera.active ) {
                camera.addEventListener( 'rest', onRest );
            } else {
                onRest();
            }
        } );

//
        camera.addEventListener( 'transitionstart', () => {
            if ( userDragging ) return;
            setAutoRotatingWhenRest(false);
            camera.addEventListener( 'rest', onRest );

        } );

    }, [])

    useEffect(()=> {

        try{
            const camera = cameraControls.current;
            camera.distance= isVertical ? 4 : 5;
            camera.minDistance= isVertical ? 2 : 3;
            camera.maxDistance= 6;
            camera.maxPolarAngle= isVertical ? 3 : 3;
            camera.minPolarAngle= isVertical ? 0.14 : 0.14;
            camera.truckSpeed=0;
            camera.polarAngle= 1.2;
            camera.setOrbitPoint(0,isVertical ? yModifierVertical : 0,0)

        } catch (e){
            console.log('Error', e)
        }

    }, [isVertical])

    const onRest = () => {

        setUserDragging(false);
        setAutoRotatingWhenRest(true);
        cameraControls.current.removeEventListener( 'rest', onRest );

    }


    const getAngle = (num: number) => ((Math.PI * num) / 180)
    const getRevAngle = (angle: number) => (angle * 180) / Math.PI;

    useEffect(()=>{
        const radius = 3, speed = 0.011;
        setLight({x: radius * Math.cos(speed * -lightStep), y: radius * Math.sin(speed * -lightStep)});
    }, [lightStep])

    useEffect(()=>{
        if(cameraRotateTo.length>1){
            cameraControls.current.rotateTo(getAngle(cameraRotateTo[0]), getAngle(cameraRotateTo[1]), true)
        }
    }, [cameraRotateTo])


    useFrame(() => {
        if(!isXR && autoRotatingWhenRest && autoRotateIndex > 0) {
            const speed = autoRotateSpeeds[autoRotateIndex];
            if(cameraControls.current){
                cameraControls.current.azimuthAngle = (cameraControls.current.azimuthAngle + (speed * THREE.MathUtils.DEG2RAD)) % (Math.PI * 2);
            }
        }
    })

    return <>

        <hemisphereLight
            position={isXR ? [0,10,0] : [light.x, 0, light.y]}
            color={"rgb(250,229,171)"}
                         groundColor={isXR || autoRotateIndex === 0 ? "rgb(229,215,238)" : "rgb(118,103,152)"}/>
        <directionalLight intensity={8}
                          position={isXR ? [0,10,0] : [light.x, 3, light.y]}
                          color={"rgb(215,170,147)"}/>


        {!isXR &&  <CameraControls ref={cameraControls} />}


    </>
}
export default LightsCameraAction;