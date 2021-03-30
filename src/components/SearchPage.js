
import React from 'react';
import SearchBar from './SearchBar';
import PlayerList from './PlayerList';
import axios from 'axios';


class SearchPage extends React.Component {

    constructor(props) {
        super(props);
    
        this.state = {
          query: '',
          playerList: []
        };

    }

    handleInputChange = e => {
        this.setState({
          query: e.target.value,
        });
    };

    handleSubmit = e => {
        e.preventDefault();
       
        axios
        .get(`http://localhost:3000/searchPlayer`, {
            params: {
                query: this.state.query
            }
        })
        .then((response) => {

            if (typeof response !== 'undefined'){
                this.setState({
                    playerList: response.data
                });
            }
        })
        .catch(err => {
            console.error(err);
        });
          
        
    };

    render() {
        return (
            <>
            <h1>Player Search</h1>
            <SearchBar 
             query={this.state.query} 
             onChange={this.handleInputChange}
             onSubmit={this.handleSubmit}
            />
            

            <PlayerList playerList={this.state.playerList}/>

          </>
        );
        
    }
}

export default SearchPage;