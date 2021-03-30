
import React from 'react';

// add other fields to return?

const PlayerList = ({playerList}) => {
    
    //console.log(typeof playerList);

    const players = playerList.map( (player) => {

        return (
        <div className="Playerlist-player-result">

            <h3>{player.first_name} {player.last_name}</h3>
            <p>id: {player.id}</p>            
            <p>name_brief: {player.name_brief}</p>
            <p>first_name: {player.first_name}</p>
            <p>last_name: {player.last_name}</p>
            <p>position: {player.position}</p>
            <p>age: {player.age}</p>
            <p>average_position_age_diff: {player.average_position_age_diff}</p>
            
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