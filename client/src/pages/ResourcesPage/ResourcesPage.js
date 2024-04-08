import React from 'react'
import { connect } from 'react-redux'
import './ResourcesPage.scss'

class Resources extends React.Component {
  render() {
    return (
      <div className={`resources ${this.props.mode}`}>
        <header className={`resources__header ${this.props.mode}`}>Resources</header>
        <div className={`resources__content-container ${this.props.mode}`}>
          <div className="resources__container">
            <h2 className={`resources__title ${this.props.mode}`}>Mindfulness / Meditation</h2>
            <div className={`resources__content ${this.props.mode}`}>
              <a
                className={`resources__link ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}
                href="https://www.goodreads.com/book/show/18774981-waking-up?from_search=true&qid=zNQqbJOyJL&rank=7"
              >
                Waking Up - Sam Harris
              </a>
              <a
                className={`resources__link`}
                href="https://www.goodreads.com/book/show/18505796-10-happier?from_search=true&qid=R6HupReF24&rank=1"
              >
                10% Happier - Dan Harris
              </a>
              <a
                className={`resources__link ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}
                href="https://www.goodreads.com/book/show/143675.A_Path_with_Heart?from_search=true&qid=UxqcWdG09v&rank=1"
              >
                A Path With Heart - Jack Kornfield
              </a>
              <a
                className={`resources__link ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}
                href="https://www.goodreads.com/book/show/4129848-mastering-the-core-teachings-of-the-buddha?ac=1&from_search=true&qid=ayyECEbNYP&rank=1"
              >
                Mastering The Core Teachings of the Buddha - Daniel Ingram
              </a>
              <a
                className={`resources__link ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}
                href="https://www.goodreads.com/book/show/14096.Wherever_You_Go_There_You_Are?from_search=true&qid=SxMu9jgKoK&rank=2s"
              >
                Wherever You Go, There You Are - Jon Kabat-Zinn
              </a>
              <a
                className={`resources__link ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}
                href="https://www.goodreads.com/book/show/402843.Zen_Mind_Beginner_s_Mind?ac=1&from_search=true&qid=taWZGOddpp&rank=1"
              >
                Zen Mind, Beginners Mind - Shunryu Suzuki
              </a>
            </div>
          </div>
          <div className="resources__container">
            <h2 className={`resources__title ${this.props.mode}`}>Journaling</h2>
            <div className="resources__content">
              <a
                className={`resources__link ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}
                href="https://www.goodreads.com/book/show/615570.The_Artist_s_Way"
              >
                The Artist's Way - Julia Cameron
              </a>
              <a
                className={`resources__link ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}
                href="https://psychcentral.com/lib/the-health-benefits-of-journaling/"
              >
                The Health Benifits of Journaling
              </a>
              <a
                className={`resources__link ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}
                href="https://www.urmc.rochester.edu/encyclopedia/content.aspx?ContentID=4552&ContentTypeID=1"
              >
                Journaling for Mental Health
              </a>
              <a
                className={`resources__link ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}
                href="https://positivepsychology.com/benefits-of-journaling/"
              >
                83 Benifits of Journaling for Depression, Anxiety, and Stress
              </a>
            </div>
          </div>
          <div className="resources__container">
            <h2 className={`resources__title ${this.props.mode}`}>Gamification</h2>
            <div className="resources__content">
              <a
                className={`resources__link ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}
                href="https://www.goodreads.com/book/show/24611964-superbetter?from_search=true&qid=Ev57ON3sNl&rank=2"
              >
                Superbetter - Jane McGonigal
              </a>
              <a
                className={`resources__link ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}
                href="https://www.sciencedirect.com/science/article/pii/S074756321630855X"
              >
                How Gamification Motivates - Study
              </a>
              <a
                className={`resources__link ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}
                href="https://uwaterloo.ca/centre-for-teaching-excellence/teaching-resources/teaching-tips/educational-technologies/all/gamification-and-game-based-learning"
              >
                Gamification and Game-based Learning
              </a>
              <a
                className={`resources__link ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}
                href="https://educationaltechnologyjournal.springeropen.com/articles/10.1186/s41239-017-0042-5"
              >
                Gamification - What is Known
              </a>
              <a
                className={`resources__link ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}
                href="https://link.springer.com/article/10.1007/s10648-019-09498-w"
              >
                The Gamification of Learning - A Meta-analysis
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  mode: state.modes.mode,
})

export default connect(mapStateToProps)(Resources)
