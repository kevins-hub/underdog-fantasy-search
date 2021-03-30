
import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import PlayerList from './PlayerList';
import axios from 'axios';

let pList = [];

class SearchPage extends React.Component {

    constructor(props) {
        super(props);
    
        this.state = {
          query: '',
          playerList: []
        };

        //this.handleInputChange = this.handleChange.bind(this);
        //this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange = e => {
        this.setState({
          query: e.target.value,
        });
    };

    handleSubmit = e => {
        e.preventDefault();
        
        //let pList = []
        const query = this.state.query;
    
        axios
          .get(`http://localhost:3000/searchPlayer`, {
              params: {
                  query: this.state.query
              }
          })

          .then(() => console.log('Search Submitted'))
          .then((response) => {
              //pList = response;
              
              console.log(response);
              if (typeof response !== 'undefined'){
                this.setState({
                    playerList: response
                  });
              }
          })
          .then(()=> {
              console.log(`playerList state  = ${this.state.playerList}`);
          })
          .catch(err => {
            console.error(err);
          });
          
        
        this.setState({
            playerList: pList
        });
        
    };

    render() {
        return (
            <>
            <h1>Player List</h1>
            <SearchBar 
             query={this.state.query} 
             onChange={this.handleInputChange}
             onSubmit={this.handleSubmit}
            />
            {/*<input type="submit" value="Submit" onClick={this.handleSubmit}/>*/}
            

            <PlayerList playerList={this.state.playerList}/>

          </>
        );
        
    }
}

export default SearchPage;