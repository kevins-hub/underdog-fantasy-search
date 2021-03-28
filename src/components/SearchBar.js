import React from 'react';

const BarStyling = {width:"20rem",background:"#F2F1F9", border:"none", padding:"0.5rem"};

class SearchBar extends React.Component {

    /*
    handleChange = (event) => {
        this.setState({
            query: event.target.value
        });
    };
    */

    handleSubmit = event => {
        event.preventDefault();
        this.props.handleFormSubmit(this.state.query)
    };
    
    render() {
        
        const keywords = "";

        const setKeywords = (word) => {
            keywords = word;
        }
        

        return(
            <input 
            style={BarStyling}
            key="random1"
            value={this.props.query}
            placeholder={"Search Players"}
            onChange={this.props.onChange}
           />

        );

    }

}

  
  export default SearchBar;