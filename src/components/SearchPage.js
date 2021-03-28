
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
          //.then(() => console.log('Search Submitted'))
          .then((response) => {
              //pList = response;
              
              console.log(response);
              this.setState({
                playerList: response
              });
              
          })
          .catch(err => {
            console.error(err);
          });
        
        
        this.setState({
            playerList: pList
        });
        

        //console.log(pList);
        /*
         axios.get(`https://jsonplaceholder.typicode.com/users`)
         .then(res => {
           const persons = res.data;
           this.setState({ persons });
         })

         axios.get('/api', {
            params: {
              foo: 'bar'
            }
          });
        */
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
            <input type="submit" value="Submit" onClick={this.handleSubmit}/>
            
            <PlayerList playerList={this.state.playerList}/>
          </>
        );
        
    }
}

export default SearchPage;