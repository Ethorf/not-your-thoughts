  //Pillar animation functions
  export function pillarLeftStyleHeight(){
    const testStyle = {
      height:`${(this.state.wordCount +1)}%`,
      opacity:`${this.state.wordCount/40}`
    };
    const limit = {
      height:`100%`
    }
    if (this.state.wordCount <= this.state.pillar1WordLimit){
      return testStyle
    } else {
      return limit
    }
  }