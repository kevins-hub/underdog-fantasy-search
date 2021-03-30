
import React from 'react';

// add other fields to return?

const PlayerList = ({playerList}) => {
    
    //console.log(typeof playerList);

    const players = playerList.map( (player) => {

        return (
        <div className="Playerlist-player-result">
            <h1>{player.first_name}</h1>
        </div>
        
        )

    });

    if (playerList.length === 0){
        return (
            <>
            <p>Results here</p>
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