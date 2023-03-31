import React, {createContext, useContext, useState} from 'react';

const AppContext = createContext(undefined);

export const UseAppContext = () => {
    return useContext(AppContext);
};

function AppContextProvider(props: any) {

    const yModifierVertical = 0.35;
    const autoRotateSpeeds = [0, 0.05, 0.3];
    const [autoRotateIndex, setAutoRotateIndex] = useState(1);
    const [pinQty, setPinQty] = useState(1);
    const [phi, setPhi] = useState(0);
    const [theta, setTheta] = useState(90);
    const [currentPointer, setCurrentPointer] = useState(-1);
    const [isXR, setIsXR] = useState(false);
    const [isVertical, setIsVertical] = useState(true);
    const [showPositioner, setShowPositioner] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const [dataItems, setDataItems] = useState([]);
    const [poses, setPoses] = useState([]);
    const [mapSrc, setMapSrc] = useState(null);
    const [xrHoveredIndex, setXrHoveredIndex] = useState(-1);
    const [isPlanetPositionSet, setIsPlanetPositionSet] = useState(false);
    const [isVRsupported, setIsVRsupported] = useState(false);
    const [isARsupported, setIsARsupported] = useState(false);
    const loadingCount = 3;
    const [loadingArray, setLoadingArray] = useState([]);
    const [planetVR, setPlanetVR] = useState([0,-1.2,-2.2]);

    const updatePointer = (isAdd : boolean = false) => {
        let overRidePointer = currentPointer + (isAdd ? 1 : -1);
        if(overRidePointer >= dataItems.length){
            overRidePointer = 0;
        } else if (overRidePointer < 0){
            overRidePointer = dataItems.length - 1;
        }
        setCurrentPointer(overRidePointer);
    }

    const AppContextObject = {
        yModifierVertical,
        autoRotateSpeeds,
        autoRotateIndex: {
            autoRotateIndex, setAutoRotateIndex
        },
        pinQty: {
            pinQty, setPinQty
        },
        currentPointer: {
            currentPointer, setCurrentPointer
        },
        isXR: {
            isXR, setIsXR
        },
        isVRsupported:{
            isVRsupported, setIsVRsupported
        },
        isARsupported:{
            isARsupported, setIsARsupported
        },
        isVertical: {
            isVertical, setIsVertical
        },
        showPositioner: {
            showPositioner, setShowPositioner
        },
        aboutOpen: {
            aboutOpen, setAboutOpen
        },
        dataItems: {
            dataItems, setDataItems
        },
        poses: {
            poses, setPoses
        },
        mapSrc: {
            mapSrc, setMapSrc
        },
        phi: {
            phi, setPhi
        },
        theta: {
            theta, setTheta
        },
        xrHoveredIndex: {
            xrHoveredIndex, setXrHoveredIndex
        },
        isPlanetPositionSet: {
            isPlanetPositionSet, setIsPlanetPositionSet
        },
        loadingCount: {
            loadingCount
        },
        loadingArray: {
            loadingArray, setLoadingArray
        },
        updatePointer,
        planetVR:{
            planetVR, setPlanetVR
        }
    };


    return <AppContext.Provider value={AppContextObject}>
        {props.children}
    </AppContext.Provider>
}


export default AppContextProvider;