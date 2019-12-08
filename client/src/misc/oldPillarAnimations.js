//Pillar animation functions
pillarLeftStyleHeight = () =>{
    const testStyle = {
      height:`${(this.state.wordCount +1)*3.8}px`,
      bottom:`${(this.state.wordCount +1)*3.8}px`,
      opacity:`${this.state.wordCount/10}`
    };
    const limit = {
      height:`380px`,
      bottom:'380px'
    }
    if (this.state.wordCount <= this.state.pillar1WordLimit){
      return testStyle
    } else {
      return limit
    }
  }
  pillarTopStyleWidth = () =>{
    const testStyle = {
      width:`${(-97 + this.state.wordCount)*12.5}px`,
      left:'1px'
    };
    const start = {
      width:`0px`, left:'1px'
    }
    const limit = {
      width:`99%`, left:'1px'
    }
    if (this.state.wordCount <= this.state.pillar1WordLimit){
      return start
    } else if (this.state.wordCount >= this.state.pillar1WordLimit && this.state.wordCount <= this.state.pillar2WordLimit  ) {
      return testStyle
    }
    else{
      return limit
    }
  }
  pillarRightStyleHeight = () =>{
    const testStyle = {
      height:`${(-200 + this.state.wordCount )*3.6}px`
    };
    const start = {height:`0px`}
    const limit = {height:`380px`}
    if (this.state.wordCount <= this.state.pillar2WordLimit){
      return start
    } else if(this.state.wordCount >= this.state.pillar2WordLimit && this.state.wordCount <= this.state.pillar3WordLimit  ) {
      return testStyle
    }
    else{
      return limit
    }
  }
  pillarBottomStyleWidth = () =>{
    const testStyle = {
      width:`${-3850+(this.state.wordCount +1)*12.8}px`,
      left:`${5150 -( this.state.wordCount*12.8)}px`
      ,opacity:"1"
    };
    const start = {
      width:`0px`,left:'5120',opacity:"0"
    }
    const limit = {
      width:`1303px`,left:'20px'
    }
    if (this.state.wordCount <= this.state.pillar3WordLimit){
      return start
    } else if(this.state.wordCount >= this.state.pillar3WordLimit && this.state.wordCount <= this.state.pillar4WordLimit  ) {
      return testStyle
    }
    else{
      return limit
    }
  }