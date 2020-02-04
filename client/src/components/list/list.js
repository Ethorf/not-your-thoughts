import React from "react";
import { connect } from "react-redux";
import '../../pages/main/main.scss'

const mapStateToProps = state => {
  return { articles: state.articles,
            wordCount:state.wordCount };
};

const ConnectedList = ({ articles, wordCount }) => (
  <ul className="main__list" >
      <h3>Flodsy:{wordCount}</h3>
    {articles.map(el => (
      <li key={el.id}>{el.title}</li>
    ))}
  </ul>
);

const List = connect(mapStateToProps)(ConnectedList);
export default List;