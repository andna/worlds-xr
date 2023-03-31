import React, {useEffect} from 'react'
import PlanetContainer from "./components/PlanetContainer";
import {UseAppContext} from "./AppContextProvider";
import {backupData} from "./scripts/backup";

function App(){

    const {
        dataItems: {setDataItems},
        poses: {  setPoses  },
        mapSrc: { setMapSrc },
        loadingArray: {setLoadingArray}
    } = UseAppContext();


    const setError = (error: any) => {
        console.error('Error:', error);
    }

    useEffect(() => {
        fetch('https://sheets.googleapis.com/v4/spreadsheets/1k9vL3dx7VpoY3JiFpC9pHNkMGA-51HlFOIaL9zWM8r8/values/IslandData?alt=json&key=AIzaSyCj_xMFwziPMYTCyLk9xRBulIFujU1Vc48', {
            method: 'GET', // or 'PUT'
            headers:{
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
            .catch(error => setError(error))
            .then(response => {
                let data;
                if(response && response.values){
                    data = response.values;
                } else {
                    data = backupData;
                }

                setLoadingArray((oldArray: any) => [...oldArray, 'data']);
                setMapSrc(data[0][1])
                const newPoses = data;
                newPoses.shift();
                newPoses.shift();
                setDataItems(newPoses);
                setPoses(newPoses.map((pos : any) => {
                    try{
                        const coordinatesIndex = 3;
                        const thisPos = pos[coordinatesIndex].replace(" ","").split(",");
                        return [thisPos[0], thisPos[1]];
                    } catch {
                        setError('pos')
                        return null;
                    }
                }))
            });

    }, []);

    return (<PlanetContainer/>);

}

export default App;