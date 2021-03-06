import React from 'react';

const BarStyling = {width:"20rem",background:"#F2F1F9", border:"none", padding:"0.5rem"};

class SearchBar extends React.Component {

    
    render() {
        
        

        return(
            <form>
                <input 
                style={BarStyling}
                key="random1"
                value={this.props.query}
                placeholder={"Search Players"}
                onChange={this.props.onChange}
                />
                <input type="submit" value="Submit" onClick={this.props.onSubmit}/>
            </form>

        );

    }

}

  
  export default SearchBar;