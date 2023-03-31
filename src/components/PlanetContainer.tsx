import {Canvas, Matrix4} from "@react-three/fiber";
import {Controllers, Hands, useHitTest, XR} from "@react-three/xr";
import React, {Suspense, useEffect, useRef} from "react";
import Planet from "./Planet";
import Interface from "./Interface";
import {UseAppContext} from "../AppContextProvider";
import {Circle, Stars} from "@react-three/drei";
import InterfaceVR from "./InterfaceVR";

const PlanetContent = () => {

    const {
        isXR: { isXR,  },
        isVRsupported: {isVRsupported},
        isVertical: {
            isVertical,
        },
    } = UseAppContext();

    return <mesh scale={isXR ? 0.4 : (isVertical ? 1.8 : 2.5)}>
        <Planet />
        {!isVRsupported &&
        <Circle args={[0.7, 23, 23]} rotation={[-Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="black" transparent opacity={0.2}/>
        </Circle>}
    </mesh>
}

const PlanetWithoutHitTest = () => {

    const ref = useRef(null!);

    return (
        <mesh ref={ref}>
            <PlanetContent />
        </mesh>
    );
};
const PlanetHitTest = () => {

    const {
        isPlanetPositionSet: {isPlanetPositionSet}
    } = UseAppContext();

    const ref = useRef(null!);
    useHitTest((hitMatrix: Matrix4, hit: XRHitTestResult) => {
        if(!isPlanetPositionSet){
            // @ts-ignore
            hitMatrix.decompose(ref.current.position, ref.current.quaternion, ref.current.scale);
        }
    });

    return (
        <mesh ref={ref}>
            <PlanetContent />
        </mesh>
    );
};
function PlanetContainer(){

    const {
        isXR: { isXR, setIsXR },
        showPositioner: { showPositioner },
        aboutOpen: { aboutOpen },
        poses: { poses },
        phi: {
            phi, setPhi
        },
        theta: {
            theta, setTheta
        },
        isVertical: {
            isVertical, setIsVertical
        },
        isPlanetPositionSet: {isPlanetPositionSet},
        isVRsupported: {isVRsupported},
        loadingCount: {loadingCount},
        loadingArray: {loadingArray},
        planetVR: {planetVR, setPlanetVR}
    } = UseAppContext();

    useEffect(() => {
        const handleWindowResize = () => {
            const calc =  window.innerWidth / window.innerHeight;
            const max = 0.7;
            if(calc < max && !isVertical){
                setIsVertical(true);
            } else if(calc > max && isVertical){
                setIsVertical(false);
            }
        };


        const handlePhoneMove = () => {
            if(isXR && isPlanetPositionSet){

            }
        }

        window.addEventListener('resize', handleWindowResize);
        window.addEventListener('touchmove', handlePhoneMove);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
            window.removeEventListener('touchmove', handlePhoneMove);
            handleWindowResize();
        };
    });

    const vrpositioneraux = false;

    const isLoaded = loadingArray.length >= loadingCount;

    return <>

        {showPositioner &&  <div className="positioner-container">
            <input type="range" step={1} min={0} max={359} onChange={e => setPhi(parseFloat(e.target.value))} value={phi}/>
            <input className="second-range" type="range" step={1} min={0} max={180} onChange={e => setTheta(parseFloat(e.target.value))} value={theta}/>
            Copy coordinates:
            <br />
            <span>{phi}, {theta}</span>
        </div>}

        {vrpositioneraux && <div className="positioner-container">
            <input type="range" step={0.2} min={-5} max={1.6} onChange={e => {
                setPlanetVR((oldVr:any) => [oldVr[0], parseFloat(e.target.value), oldVr[2]]);
            }} value={planetVR[1]}/>
            <input type="range" step={1} min={-10} max={0} onChange={e => {
                setPlanetVR((oldVr:any) => [oldVr[0], oldVr[1], parseFloat(e.target.value)]);
            }} value={planetVR[2]}/>
            planetVR:
            <br />
            <span>{JSON.stringify(planetVR)}</span>
        </div>}

        <Interface />

        <div className="spinner-container"  style={{opacity: isLoaded ? 0 : 1}}>
            <div className="spinner" />
            <div className="spinner second" />
        </div>

        {isLoaded && !aboutOpen &&
            <Canvas style={{height: '100vh'}}>
                <XR referenceSpace="local"
                    onSessionStart={() => {
                        setIsXR(true)
                    }}
                    onSessionEnd={() => {
                        window.location.reload()
                    }}>
                    <Suspense fallback={<></>}>
                        {isVRsupported ? <>
                                <PlanetWithoutHitTest/>
                                <Controllers/>
                                <Hands/>
                                {isXR && <InterfaceVR/>}
                            </>
                            : <PlanetHitTest/>}

                        {(!isXR || isVRsupported) && <Stars count={2000} factor={isXR ? 1 : 8} fade={!isXR} speed={0}/>}
                    </Suspense>
                </XR>

                {!aboutOpen && false && <mesh scale={0.1} position={[4, 1, 1]}>
                    <sphereGeometry attach="geometry" args={[1, 24, 400]}/>
                    <meshStandardMaterial/>
                </mesh>}
            </Canvas>
        }
    </>
}

export default PlanetContainer;