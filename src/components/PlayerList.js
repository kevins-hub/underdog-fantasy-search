
import React from 'react';

// add other fields to return?

const PlayerList = ({playerList}) => {
    
    const players = playerList.map( data => {

        return (
        
        <div className="Playerlist-player-result">
            <h1>{data.first_name}</h1>
        </div>
        
        )

    })

    if (playerList.length === 0){
        return (
            <>
            </>
        )
    } else {
        return (
            <div className="PlayerList-result-list">
                {players}
            </div>
        )
    }
};


export default PlayerList;