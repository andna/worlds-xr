import React, {useEffect, useRef, useState} from "react";
import {ARButton, VRButton} from "@react-three/xr";
import {UseAppContext} from "../AppContextProvider";

type overlayType = "none" | "menu" | "woxrld" | "info";

export const i = {
    id: 0,
    name: 1,
    type: 2,
    coordinates: 3,
    img: 4,
    link: 5,
    description: 6,
    descriptionMax_NOTUSABLE: 7,
}

export const speeds = ["None", "Slow", "Fast"];
export const pins = ["None", "Some", "All"];

function Interface (){

    const {
        isXR: { isXR },
        autoRotateIndex: {
            autoRotateIndex, setAutoRotateIndex
        },
        pinQty: {
            pinQty, setPinQty
        },
        aboutOpen: {
            aboutOpen, setAboutOpen
        },
        currentPointer: {
            currentPointer, setCurrentPointer
        },
        dataItems: { dataItems },
        xrHoveredIndex: { xrHoveredIndex },
        isPlanetPositionSet: {isPlanetPositionSet, setIsPlanetPositionSet},
        isVRsupported:{ isVRsupported, setIsVRsupported },
        isARsupported:{ isARsupported, setIsARsupported },
        loadingArray: {
            setLoadingArray
        },
        updatePointer
    } = UseAppContext();

    const pointerInfo = dataItems[currentPointer];

    const isARandPlacingPlanet = isXR && isARsupported && !isPlanetPositionSet;

    const [overlayOn, setOverlayOn ] = useState<overlayType>("none")
    const [firstJourney, setFirstJourney ] = useState(false)
    const [journeyStarted, setJourneyStarted ] = useState(false)
    const [abbColors, setAbbColors ] = useState<any>({})
    const [xrMessage, setXrMessage ] = useState<any>(null)
    const [loadedImages, setLoadedImages ] = useState<any>({})
    const [showXRUnsupport, setShowXRUnsupport ] = useState(false)

    useEffect(() => {
        const setXRs = (xCheck: any) => {
            if(navigator?.xr){
                navigator?.xr?.isSessionSupported( xCheck ).then( function ( supported ) {
                    if(supported){
                        xCheck === 'immersive-vr' ? setIsVRsupported(true) : setIsARsupported(true);
                    }
                    setLoadingArray((oldArray: any) => [...oldArray, xCheck]);
                } ).catch( e => console.log(e) );
            } else {
                setLoadingArray((oldArray: any) => [...oldArray, xCheck]);
            }

        }

        setXRs('immersive-vr');
        setXRs('immersive-ar');

        const handlePhoneMove = (e: any) => {
            if(isXR && isPlanetPositionSet){
                setXrMessage('You can\'t zoom in or drag rotate 🌐 when in AR mode.');
            }
        }

        window.addEventListener('touchmove', handlePhoneMove);
        return () => {
            window.removeEventListener('touchmove', handlePhoneMove);
        };


    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setXrMessage(null);
        }, 2000);
        return () => {
            clearInterval(interval);
        };
    }, [xrMessage]);
    useEffect(() => {
        if(currentPointer >= 0 && !journeyStarted){
            setJourneyStarted(true)
        }
    }, [currentPointer])

    useEffect(()=>{
        if(!firstJourney && dataItems.length > 0){
            setFirstJourney(true);
            setAutoRotateIndex(0);
            setOverlayOn("info")
        }
    }, [journeyStarted])



    const isMenuOn = overlayOn === 'menu';
    const isWoxrldOn = overlayOn === 'woxrld';
    const isInfoOn = overlayOn === 'info';

    const inputRange = (title: string, valueTitle: string, set: (n: number) => void, value: number, emojis: string[]) => {
        return  <div>
            <h4>{title}: <b>{valueTitle}</b></h4>
            <div className="emoji-container">
                {emojis.map((emoji, i) => <span
                    onClick={() => set(i)}
                    className={`emoji ${value === i && 'active'}`}
                    key={title+emoji}>
                {emoji}
            </span>)}
            </div>

        </div>
    }

    function useOutsideAlerter(ref: any) {
        useEffect(() => {

            function handleClickOutside(event: any) {
                if (ref.current && !ref.current.contains(event.target)) {
                    const currentIsActive = event.target.className.split(" ")
                        .some((clickedClass :string) => clickedClass === "active");
                    if(overlayOn !== 'info' && !currentIsActive){
                        setOverlayOn('none')
                    }
                }
            }

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref]);
    }

    function Overlay ({type}: {type: overlayType}) {
        const wrapperRef = useRef(null);
        useOutsideAlerter(wrapperRef);
        let inside = <div>{type}</div>;

        switch (type){
            case "menu":
                const menuLink = (setAbout: boolean, label: string) => {
                    return <p><a className={`menu-link
                        ${(setAbout ? aboutOpen : !aboutOpen) && 'menu-link-active'}`}
                                 onClick={()=> setAboutOpen(setAbout)}>
                        {label}
                    </a></p>
                }
                inside = <>
                    {false && menuLink(false, 'Home')}
                    {false && menuLink(true, 'About')}
                    {false && <p className="menu-disabled"><a>Add custom Woxrld <i>(Soon)</i></a></p>}
                    {!aboutOpen && <>
                        {inputRange('Auto Rotate', speeds[autoRotateIndex],
                            setAutoRotateIndex,
                            autoRotateIndex,
                            ['🛑','🐢', '🐇']
                        )}
                        {inputRange('Show Pins', pins[pinQty], setPinQty, pinQty,
                            ['🙈', '🙊', '🐵']
                        )}
                    </>}
                    <p className="credits"><i><small><small>
                        Woxrlds is a Three.js web made
                        by <a href="https://www.reddit.com/user/anddna42" target="_blank">
                            anddna42
                        </a>
                    </small></small></i></p>

                </>
                break;
            case "info":
                let descriptionWithAbbreviations = "";
                const foundAbb = pointerInfo[i.description].split("^") || "";
                const foundLenght = foundAbb.length;

                const abbreviations : any = {
                    SH: 'Straw Hats',
                    GM: 'Going Merry',
                    '1ot7W': '1 of the 7 Warlords of the Sea',
                    GL: 'Grand Line',
                    RM: 'Reverse Mountain',
                    RL: 'Red Line',
                    BW: 'Baroque Works',
                    BB: 'Blackbeard',
                    MA: 'Marine Admirals',
                    '1ot3MA': '1 of the 3 Marine Admirals',
                    '1ot3AW': '1 of the 3 Ancient Weapons',
                    WG: 'World Government',
                    AK: 'Ancient Kingdom',
                    TS: 'Thousand',
                    '11SN': '11 Supernovas',
                    '1ot11SN': '1 of the 11 Supernovas',
                    WN: 'World Noble',
                    '1ot4E': '1 of the 4 Emperors',
                    NW: 'New World',
                    RA: 'Revolutionary Army',
                    DrVP: 'Dr. Vegapunk',
                    FM: 'Fish-man',
                    '4RP': '4 Road Phonegylphs',
                    JB: 'Joyboy'
                };

                if(foundLenght > 1){
                    foundAbb.forEach((lineWith: string, index: number) => {
                        const inSpaces = lineWith.split(" ");
                        if(index < foundLenght - 1){
                            inSpaces.forEach((inSpace: string, index2: number) => {

                                if(index2 === inSpaces.length - 1){

                                    const inSpaceHasParent = inSpace.includes("(");
                                    const finalAbb = inSpace.replace("(","");
                                    const random = (min: number, max: number) => { // min and max included
                                        return Math.floor(Math.random() * (max - min + 1) + min)
                                    }
                                    if(!abbColors[finalAbb]){
                                        setAbbColors({...abbColors,
                                            [finalAbb] :
                                            `rgb(${random(120,200)},${random(120,200)},${random(120,200)})`
                                        })
                                    }
                                    descriptionWithAbbreviations += `
                                    ${inSpaceHasParent ? '(' : ''}<b 
                                        class="abbreviation"
                                        style="color: ${abbColors[finalAbb]}"
                                        title="${abbreviations[finalAbb]}"
                                        >${finalAbb}</b>`;
                                } else {
                                    descriptionWithAbbreviations += inSpace + " ";
                                }
                            })
                        } else {
                            descriptionWithAbbreviations += lineWith;
                        }
                    });
                } else {
                    descriptionWithAbbreviations = foundAbb[0];
                }
                const fullName = pointerInfo[i.name] + ' ' + pointerInfo[i.type];
                inside = <>
                    <div className="info-img-container">
                        <img
                            className={`${!loadedImages[currentPointer] && 'skeleton-loader'}`}
                            src={pointerInfo[i.img] ? pointerInfo[i.img] : "/not-found.jpg"} alt={fullName} onLoad={()=>{
                            const newLoaded = loadedImages;
                            newLoaded[currentPointer] = true;
                            setLoadedImages(newLoaded);
                        }}/>
                        <a href={pointerInfo[i.link]}
                           title={`Read more about ${fullName}`}
                           className="external-link"
                           target="_blank">
                            <img src="/external-link.svg" alt="external-link" />
                        </a>
                    </div>
                    {pointerInfo[i.description] && <p className="description"
                        dangerouslySetInnerHTML={{__html: descriptionWithAbbreviations}}
                    >
                    </p>}

                </>
                break;
            case "woxrld":
                const woxrldList = [
                    'One Piece', //selected
                    'Help wanted for:', //italic
                    'Planetos (Game of Thrones)',
                    'Arda (Lord of the Rings)',
                    'Arrakis (Dune)',
                    'Lots (Star Wars)',
                    'Mortal World (Avatar)',
                    'Pandora (Avatar)',
                    'Pokearth (Pokémon)',
                    'Nirn (The Elder Scrolls)',
                    'Earth 20XX (Fallout)',
                    'And coming soon:', //italic
                    'Add custom Woxrld',
                ]
                inside = <>
                    {woxrldList.map((woxrldItem, i) => <p
                        className={`woxrldItem 
                            ${i === 0 ? 'selected' :
                            ((i === 1 || i === woxrldList.length - 2) && 'italic')}`}
                        key={woxrldItem}>
                        <a>{woxrldItem}</a>
                    </p>)}
                </>
                break;
        }

        return <div className={`overlay overlay-${type}`}
                    ref={wrapperRef}
        >
            <div>{inside}</div>
        </div>
    }


    const xrButton = () => {
        const classes = {className:`xr-button ${isXR && 'xr-control exit-xr'} 
                    ${(!isXR && overlayOn === 'info') && 'xr-button-opacity'}`};
        const xrChildren = <>
            {isXR && 'Exit AR'}
            <img className="xr-button-r"  src="../button-r.svg" />
            <img className="xr-button-x" src="../button-x.svg" />
        </>;

        if(isVRsupported || isARsupported){
            return isVRsupported ?
                <VRButton {...classes}>{xrChildren}</VRButton>
                :
                <ARButton {...classes}>{xrChildren}</ARButton>
        }
        return <button {...classes} onClick={() => setShowXRUnsupport(true)}
            style={{transform: 'translateX(-50%)'}}
        >{xrChildren}</button>
    }
    return <>
        {showXRUnsupport && <div className="xr-unsupport">
            <div className="backdrop" onClick={() => setShowXRUnsupport(false)} />
            <div className="overlay">
                It looks like you are trying to access to the XR <i>(Extended Reality, meaning VR or AR)</i> mode
                from an unsupported browser or device.
                <br />
                <br />
                Please be sure to navigate this page:
                <ul>
                    <li>
                        <i>For Augmented Reality:</i>
                        <ul>
                            <li>
                                <i><b>iOS:</b></i><br/> while
                                using <a href="https://apps.apple.com/us/app/webxr-viewer/id1295998056" target="_blank">
                                    Mozilla's WebXR Browser
                                </a>.
                                <br/>
                                <small className="qr">
                                    <small>
                                        <a href="https://i.imgur.com/iVKI1aB.png" target="_blank">
                                            View QR to download.
                                        </a>
                                    </small>
                                </small>
                            </li>
                            <li>
                                <i><b>Android:</b></i><br/> while using
                                an <a href="https://developers.google.com/ar/devices#google_play_devices" target="_blank">
                                    ARCore ready device
                                </a>.

                            </li>
                        </ul>
                    </li>
                    <li>
                        <i>For Virtual Reality:</i>
                        <ul>
                            <li>using the internal browser on a device ready for VR, such as the Meta Quest family.</li>
                        </ul>
                    </li>
                </ul>
                <div style={{textAlign: 'center'}}>
                    <img src="/woxrlds.gif" alt="woxrlds-xr"/>
                </div>
            </div>
        </div>}
        <div className="header flex">

        <div className="header-xr-buttons">

            {!aboutOpen && xrButton()}

            {isXR && <>


                {xrMessage && <div className="xr-message">{xrMessage}</div>}

                {isARandPlacingPlanet && <><button id="xr-place-button"
                                           onClick={() => setIsPlanetPositionSet(true)}
                                           className="xr-control">
                        Set 🌐 position
                    </button>
                    <div className="xr-message">Move around to find where to set your 🌐</div>
                </>}
                {isPlanetPositionSet && <>
                    <button id="xr-move-button"
                            onClick={() => setIsPlanetPositionSet(false)}
                            className="xr-control">
                        Move 🌐
                    </button>
                    {xrHoveredIndex >= 0 ?
                        <button id="xr-pin-button"
                                onClick={() => setCurrentPointer(xrHoveredIndex)}
                                className="xr-control">
                            View 📍
                            <br/>
                            {xrHoveredIndex + 1}
                        </button>
                        :
                        <button id="xr-pin-button"
                                className="xr-control xr-button-opacity">
                            Point ➕
                            <br/>
                            to 📍
                        </button>
                    }
                </>}




            </>

            }

        </div>

        {(isVRsupported || (!isXR || isPlanetPositionSet)) && <>

            <div className="header-left flex">

                {overlayOn === 'menu' && <Overlay type={'menu'}/>}

                <div className="flex">
                    <button className={`menu ${isMenuOn && 'active'}`}
                            onClick={() => setOverlayOn(isMenuOn ? 'none' : 'menu')}>
                        <div>Menu</div>
                        <img className="logo" src="/logo.svg" alt="logo"/>
                    </button>
                </div>
                {!aboutOpen &&
                    <div className="current-world">

                        <button
                            className={`woxrld ${isWoxrldOn && 'active'}`}
                            onClick={() => setOverlayOn(isWoxrldOn ? 'none' : 'woxrld')}>
                            🌐 One Piece
                        </button>
                        {overlayOn === 'woxrld' && <Overlay type={'woxrld'}/>}
                    </div>
                }
            </div>

            {!aboutOpen &&
                <div className="header-right flex">
                    <div>
                        <div
                            className={`navigation flex ${!journeyStarted && 'navigation-cta'} ${isXR && 'navigation-xr'}`}>
                            {journeyStarted && <button className="navbutton left" onClick={() => updatePointer()}>
                                previous
                            </button>}
                            <button className={`navigation-title flex ${isInfoOn && 'active'}`}
                                    onClick={() => journeyStarted ? setOverlayOn(isInfoOn ? 'none' : 'info') : updatePointer(true)}
                            >
                                <p>
                                    <b>{journeyStarted && currentPointer + 1} </b>
                                    {journeyStarted && pointerInfo? <>
                                            {pointerInfo[i.name]} <small> {pointerInfo[i.type]}
                                        </small>
                                        </>
                                        :
                                        <span>Start Journey</span>
                                    }
                                </p>
                                {journeyStarted && <div className="navigation-info-icon"/>}
                            </button>

                            <button className="navbutton right" onClick={() => updatePointer(true)}>
                                next
                            </button>

                            {overlayOn === 'info' && <Overlay type={'info'}/>}
                        </div>

                    </div>

                </div>
            }
        </>
        }

    </div>
    {isXR && isPlanetPositionSet && <div className={`xr-reticle ${xrHoveredIndex >= 0 && 'xr-reticle-active'}`}></div>}
</>

}

export default Interface;